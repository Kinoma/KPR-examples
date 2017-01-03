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
import {
	applicationStyle,
	whiteSkin
} from "assets";

import {
	AlexaScreen,
} from "alexa";

export const CLIENT_ID="YOUR_CLIENT_ID";
const CLIENT_SECRET="YOUR_CLIENT_SECRET";
const ACCESS_TOKEN = "YOUR_ACCESS_TOKEN";
const REFRESH_TOKEN = "YOUR_REFRESH_TOKEN";

class ApplicationBehavior extends Behavior {
	onCreate() {
		this.preferencesURI = mergeURI(Files.preferencesDirectory, application.di + ".json");
		this.configurations = [];

		this.accessToken = ACCESS_TOKEN;
		this.refreshToken = REFRESH_TOKEN;
		this.expiration = 0;
		this.sessionID = "";
		
		this.readPreferences();
	}
	onLaunch() {
		if ("YOUR_CLIENT_ID" == CLIENT_ID || "YOUR_CLIENT_SECRET" == CLIENT_SECRET || "YOUR_ACCESS_TOKEN" == ACCESS_TOKEN || "YOUR_REFRESH_TOKEN" == REFRESH_TOKEN) {			let errorStyle = new Style({ font:"24px", color:"black", horizontal:"middle", vertical:"center" });			application.skin = whiteSkin;			application.add(new Text({ string:"This application requires an Amazon developer account and Login With Amazon access tokens. You can sign up for a free account at developer.amazon.com", left:0, right:0, style:errorStyle }));			return;
		}		this.updateTokens(true);
	}
/* PREFERENCES */
	readPreferences() {
		try {
			let url = this.preferencesURI;
			if (Files.exists(url)) {
				let preferences = JSON.parse(Files.readText(url));
				if ("configurations" in preferences)
					this.configurations = preferences.configurations;
			}
		}
		catch(e) {
		}
	}
	writePreferences() {
		try {
			let url = this.preferencesURI;
			let preferences = { 
				configurations: this.configurations,
				expiration: this.expiration
			};
			Files.deleteFile(url);
			Files.writeText(url, JSON.stringify(preferences, null, 4));
		}
		catch(e) {
		}
	}
/* AMAZON */
	saveTokens(result) {
		this.accessToken = result.access_token;
		this.refreshToken = result.refresh_token;
		this.expiration = Date.now() + (900 * result.expires_in);
		this.writePreferences();
	}
	updateTokens(waiting) {
		let uri = "https://api.amazon.com/auth/o2/token";
		let payload = {
			grant_type: "refresh_token",
			refresh_token: this.refreshToken,
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
		};
		let body = JSON.stringify(payload);
		let message = new Message(uri);
		message.method = "POST";
		message.setRequestHeader("Content-Length", body.length);
		message.setRequestHeader("Content-Type", "application/json");
		message.requestText = body;
		message.invoke(Message.JSON)
		.then(result => {
			this.saveTokens(result);
			if (waiting)
				this.onReady();
		})
	}
	
/* SCREENS */
	onReady() {
		application.add(new AlexaScreen({}));
	}
}

export var model = application.behavior = new ApplicationBehavior(application, {});
application.style = applicationStyle;

