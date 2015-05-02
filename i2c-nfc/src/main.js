//@program
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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

var nfcTokenStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });
var infoStyle = new Style({ font:"bold 25px", color:"white", horizontal:"center", vertical:"bottom" });
var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });

var NFCScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#76b321" }),
	contents: [
        Label($, { left:0, right:0, top:0, bottom:0, style: nfcTokenStyle, string: $.token }),
        Label($, { left:0, right:0, top:0, bottom:0, style: infoStyle, string: $.count }),
        Label($, { left:0, right:0, top:0, bottom:30, style: infoStyle, string: $.lastTime })
	]
}});

var ErrorScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#f78e0f" }),
	contents: [
		Label($, { left:0, right:0, top:0, bottom:0, style: errorStyle, string:"Error " + $.error })
	]
}});

Handler.bind("/nfcTarget", {
	onInvoke: function(handler, message) {
		var data = model.data;
		var it = message.requestObject;
        data.token = it;
        data.read = false;
        data.written = false;
        application.replace(application.first, new NFCScreen({token: JSON.stringify(data.token), count: "", lastTime: ""}));

        if (data.token.length) {
            var message = new MessageWithObject("pins:/nfc/mifare_CmdRead", {page: 6, token: data.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]});
            handler.invoke(message, Message.JSON);
        }
	},
    onComplete: function(handler, message, result) {
		var data = model.data;

        if (!data.read) {
            data.read = true;

            if (result && (result.length >= 10)) {
                var bytes = result;

                if (('K' != String.fromCharCode(result[0])) || ('N' != String.fromCharCode(result[1])) ||
                    ('M' != String.fromCharCode(result[2])) || ('A' != String.fromCharCode(result[3])))
                    bytes = ['K'.charCodeAt(0), 'N'.charCodeAt(0), 'M'.charCodeAt(0), 'A'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                var count = (bytes[4] << 8) | bytes[5];
                count += 1;
                bytes[4] = (count >> 8) & 0xff;
                bytes[5] = count & 0xff;
             
                var lastTime = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
                var now = (Date.now() / 1000) | 0;
                bytes[6] = (now >> 24) & 0xff;
                bytes[7] = (now >> 16) & 0xff;
                bytes[8] = (now >>  8) & 0xff;
                bytes[9] = (now >>  0) & 0xff;

                var message = new MessageWithObject("pins:/nfc/mifare_CmdWrite", {page: 6, data: bytes, token: data.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]});
                handler.invoke(message, Message.JSON);

		        application.replace(application.first, new NFCScreen({token: JSON.stringify(data.token), count: "Times seen: " + (count - 1), lastTime: "Last seen: " + (new Date(lastTime * 1000))}));
            }
            else
		        application.replace(application.first, new NFCScreen({token: JSON.stringify(data.token), count: "(read error)", lastTime: ""}));
        }
        else if (!data.written) {
            data.written = true;
        }
    }
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message, text) {
		if (0 != message.error)
			application.replace(application.first, new ErrorScreen(message));
        else {
            application.invoke(new MessageWithObject("pins:/nfc/poll?repeat=on&callback=/nfcTarget&interval=100"));
            application.replace(application.first, new NFCScreen({token: "[]", count: "", lastTime: ""}));
        }
	}},
	onLaunch: { value: function(application) {
        var message = new MessageWithObject("pins:configure", {
            nfc: {
                require: "PN532",
                pins: {
                    data: {sda: 27, clock: 29}
                }
            }});
        application.invoke(message, Message.TEXT);

		this.data = { token: "(initializing)"};
        application.add(new NFCScreen({token: "Initializing", count: "", lastTime: ""}));
	}},
});
