//@module
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

/*
For use with the Adafruit FONA 808 (supporting GSM and GPS)

Based on Adafruit's own FONA library for Arduino

Useful URLs
 	https://cdn-shop.adafruit.com/datasheets/SIM800+Series_GNSS_Application+Note+V1.00.pdf
 	https://cdn-shop.adafruit.com/product-files/2637/SIM800+Series_AT+Command+Manual_V1.09.pdf
	https://github.com/adafruit/Adafruit_FONA/blob/master/Adafruit_FONA.cpp
*/
var TRACE_COMMANDS = false;
var TRACE_ERRORS = false;
var DEBUG_COMMUNICATION = true;

var FONA808_V2 = 2;

// Ting APN details at https://help.ting.com/hc/en-us/articles/205428698-GSM-Android-APN-Settings
var apn = 'wholesale';
var apnusername = '';
var apnpassword = '';
var httpsredirect = false;
var useragent = "FONA";
var OK_REPLY = "OK";

var ENOUGH_BYTES = 500;
var JUST_OK_BYTES = 6;
// According to the docs, FONA commands widely vary in how long they take to complete
var SHORT_WAIT = 1000;
var A_BIT = 10000;
var ENOUGH_TIME = 30000;
var A_LONG_TIME = 45000;
var A_REALLY_LONG_TIME = 85000;

// A few commands that are reused in multiple places
var STORE_PROFILE = "AT&W";

exports.pins = {
	serial: {type: "Serial", baud: 9600},
	reset: {type: "Digital", direction: "output"},
	power: {type: "Power", voltage: 3.3},
	ground: {type: "Ground"},
	key: {type: "Ground"},
};

exports.configure = function( configuration ) {
	this.serial.init();
	this.reset.init();

	this.trace_comm = DEBUG_COMMUNICATION ? trace : this.nop;
	this.trace_cmd = TRACE_COMMANDS ? trace : this.nop;
	this.trace_err = TRACE_ERRORS ? trace : this.nop;

	this.configured = false;

	// Set up the communication
	setTimeout(this.begin_communication.bind(this),3000);
};

exports.isConfigured = function() {
	this.trace_comm(`isConfigured: ${this.configured}\n`);
	return this.configured;
}

exports.close = function() {
	this.serial.close();
	this.reset.close();
}

exports.toggleReset = function() {
	this.resetState = this.resetState^1;
	this.reset.write(this.resetState);
	this.resetCount += 1;
	if (this.resetCount == 1) {
		setTimeout(this.toggleReset.bind(this),10);
		return;
	}
	if (this.resetCount == 2) {
		setTimeout(this.toggleReset.bind(this),100);
		return;
	}
	if (this.resetCount == 3) {
		this.trace_comm("Toggling done...going to try to listen.\n");
		this.tryToListen();
	}
}


exports.tryToListen = function() {
	this.trace_comm("Listening...\n");
	let BEGIN_AT = "AT";
	let serialResponse = "";
	let BOOT_SEQUENCE_LENGTH = 250;
	do {
		serialResponse = this.serial.read("String",BOOT_SEQUENCE_LENGTH,SHORT_WAIT);
		this.trace_comm("got \"" + serialResponse + "\"\n");
	} while (serialResponse.length > 0);
	this.trace_comm("Reboot sequence has finished\n");
	
	// We can accept either an "OK" or an "AT" (if ECHO is still on)
	if (this.sendCheckReply(BEGIN_AT, BEGIN_AT).success || this.sendCheckReply(BEGIN_AT, OK_REPLY).success) {
		this.trace_comm("Got an ok response from AT\n");
		this.connected = true;
		this.timeout = 0;
	} else {
		this.trace_comm("AT didn't give us OK...\n");
	}
	if (this.timeout <= 0) {
		if (this.connected) {
			this.trace_comm("AT responded. We are go!\n");
			this.configureFONA();
		} else {
			this.trace_comm("Unable to get a response from AT :(\n");
		}
	} else {
		this.timeout -= 5000;
		setTimeout(this.tryToListen.bind(this),5000);
	}
}

