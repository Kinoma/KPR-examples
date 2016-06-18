/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const CLIENT_ID="YOUR_CLIENT_ID";
const CLIENT_SECRET="YOUR_CLIENT_SECRET";
const REDIRECT_URI="https://localhost:8443/authresponse";

var ACCESS_TOKEN = "YOUR_ACCESS_TOKEN";
var REFRESH_TOKEN = "YOUR_REFRESH_TOKEN";

const BOUNDARY = "------------------------817ac683095ea5f8";
const FIRST_CHUNK = "--" + BOUNDARY + "\r\n"
				  + "Content-Disposition: form-data; name=\"request\"\r\n"
				  + "Content-Type: application/json; charset=UTF-8\r\n\r\n"
				  + `{ "messageHeader": {}, "messageBody": { "profile": "alexa-close-talk", "locale": "en-us", "format": "audio/L16; rate=16000; channels=1" } }`
				  + "\r\n\r\n--" + BOUNDARY + "\r\n"
				  + "Content-Disposition: form-data; name=\"audio\"\r\n"
				  + "Content-Type: audio/L16; rate=16000; channels=1\r\n\r\n"
const LAST_CHUNK = "\r\n--" + BOUNDARY + "--\r\n";

const MEDIA_URL = mergeURI(Files.documentsDirectory, "alexa.mp3");

Handler.Bind("/ask", class extends Behavior {
	onComplete(handler, message) {
		if (200 == message.status) {
			Files.writeBuffer(MEDIA_URL, message.responseBuffer);
			application.distribute("onAnswering");
		}
		else
			application.distribute("onAnswered");
	}
	onInvoke(handler) {
		let message = new Message("https://access-alexa-na.amazon.com/v1/avs/speechrecognizer/recognize");
		message.method = "POST";
		message.setRequestHeader("Authorization", "Bearer " + ACCESS_TOKEN);
		message.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
		message.setRequestHeader("Transfer-Encoding", "chunked");
		handler.uploadChunk(message, FIRST_CHUNK);
		
		model.handler = handler;
		model.message = message;
	}
});

var model = application.behavior = {
	onAsked() {
		this.handler.uploadChunk(this.message, LAST_CHUNK);
		this.handler.uploadChunk(this.message);
		this.message = null;
		this.handler = null;
	},
	onAsking() {
		application.invoke(new Message("/ask"));
	},
	onDisplaying() {
		if ("microphone" in this) {
			application.interval = 10;
			application.start();
		}
	},
	onLaunch() {
		if ("YOUR_CLIENT_ID" == CLIENT_ID || "YOUR_CLIENT_SECRET" == CLIENT_SECRET || "YOUR_ACCESS_TOKEN" == ACCESS_TOKEN || "YOUR_REFRESH_TOKEN" == REFRESH_TOKEN) {
			let errorStyle = new Style({ font:"24px", color:"black", horizontal:"middle", vertical:"center" });
			application.skin = whiteSkin;
			application.add(new Text({ string:"This application requires an Amazon developer account and Login With Amazon access tokens. You can sign up for a free account at developer.amazon.com", left:0, right:0, style:errorStyle }));
		}
		else {
			this.refreshToken();
			this.microphone = new PINS.constructors.Audio({ direction:"input", sampleRate:16000, channels:1 });
			this.microphone.init();
			this.microphone.start();
			application.add(new Screen(this));
		}
	},
	onQuit() {
		this.microphone.stop();
		this.microphone.close();
	},
	onTimeChanged() {
		let buffer = this.microphone.read();
		if (buffer.byteLength) {
			let samples = new Int16Array(buffer);
			let sum = samples.reduce((sum, x) => sum + (x * x), 0);
			let volume = Math.sqrt(sum / samples.length);
			this.CANVAS.behavior.onVolumeChanged(this.CANVAS, volume);
			if (this.handler && this.message)
				this.handler.uploadChunk(this.message, buffer);
		}
		if (this.when < Date.now())
			this.refreshToken();
	},
	refreshToken() {
		let uri = "https://api.amazon.com/auth/o2/token";
		let payload = {
			grant_type: "refresh_token",
			refresh_token: REFRESH_TOKEN,
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			redirect_uri: REDIRECT_URI
		};
		let body = JSON.stringify(payload);
		let message = new Message(uri);
		message.method = "POST";
		message.setRequestHeader("Content-Length", body.length);
		message.setRequestHeader("Content-Type", "application/json");
		message.requestText = body;
		message.invoke(Message.JSON).then(json => {
			ACCESS_TOKEN = json.access_token;
			REFRESH_TOKEN = json.refresh_token;
			this.when = Date.now() + (900 * json.expires_in);
		})
	},
};


