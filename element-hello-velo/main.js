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
import Pins from "pins";
import Wifi from "wifi";
import HTTPClientRequest from "HTTPClient";
import {
	WORK,
	HOME,
	OWNER,
	SO,
	BICYCLE
} from "configuration";
import {API_KEY} from "apikey";

/* =-====================================================================-= *//* =-========================== GOOGLE MAPS API =========================-= *//* =-====================================================================-= */
let URL = "https://maps.googleapis.com/maps/api/directions/json?origin=ORIGIN&destination=DESTINATION&departure_time=now&mode=bicycling&key=" + API_KEY;
let ORIGIN = WORK;
let DESTINATION = HOME;
let ETA = 0;

/* =-====================================================================-= *//* =-================================ GPS ===============================-= *//* =-====================================================================-= */
let GPS_ERR_THRESH = 20;
let lastLocation = HOME.location;

let timeToCheckAfter = 15; // Don't start checking until after 3pm
let timeToCheckBefore = 19; // Don't check after 7pm
let GOOGLE_MAPS_LINK = "https://www.google.com/maps/place/LAT,LONG/@LAT,LONG,17.35z";

let TIME = "TIME";
let HEADING_HOME_MSG = `Heading home! See you at ${TIME}. xoxox`;

/* =-====================================================================-= *//* =-======================== APPLICATION SET-UP ========================-= *//* =-====================================================================-= */var main = {	onLaunch() {		Pins.configure({			FONA: {				require: "FONA",				pins: {					ground: { pin: 9 },					power: { pin: 10 },					reset: { pin: 13 },					serial: { tx: 11, rx: 12 },					key: { pin: 14 },				},			},		}, success => this.onPinsConfigured(success));	},	onPinsConfigured(success) {				if (success) {			trace("Configured pins.\n");			this.configurationWaitInterval = Pins.repeat("/FONA/isConfigured", 15000, configured => {				if (configured) {					trace("FONA configured! Setting up polling...\n");					Pins.repeat("/FONA/getGPS",15000,GPS=>this.onGPS(GPS));
					Pins.repeat("/FONA/getMostRecentSMS",10000,SMS=>this.onSMS(SMS));					this.configurationWaitInterval.close(); // Stops repeated call to isConfigured function				}				else {					trace("FONA not configured yet...\n");				}			});		}		else 			trace("Failed to configure pins.\n");	},		isOnWiFi() {		let DISCONNECTED = 0;		let ON_WIFI = 1;		let AP = 2;		return Wifi.mode == ON_WIFI;	},
	whatHappened(success) {
		if (success.success) {
			trace("Command processed successfully.\n");
			for (var key in success.value) {			    let val = success.value[key];
			    trace(key + ":" + val + "\n");			}
		} else {
			trace(`Command failed: ${success.message}\n`);
		}
	},
/* =-====================================================================-= *//* =-================== FUNCTIONS RELATING TO WEB APIS ==================-= *//* =-====================================================================-= */	
	niceyNice(someString) {
	/* URI-encodes a string in a Google-friendly way */
		return encodeURIComponent(someString).replace(/%20/g,'+').replace(/%2C/g,',');
	},
	getETA(notifySO) {
	/* Asks Google for the estimated travel time from ORIGIN to DESTINATION and assigns the calculated value to ETA. */
		let origin = this.niceyNice(ORIGIN.name);
		let destination = this.niceyNice(DESTINATION.name);
		let url = URL.replace("ORIGIN",origin).replace("DESTINATION",destination);
		
		// Do this if the Kinoma Element is on WiFi
		if (this.isOnWiFi()) {
			this.request = new HTTPClientRequest(url);
			this.googleResponse = "";
			this.request.onDataReady = buffer => {				let body = String.fromArrayBuffer(buffer);
				this.googleResponse = this.googleResponse + body;
			}
			this.request.onTransferComplete = success => {
				if (success) {
					let responseData = JSON.parse(this.googleResponse);
					let expectedDuration = responseData.routes[0].legs[0].duration.value;
					ETA = new Date(Date.now() + expectedDuration);
					trace(`ETA at home, leaving now: ${ETA} \n`);
					if(notifySO) {
						let ETAString = ETA.getHours() + ":" + ETA.getMinutes();
						this.sendSMS(SO, HEADING_HOME_MSG.replace(TIME,ETAString));
					}
				} else {
					trace("Request failed.\n");	
				}
			}.bind(this).bind(notifySO);
			this.request.addHeader("Connection", "Close");			this.request.start();
		
		// Do this if the Kinoma Element is not on WiFi
		} else {
			let mapsDetails = { 
				url : url,
				firstText : "\"duration\" :",
				secondText : "}," 
			};
			Pins.invoke("/FONA/getURL", mapsDetails, return_val => function(return_val) {
				if (return_val.success) {
					let responseData = JSON.parse(return_val.value.response);
					let expectedDuration = responseData.duration.value;
					ETA = new Date(Date.now() + expectedDuration);
					trace(`ETA at home, leaving now: ${ETA} \n`);
					if (notifySO) {
						let ETAString = ETA.getHours() + ":" + ETA.getMinutes();
						this.sendSMS(SO, HEADING_HOME_MSG.replace(TIME,ETAString));
					}
				} else {
					trace(`Didn't manage to get the data. Response message: ${return_val.message}\n`);
				}
			}.bind(this).bind(notifySO));
		}	},

/* =-====================================================================-= *//* =-==================== FUNCTIONS RELATING TO GPS =====================-= *//* =-====================================================================-= */
	distanceBetween(from, to) {
	/* Function to find the difference between a pair of latitude/longitude coordinates from http://www.movable-type.co.uk/scripts/latlong.html */
		let R = 6371e3; // Radius of Earth, in meters	    let phi1 = this.toRadians(from.latitude);	    let phi2 = this.toRadians(to.latitude);	    let delphi = this.toRadians(to.latitude-from.latitude);	    let dellamb = this.toRadians(to.longitude-from.longitude);		    let a = Math.sin(delphi/2) * Math.sin(delphi/2) +	            Math.cos(phi1) * Math.cos(phi2) *	            Math.sin(dellamb/2) * Math.sin(dellamb/2);	    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));		    let d = R * c;
	    return d;
	},
	toRadians(degrees) {
		return degrees * Math.PI/180;
	},	
	inTimeWindow() {
	/* Returns true iff it is currently between timeToCheckAfter and timeToCheckBefore */
		let likeRiteNao = new Date();
		return timeToCheckAfter <= likeRiteNao.getHours() && likeRiteNao.getHours() < timeToCheckBefore;
	},
	closerToDestination(locationA, locationB) {
	/* Returns true iff locationA is closer to destination than locationB */
		return this.distanceBetween(locationA,DESTINATION.location) < this.distanceBetween(locationB,DESTINATION.location);
	},
	headingHome(location) {
	/* Returns true if the GPS appears to be moving from work to home in the designated time frame */
		if (!lastLocation.latitude){
			lastLocation = location;
			return false;
		}
		if (this.inTimeWindow() &&
			this.closerToDestination(location,lastLocation) && 
			this.closerToDestination(location,ORIGIN.location)) {
			trace("We appear to be heading towards our goal :D\n");
			lastLocation = location;
			return true;
		}
		lastLocation = location;
		return false;
	},
	haveMoved(GPS) {
		return this.distanceBetween(GPS,lastLocation) > GPS_ERR_THRESH;
	},
	onGPS(GPS) {
	/* Called when GPS pins are polled. Texts your SO if it's determined that you're heading home. */
		if (GPS.success) {
			let GPSValue = GPS.value;
			trace(`Got a GPS reading: ${GPSValue.latitude}, ${GPSValue.longitude}\n`);
			if (this.haveMoved(GPSValue)) {
				trace("We have moved!\n");
				if (this.headingHome(GPSValue)) {
					let notifySO = true;
					this.getETA(notifySO);
				}
				else {
					trace("Heading somewhere that's not home.\n");
				}
			} else {
				trace("Within error of previous GPS reading.\n");
			}
			lastLocation = GPSValue;
		} else {
			trace(`GPS failure: ${GPS.message}\n`);
		}
	},

/* =-====================================================================-= *//* =-==================== FUNCTIONS RELATING TO SMS =====================-= *//* =-====================================================================-= */
	googleMapsLink() {
	/* Creates and returns a link to Google map populated with the current latitude/longitude */
		let link = GOOGLE_MAPS_LINK.split("LAT").join(lastLocation.latitude);
		link = link.split("LONG").join(lastLocation.longitude);
		return link;
	},
	replyForSMS(message) {
	/* Parses an SMS message and generates a reply for it */
		message = message.toLowerCase();
		if (message.indexOf("hello") > -1 ||
			message.indexOf("hi") > -1) {
			return "Hello, " + OWNER.name + "!";	
		}
		if (message.indexOf("name") > -1) {
			return "You may call me " + BICYCLE.name + ". :)";
		}
		if (message.indexOf("bike") > -1 ||
			message.indexOf("where") > -1 ||
			message.indexOf("park") > -1) {
			return "I am parked here: " + this.googleMapsLink();	
		}
		if (message.indexOf("meaning of life") > -1) {
			return "42";
		}
		return "I can't understand your request. ;(";
	},
	isUnread(SMSValue) {
		return SMSValue.status.toLowerCase().indexOf("unread") > -1;
	},
	onSMS(SMS) {
	/* Called when an SMS arrives on the FONA */
		if (SMS.success) {
			let SMSValue = SMS.value;
			if (this.isUnread(SMSValue)) {
				let response = this.replyForSMS(SMSValue.text);
				this.sendSMS(SMSValue.sender,response);
			} else {
				trace("No unread messages.\n");
			}
		}
		else {
			trace("Failed to get SMS.\n");
		}
	},
	sendSMS(who, text) {
	/* Sends an SMS message to someone */
		if (who.number)
			Pins.invoke("/FONA/sendSMS", { message: text, address: who.number});
		else
			Pins.invoke("/FONA/sendSMS", { message: text, address: who});
	},};

export default main;