// Initialize communication with the FONA
exports.begin_communication = function() {
	this.timeout = 30000;
	this.connected = false;

	this.trace_comm("Toggling reset on board.\n");

	this.resetState = 0;
	this.resetCount = 0;
	this.toggleReset();
}

// Configure Echo, Hangupitude, and SMS preferences
exports.configureFONA = function() {
	let return_val = this.createReturnObject();
	return_val.success = false;

	// Turn off Echo!
	let ECHO_OFF = "ATE0";
	if (! this.sendCheckReply(ECHO_OFF, OK_REPLY).success) {
		return_val.message = "Failed to configure Echo.";
		this.trace_comm(return_val.message);
		return return_val;
	}

	// Turn on hangupitude
	let HANGUPITUDE = "AT+CVHU=0";
	if (!this.sendCheckReply(HANGUPITUDE, OK_REPLY).success) {
		return_val.message = "Failed to configure Hangupitude, whatever that is.";
		this.trace_comm(return_val.message);
		return return_val;
	}

	this.type = FONA808_V2;

	// Turn on the bit that has the RI pin pull low when an SMS is received
	let ENABLE_SMS_NOTIFICATION = "AT+CFGRI=1";
	if (!this.sendCheckReply(ENABLE_SMS_NOTIFICATION, OK_REPLY).success) {
		return_val.message = "Failed to set up SMS notifications.";
		this.trace_comm(return_val.message);
		return return_val;
	}

	let enable = true;
	if (!this.enableGPS(enable).success) {
		return_val.message = "Failed to set up GPS.";
		this.trace_comm(return_val.message);
		return return_val;
	}

	if (!this.enableGPRS(enable).success) {
		return_val.message = "Failed to set up GPRS (data radio).";
		this.trace_comm(return_val.message);
		return return_val;
	}
	
	let TEST_SIGNAL_STRENGTH = "AT+CSQ";
	let SIGNAL_STRENGTH_RESPONSE_HEADER = "+CSQ: ";
	let RSSI_IDX = 0;
	let signal = this.sendParseReply(TEST_SIGNAL_STRENGTH, SIGNAL_STRENGTH_RESPONSE_HEADER, ",");
	if (signal[RSSI_IDX] < 4) {
		this.trace_comm("****Reception is crummy... careful!****\n");
	}

	this.configured = true;
	return_val.success = true;

	this.trace_comm("FONA configured successfully!\n");
	return return_val;
}


/* =-====================================================================-= *//* =-================================ SMS ===============================-= *//* =-====================================================================-= */
var TEXT_MODE_COMMAND = "AT+CMGF=1";
var SHOW_TEXT_MODE_PARAMS_COMMAND = "AT+CSDH=1";
var GET_MESSAGE_AT = "AT+CMGR=";

exports.ensureModeSetup = function() {
	let return_val = this.createReturnObject();
	return_val.success = false;
	
	// Text mode
	if (! this.sendCheckReply(TEXT_MODE_COMMAND, OK_REPLY)) {
		return_val.message = "can't get into text mode\n";
		return return_val;
	}
	// Show all text mode parameters
	if (! this.sendCheckReply(SHOW_TEXT_MODE_PARAMS_COMMAND, OK_REPLY)) {
		return_val.message = "text mode parameters are brokedy broke\n";
		return return_val;
	}
	return_val.success = true;
	return return_val;
}

exports.getSMSInterrupt = function() {
	let GET_SMS_INTERRUPT_QUERY = "AT+CFGRI?";
	let GET_SMS_INTERRUPT_RESPONSE_PREFIX = "+CFGRI: ";
	let IDX_INTERRUPT = 0;

	response = this.sendParseReply(GET_SMS_INTERRUPT_QUERY, GET_SMS_INTERRUPT_RESPONSE_PREFIX, ',');

	let return_val = this.createReturnObject();
	return_val.success = true;
	return_val.value =  response[IDX_INTERRUPT];
	return return_val;
}

exports.setSMSInterrupt = function(interrupt) {
	let SET_SMS_INTERRUPT_COMMAND = "AT+CFGRI=";
	return this.sendCheckReply(SET_SMS_INTERRUPT_COMMAND + interrupt, OK_REPLY);
}

