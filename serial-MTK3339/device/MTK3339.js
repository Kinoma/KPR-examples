//@module
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

// https://learn.adafruit.com/adafruit-ultimate-gps/overview
// http://www.adafruit.com/datasheets/GlobalTop-FGPMMOPA6H-Datasheet-V0A.pdf
// http://www.adafruit.com/datasheets/PMTK_A11.pdf
// https://github.com/adafruit/Adafruit-GPS-Library

// Breakout GPS -> Kinoma Create
// VIN -> +5V
// GND -> GND
// RX -> Pin 31 TX
// TX -> Pin 33 RX

// Update rate sentences - controls serial output rate
var PMTK_SET_NMEA_UPDATE_100_MILLIHERTZ		= "$PMTK220,10000*2F"	// Once every 10 seconds, 100 millihertz.
var PMTK_SET_NMEA_UPDATE_200_MILLIHERTZ		= "$PMTK220,5000*1B"	// Once every 5 seconds, 200 millihertz.
var PMTK_SET_NMEA_UPDATE_1HZ				= "$PMTK220,1000*1F"	// Once every second
var PMTK_SET_NMEA_UPDATE_5HZ				= "$PMTK220,200*2C"		// Five times per second
var PMTK_SET_NMEA_UPDATE_10HZ				= "$PMTK220,100*2F"		// Ten times per second

// Position fix sentences - controls position fix rate
var PMTK_API_SET_FIX_CTL_100_MILLIHERTZ		= "$PMTK300,10000,0,0,0,0*2C"	// Once every 10 seconds, 100 millihertz.
var PMTK_API_SET_FIX_CTL_200_MILLIHERTZ		= "$PMTK300,5000,0,0,0,0*18"	// Once every 5 seconds, 200 millihertz.
var PMTK_API_SET_FIX_CTL_1HZ				= "$PMTK300,1000,0,0,0,0*1C"	// Once every second
var PMTK_API_SET_FIX_CTL_5HZ				= "$PMTK300,200,0,0,0,0*2F"		// Five times per second

// Output configuration sentences
// turn on RMC only
var PMTK_SET_NMEA_OUTPUT_RMCONLY			= "$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29"
// turn on GPRMC and GGA
var PMTK_SET_NMEA_OUTPUT_RMCGGA				= "$PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28"
// turn on ALL THE DATA
var PMTK_SET_NMEA_OUTPUT_ALLDATA			= "$PMTK314,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0*28"
// turn off output
var PMTK_SET_NMEA_OUTPUT_OFF				= "$PMTK314,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28"

exports.pins = {
	serial: {type: "Serial", baud: 9600}
};

exports.configure = function() {
	this.serial.init();
	
	// Return RMC output only
	sendCommand.call(this, PMTK_SET_NMEA_OUTPUT_RMCONLY);
	
	// Take a GPS fix once per second
	sendCommand.call(this, PMTK_API_SET_FIX_CTL_1HZ);
}

function sendCommand(command) {
	var line = command + "\r\n";
	this.serial.write(line);
}

exports.read = function() {
//	var response = "$GPRMC,064951.000,A,2307.1256,N,12016.4438,E,0.03,165.48,260406,3.05,W,A*2C" + "\r\n"; //@@
	var response = this.serial.read("String");
	var start = response.indexOf("$GPRMC");
	if (-1 == start) return;
	var end = response.indexOf("\r\n");
	if (-1 == end) return;
	var line = response.slice(start, end);
	var parts = line.split(',');
	if (parts.length != 13) return;
	
	// A = data valid, V = data invalid
	var status = parts[2];
	if ('A' != status) return;
	
	// ddmm.mmmm - e.g. 2307.1256
	var latitude = parts[3];
	var degree = Number(latitude.slice(0, 2)) * 10000000;
	var minutes = 50 * Number(latitude.slice(2, 4) + latitude.slice(5)) / 3;
	var latitude_fixed = degree + minutes;
	latitude = degree / 100000 + minutes * 0.000006;
	var latitudeDegrees = (latitude - 100 * Math.floor(latitude / 100)) / 60.0;
	latitudeDegrees += Math.floor(latitude / 100);

	var lat = 0;
	var NS = parts[4].charAt(0);
	if (NS == 'S')
		latitudeDegrees *= -1.0;
	if ((NS != 'N') && (NS != 'S')) {
		lat = 0;
		return;
	}
	lat = NS;

	//dddmm.mmmm - e.g. 12016.4438
	var longitude = parts[5];
	var degree = Number(longitude.slice(0, 3)) * 10000000;
	var minutes = 50 * Number(longitude.slice(3, 5) + longitude.slice(6)) / 3;
	var longitude_fixed = degree + minutes;
	longitude = degree / 100000 + minutes * 0.000006;
	var longitudeDegrees = (longitude - 100 * Math.floor(longitude / 100)) / 60.0;
	longitudeDegrees += Math.floor(longitude / 100);
	
	var lon = 0;
	var EW = parts[6].charAt(0);
	if (EW == 'W')
		longitudeDegrees *= -1.0;
	if ((EW != 'W') && (EW != 'E')) {
		lon = 0;
		return;
	}
	lon = EW;
	
	return {latitude: latitudeDegrees, longitude: longitudeDegrees };
}