const CYAN = "#6497ff";
const GREEN = "#7fbd3b";
const ORANGE = "#fe9d27";
const BLACK = "black";
const MASK = "#80FFFFFF";
const WHITE = "white";

const alexaTexture = new Texture("alexa.png", 1);
const alexaSkin = new Skin({ texture:alexaTexture, x:0, y:0, width:120, height:120, variants:120 });
const whiteSkin = new Skin({ fill:WHITE });

const BUTTON_RADIUS = 60;
const VOLUME_RANGE = 20000;

var Screen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:whiteSkin,
	contents: [
		Media($, {
			width:0, height:0,
			Behavior: class extends Behavior {
				onFinished(media) {
					media.stop();
					application.distribute("onAnswered");
				}
				onAnswering(media) {
					media.url = MEDIA_URL;
				}
				onLoaded(media) {
					media.volume = 0.9;
					media.start();
				}
				onTimeChanged(media) {
					let canvas = media.next;
					canvas.behavior.onTimeChanged(canvas, media.fraction);
				}
			},
		}),
		Canvas($, {
			anchor:"CANVAS", left:0, right:0, top:0, bottom:0,
			Behavior: class extends Behavior {
				clear(canvas) {
					let ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}
				onAnswered(canvas) {
					this.clear(canvas);
					canvas.state = 0;
				}
				onAnswering(canvas) {
					this.clear(canvas);
				}
				onAsked(canvas) {
					this.clear(canvas);
					canvas.state = 1;
				}
				onTimeChanged(canvas, fraction) {
					if (fraction) {
						let ctx = canvas.getContext("2d");
						let width = canvas.width;
						let height = canvas.height;
						let x = width >> 1;
						let y = height >> 1;
						let r = BUTTON_RADIUS + (BUTTON_RADIUS >> 1);
						ctx.clearRect(0, 0, width, height);
						ctx.fillStyle = CYAN;
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(x, y - r);
						ctx.arc(x, y, r, 0 - (Math.PI / 2), (2 * Math.PI * fraction) - (Math.PI / 2));
						ctx.closePath();
						ctx.fill();
					}
				}
				onVolumeChanged(canvas, volume) {
					if (!canvas.state) {
						let ctx = canvas.getContext("2d");
						let width = canvas.width;
						let height = canvas.height;
						let r = BUTTON_RADIUS + Math.round(BUTTON_RADIUS * volume / VOLUME_RANGE);
						ctx.fillStyle = MASK;
						ctx.fillRect(0, 0, width, height);
						ctx.lineWidth = 2;
						ctx.fillStyle = canvas.next.variant ? ORANGE : GREEN;
						ctx.beginPath();
						ctx.arc(width >> 1 ,height >> 1, r, 0, 2 * Math.PI);
						ctx.closePath();
						ctx.fill();
					}
				}
			},
		}),
		Content($, {
			left:0, right:0, top:0, bottom:0, skin:alexaSkin, variant:0, active:true, 
			Behavior: class extends Behavior {
				onAsking(content) {
					content.variant = 1;
				}
				onAsked(content) {
					content.variant = 2;
					content.active = false;
				}
				onAnswered(content) {
					content.variant = 0;
					content.active = true;
				}
				onTouchBegan(content) {
					if (content.variant == 0)
						application.distribute("onAsking");
					else if (content.variant == 1)
						application.distribute("onAsked");
				}
			},
		}),
	]
}));