exports.getNumSMS = function() {
	if (! this.ensureModeSetup()) return -1;

	// Ask how many SMS are stored
	let SMS_COUNT_COMMAND = "AT+CPMS?";
	let numsms = this.sendParseReply(SMS_COUNT_COMMAND, ',');
	numsms = numsms.map(function(elt,idx,arr) { return parseInt(elt); });
	let IDX_PREF_SMS_COUNT = 1;

	let return_val = this.createReturnObject();
	return_val.success = true;
	return_val.value = numsms[IDX_PREF_SMS_COUNT];
	return return_val;
}

// Against Adafruit's recommendation, we do use helpers here to get debug info printed
// this process is a lot less involved in JavaScript than in C++
exports.readSMS = function(idx) {
	if (! this.ensureModeSetup()) return false;

	let response = this.getReply(GET_MESSAGE_AT + idx, SHORT_WAIT);

	// Documentation here says that there may be some encoding on the message we
	// receive, but that doesn't appear to be implemented in Adafruit's code

	IDX_SMS = 2;
	IDX_HEADERS = 1;
	IDX_STATUS = 0;
	IDX_SENDER = 1;
	IDX_DATE = 3;
	IDX_TIME = 4;

	response = response.split("\n");
	let headers = response[IDX_HEADERS].split(',');
	let sender = headers[IDX_SENDER].replace(/"/g,"");;
	let status = headers[IDX_STATUS].split(": ")[1].replace(/"/g,"");;
	let time = headers[IDX_DATE]+" "+headers[IDX_TIME].replace(/"/g,"");;
	let sms = response[IDX_SMS];

	let return_val = this.createReturnObject();
	return_val.success = true;
	return_val.value =  {text:sms,idx:idx,sender:sender,status:status,time:time};
	return return_val;
}

exports.getMostRecentSMS = function() {
	let numSMS = this.getNumSMS();
	if (numSMS.success) {
		return this.readSMS(numSMS.value); // Note! FONA does not 0-index SMSes for some reason
	}
	return {};
}

exports.sendSMS = function(sms_object) {

	let return_val = this.createReturnObject();
	return_val.success = false;

	if (! this.ensureModeSetup().success) {
		return_val.message = "Mode not set for SMS";
		return return_val;
	}

	let SEND_COMMAND = "AT+CMGS=\"";
	let full_command = SEND_COMMAND + sms_object.address + "\"";
	let CONTINUE_RESPONSE = "> ";

	if (! this.sendCheckReply(full_command, CONTINUE_RESPONSE)) {
		return_val.message = "Didn't process right. No continue response for sending SMS";
		return return_val;
	}
	let SEND_SUCCESS = "+CMGS"; // The response will also say "OK", but we look for this.
	let CTRL_Z = "\x1A";

	let sent_ok = this.sendCheckReply(sms_object.message + "\n" + CTRL_Z, SEND_SUCCESS, ENOUGH_TIME);
	if (!sent_ok.success) {
		return_val.message = "Message didn't send right.";
		return return_val;
	}

	return_val.success = true;
	return return_val;
}

exports.deleteSMS = function(idx) {
	if (! this.ensureModeSetup()) return false;

	var CHECK_SMS_COMMAND = "AT+CMGD=";
	var DELETE_FLAG = 0;

	return sendCheckReply(DELETE_SMS_COMMAND + idx + "," + DELETE_FLAG, OK_REPLY);
}

/* =-====================================================================-= *//* =-================================ GPS ===============================-= *//* =-====================================================================-= */
exports.enableGPS = function(on_off) {
	let GPS_POWER_PREFIX = "AT+CGNSPWR";
	let currentState;

	// First check if it's already on or off
	currentState = this.sendParseReply(GPS_POWER_PREFIX + "?", "+"+GPS_POWER_PREFIX+": ")[0];
	currentState = (currentState == "1" ? true : false);

	if (currentState == on_off) return true;

	let suffix = (on_off ? "1" : "0");

	return this.sendCheckReply(GPS_POWER_PREFIX + "=" + suffix, OK_REPLY);
}

var GPS_BROKEN = -1;
var GPS_OFF = 0;
var GPS_NO_FIX = 1;
var GPS_2D = 2;
var GPS_3D = 3;

var GPS_INFO_REQUEST = "AT+CGNSINF";

exports.GPSstatus = function() {
	let GPS_STATUS_RESPONSE_PREFIX = "+CGNSINF: ";
	// 808 V2 uses GNS commands and doesn't have an explicit 2D/3D fix status.
	// Instead just look for a fix and if found assume it's a 3D fix.
	let response = this.getReply(GPS_INFO_REQUEST);
	let idx = response.indexOf(GPS_STATUS_RESPONSE_PREFIX);

	if (idx < 0) return GPS_BROKEN;

	response = this.parseReply(response, ',', GPS_STATUS_RESPONSE_PREFIX);

	let GPS_STATE = 0;
	let GPS_FIX_STATUS = 1;

	if (response[GPS_STATE] == '0') return GPS_OFF; // GPS is not even on!
	return this.statusFromCode(response[GPS_FIX_STATUS]);
}

exports.statusFromCode = function(code) {
	// Assume if the fix status is '1' then we have a 3D fix, otherwise no fix.
	if (code == '1') return GPS_3D;
	else return GPS_NO_FIX;
}

exports.getGPS = function() {
	let return_val = this.createReturnObject();

	// Grab the mode 2^5 gps csv from the sim808
	let response = this.getReply(GPS_INFO_REQUEST);

	// Make sure we have a response
	if (response.length == 0) {
		return_val.success = false;
		return_val.message = "no response!";
		return return_val;
	}

	// Parse 808 V2 response.See table 2-3 from here for format:
	// http://www.adafruit.com/datasheets/SIM800%20Series_GNSS_Application%20Note%20V1.00.pdf

	// Skip GPS run status
	response = response.split(",");
	if (response.length < 8) {
		return_val.success = false;
		return_val.message = "unable to parse response: " + response;
		return return_val;
	}

	let GPS_STATUS = 0;
	let GPS_FIX_STATUS = 1;
	let DATE = 2;
	let LATITUDE = 3;
	let LONGITUDE = 4;
	let ALTITUDE = 5;
	let SPEED = 6;
	let HEADING = 7;

	if (this.statusFromCode(response[GPS_FIX_STATUS]) < GPS_2D) {
		return_val.success = false;
		return_val.message = "fix insufficient for info";
		return return_val;
	}

	// Grab the lat/long
	let latitude = parseFloat(response[LATITUDE]);
	let longitude = parseFloat(response[LONGITUDE]);

	let altitude = parseFloat(response[ALTITUDE]);
	let speed = parseFloat(response[SPEED]);
	let heading = parseFloat(response[HEADING]);

	let gps = {latitude:latitude,
				longitude:longitude,
				altitude:altitude,
				speed:speed,
				heading:heading};

	return_val.value = gps;
	return_val.success = true;
	return return_val;

}

/* =-====================================================================-= *//* =-=============================== GPRS ===============================-= *//* =-====================================================================-= */
exports.disconnectGPRS = function(total) {
	let return_val = this.createReturnObject();
	return_val.success = false;

	let DISCONNECT_SOCKETS = "AT+CIPSHUT";
	let REALLY_LONG_WAIT = 65000; // This command can take up to 65 seconds to run!
	let DISCONNECT_SOCKETS_RESPONSE = "SHUT OK";
	if( ! this.sendCheckReply(DISCONNECT_SOCKETS, DISCONNECT_SOCKETS_RESPONSE, REALLY_LONG_WAIT, DISCONNECT_SOCKETS_RESPONSE.length).success ) {
		return_val.message = "Failed to disconnect sockets";
		return return_val;
	}

	if (total) {
		let CLOSE_GPRS_CONTEXT = "AT+SAPBR=0,1";
	    if ( ! this.sendCheckReply(CLOSE_GPRS_CONTEXT, OK_REPLY, ENOUGH_TIME, JUST_OK_BYTES).success ) {
			return_val.message = "Failed to close GPRS context";
			return return_val;
		}
	}

	let DETACH_FROM_GPRS_SERVICE = "AT+CGATT=0";
    if ( ! this.sendCheckReply(DETACH_FROM_GPRS_SERVICE, OK_REPLY, A_LONG_TIME, JUST_OK_BYTES).success ) {
		return_val.message = "Failed to detach from GPRS service";
		return return_val;
	}

	return_val.success = true;
	return return_val;
}

exports.enableGPRS = function(enable) {
	let return_val = this.createReturnObject();

	if (enable) {
	    if (! this.disconnectGPRS().success ) {
	    	return_val.message = "Unable to initialize by turning off previous connections";
			return return_val;
	    }

	    let SET_BEARER_PROFILE_TO_GPRS = "AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"";
	    if (! this.sendCheckReply(SET_BEARER_PROFILE_TO_GPRS, OK_REPLY, A_BIT).success) {
	    	return_val.message = "Unable to set bearer profile";
	    	return return_val;
	    }

	    // Set bearer profile access point name
		if (apn) {
			let SET_ACCESS_PROFILE_TO_APN = "AT+SAPBR=3,1,";
			if (! this.sendCheckReply(SET_ACCESS_PROFILE_TO_APN + "\"APN\",\"" + apn + "\"", OK_REPLY, A_BIT).success) {
	        	return_val.message = "unable to set profile to APN";
	        	return return_val;
	        }

	        let APN_SETUP_COMMAND = "AT+CSTT=";
	        let apn_setup_command = APN_SETUP_COMMAND + "\"" + apn + "\",\"" + apnusername + "\",\"\"" + apnpassword;
	        if (! this.sendCheckReply(apn_setup_command, OK_REPLY, A_BIT).success) {
	        	return_val.message = "Unable to set up APN details";
	        	return return_val;
      		}

		    // Set username/password
		    if (apnusername) {
		    	let set_username = SET_ACCESS_PROFILE_TO_APN + "\"USER\",\"" + apnusername + "\"";
		    	// Send command AT+SAPBR=3,1,"USER","<user>" where <user> is the configured APN username.
		      	if (! this.sendCheckReply(set_username, OK_REPLY, A_BIT).success) {
		        	return_val.message = "Unable to set up APN details (username)";
	        		return return_val;
		        }
		    }
		    if (apnpassword) {
		    	let set_password = SET_ACCESS_PROFILE_TO_APN + "\"PWD\",\"" + apnpassword + "\"";
		      	// Send command AT+SAPBR=3,1,"PWD","<password>" where <password> is the configured APN password.
		        if (! this.sendCheckReply(set_password, OK_REPLY, A_BIT).success) {
		        	return_val.message = "Unable to set up APN details (password)";
	        		return return_val;
		        }
		    }
	    }

	    // Open GPRS context
	    let OPEN_GPRS_CONTEXT = "AT+SAPBR=1,1";
	    if (! this.sendCheckReply(OPEN_GPRS_CONTEXT, OK_REPLY, A_REALLY_LONG_TIME, JUST_OK_BYTES).success) {
			return_val.message = "Unable to open GPRS context";
			return return_val;
		}

	    // Bring up wireless connection
	    let BRING_UP_WIRELESS = "AT+CIICR";
	    if (! this.sendCheckReply(BRING_UP_WIRELESS, OK_REPLY, A_BIT).success) {
			return_val.message = "Unable to bring up wireless";
			return return_val;
		}

	} else {
		let totalDisconnect = true;
  		return this.disconnectGPRS(totalDisconnect);
  	}
	return_val.success = true;
	return return_val;
}

exports.setGPRSNetworkSettings = function(new_apn, new_username, new_password) {
	apn = new_apn;
	apnusername = new_username;
	apnpassword = new_password;
}


/* =-====================================================================-= *//* =-=================== HTTP LOW-LEVEL FUNCTIONS =======================-= *//* =-====================================================================-= */
exports.HTTP_init = function() {
	let HTTP_INIT = "AT+HTTPINIT";
  	return this.sendCheckReply(HTTP_INIT, OK_REPLY);
}

exports.HTTP_term = function() {
	let HTTP_TERM = "AT+HTTPTERM";
	return this.sendCheckReply(HTTP_TERM, OK_REPLY);
}

exports.HTTP_para = function(parameter, value) {
	let HTTP_PARA = "AT+HTTPPARA=\"";
	return this.sendCheckReply(HTTP_PARA + parameter + "\",\"" + value + "\"", OK_REPLY);
}

exports.HTTP_action = function(action) {
	let return_val = this.createReturnObject();

	// Send request.
	let HTTP_ACTION = "AT+HTTPACTION=";

	// Parse response status and size.
	let response = this.getReply(HTTP_ACTION + action, ENOUGH_TIME);
	if (!response.includes(OK_REPLY)) {
		return_val.message = "HTTP request failed to send";
		return return_val;
	}
	// e.g. +HTTPACTION: 0,200,10467
	response = response.split(',');
	let STATUS_IDX = 1;
	let SIZE_IDX = 2;
	if (response.length < SIZE_IDX) {
		return_val.message = "Response didn't include the status and size: " + response.join(",");
		return return_val;
	}

	return_val.success = true;
	return_val.value = { status: response[STATUS_IDX], size: parseInt(response[SIZE_IDX]) };
	return return_val;
}

exports.HTTP_readall = function(datalen) {
	let return_val = this.createReturnObject();
	let HTTP_READ = "AT+HTTPREAD";
	let bufsize = datalen + 100;
	let response = this.getReply(HTTP_READ, A_BIT, bufsize);
	this.trace_comm("*****" + response + "*****\n");
	let curReply;
	do {
		curReply = this.readLine();
		response += curReply;
		this.trace_comm("*****" + curReply + "*****\n");
	} while (curReply != '');
	return_val.success = response.length >= datalen;
	if (!return_val.success) {
		return_val.message = "Data was shorter than expected.";
	}
	if (return_val.success) {
		response = response.split("+HTTPREAD: "+datalen)[1];
	}
	return_val.value = {response: response};
	return return_val;
}

// One issue with the Google Maps data is that the buffer is a bit too big for Kinoma Element.
// This function will only save the data that we need (namely, the duration data).
exports.HTTP_readbtwn = function(datalen, firstText, secondText) {
	let return_val = this.createReturnObject();
	let HTTP_READ = "AT+HTTPREAD";
	let SIZE_BUFFER = 20;
	this.sendMessage(HTTP_READ);
	let fullReply = '', curReply;
	let foundFirst = false, foundSecond = false;
	// This loop keeps all data until both texts are found.
	// It might be able to be rewritten to be more space-efficient (e.g., to throw away all data until
	// the firstText is seen), but this requires making some assumptions about the length of the
	// data relative to the chunks we're reading... I don't want to do that here.
	do {
		curReply = this.readLine(A_BIT);
		this.trace_comm("*****" + curReply + "*****\n");
		fullReply += curReply;
		let firstTextStart = fullReply.indexOf(firstText);
		if (firstTextStart >= 0) {
			foundFirst = true;
			this.trace_comm("Found first text :)\n");
		} else {
			firstTextStart = 0;
		}
		if (foundFirst) {
			fullReply = fullReply.substr(firstTextStart);
			let secondTextStart = fullReply.indexOf(secondText);
			if (secondTextStart >= 0) {
				this.trace_comm("Found second text :D\n");
				fullReply = fullReply.substr(0,secondTextStart+secondText.length);
				foundSecond = true;
			}
		}
	} while (curReply != '' && fullReply.length < datalen + SIZE_BUFFER && !foundSecond);
	// Clear out the buffer
	while (curReply != '') {
		curReply = this.readLine();
	}
	return_val.success = foundFirst && foundSecond;
	if (! (foundFirst && foundSecond) ) {
		return_val.message = "Did not find text in response";
	}
	return_val.value = {response: fullReply};
	return return_val;
}

exports.HTTP_ssl = function(enable) {
	let HTTP_SSL = "AT+HTTPSSL=";
	return this.sendCheckReply(HTTP_SSL + (enable ? 1 : 0), OK_REPLY);
}

/* =-====================================================================-= *//* =-========================= HTTP HELPERS =============================-= *//* =-====================================================================-= */
exports.HTTP_setup = function(url) {
	let return_val = this.createReturnObject();
	// Handle any pending
	this.HTTP_term();

	// Initialize and set parameters
	if (! this.HTTP_init().success) {
		return_val.message = "initialization failed";
		return return_val;
	}
	let USER_AGENT_PARAM = "UA";
	if (! this.HTTP_para(USER_AGENT_PARAM, "FONA").success ) {
		return_val.message = "user agent initialization failed";
		return return_val;
	}
	let URL_PARAM = "URL";
	if (! this.HTTP_para(URL_PARAM, url).success ) {
		return_val.message = "URL set failed";
		return return_val;
	}
	let HTTPS = "https://";
	if (! this.HTTP_ssl(url.includes(HTTPS)).success ) {
		return_val.message("failed to set up https :(");
		return return_val;
	}

	return_val.success = true;
	return return_val;
}

exports.getURL = function(getDescription) {
	let return_val = this.createReturnObject();

	if(!this.HTTP_setup(getDescription.url).success) {
		return_val.message = "failed to set up HTTP for request";
		return return_val;
	}

	let GET = 0;
	let got = this.HTTP_action(GET);
	if(!got.success) {
		return_val.message = "failed to GET HTTP address";
		return return_val;
	}

	if(got.value.status != "200") {
		return_val.message = "non-ok status: " + got.value.status;
		this.trace_comm("GET failed: " + return_val.message + "\n");
		return return_val;
	}

	let data;
	if (!getDescription.firstText && getDescription.secondText) {
		data = this.HTTP_readall(got.value.size);
		if (!data.success) {
			return_val.message = data.message;
			return return_val;
		}
	} else {
		data = this.HTTP_readbtwn(got.value.size, getDescription.firstText, getDescription.secondText);
		if (!data.success) {
			return_val.message = data.message;
			return return_val;
		}
	}

	return_val.success = true;
	return_val.value = data.value;
	return return_val;
}


/* =-====================================================================-= *//* =-=================== LOW-LEVEL COMMUNICATION=========================-= *//* =-====================================================================-= */
exports.createReturnObject = function() {
	return { success:false, message:"", value:"" };
}

// Throw away all available serial input
exports.flushInput = function() {
	let INSTANT_RETURN = 1;
	let stuff = this.serial.read("String",ENOUGH_BYTES,INSTANT_RETURN);
	this.trace_comm(`Throwing away "${stuff}"...${stuff.length} chars\n`);
}

// Send a message and get a response
exports.getReply = function(toSend, timeout) {
	if (!timeout) timeout = SHORT_WAIT;
	this.flushInput();
	this.sendMessage(toSend);

	let response = this.serial.read("String",ENOUGH_BYTES,timeout);
	this.trace_comm("\t<--- "+response+"\n");

	return response;
}

// Send a message and check that the response is what is expected
exports.sendCheckReply = function(message, response, timeout) {
	if (!timeout) timeout = SHORT_WAIT;
	this.flushInput();
	this.sendMessage(message);

	let actual = this.serial.read("String",ENOUGH_BYTES,timeout);
	this.trace_comm("\t<--- "+actual+" (" + actual.length + " chars)...looking for " + response+"\n");

	let return_val = this.createReturnObject();
	return_val.success = actual.includes(response);
	// Note from Valkyrie: this may not be the right way to do it.
	// However, the documentation indicates that most of the OK responses come after a
	// big block of information.

	return return_val;
}

// Send a message and return the stuff parsed out of it
exports.sendParseReply = function(toSend, toStrip, divider, timeout) {
	if (!toStrip) toStrip = "";
	if (!timeout) timeout = SHORT_WAIT;
	if (!divider) divider = ',';
	let response = this.getReply(toSend, timeout);
	this.flushInput(); // Eat 'OK'

	return this.parseReply(response, divider, toStrip);
}

exports.parseReply = function(response, divider, toStrip) {
	if (response.startsWith(toStrip)) {
		response = response.substr(toStrip.length);
	}
	let pieces = response.split(divider);

	return pieces;
}

exports.sendMessage = function(message) {
	this.serial.write(message + "\n");
	this.trace_comm("\t---> " + message);
}


exports.readLine = function(timeout, datalen) {
	if (!timeout) timeout = SHORT_WAIT;
	if (!datalen) datalen = ENOUGH_BYTES;
	var response = this.serial.read("String",datalen,timeout);
	return response;
}

exports.nop = function() {}
