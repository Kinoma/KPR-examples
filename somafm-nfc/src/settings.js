/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
*/   

/* Enter your own PubNub credentials here */
export var PUBNUB_PUBLISH_KEY = "YOUR_PUB_KEY_HERE";
export var PUBNUB_SUBSCRIBE_KEY = "YOUR_SUB_KEY_HERE";
export var PUBNUB_CHANNEL = "YOUR_CHANNEL_NAME_HERE";

/* Edit channel settings here */
export var channels = [
	{ token:[0, 0, 0, 0], id: "covers", title: "Covers", description: "Just Covers, songs you know only not by the original artists. We've got you covered.", screen_name: "covers" },
	{ token:[80,237,85,11], id: "indiepop130", title: "Indie Pop Rocks!", description: "New and favorite classic indie pop tracks.", screen_name: "indiepop" },
	{ token:[227,104,22,208], id: "secretagent", title: "Secret Agent", description: "The soundtrack for your stylish, mysterious, dangerous life. For Spies and PIs too!", screen_name: "secretagent" },
	{ token:[3,0,0,0], id: "groovesalad", title: "Groove Salad", description: "A nicely chilled plate of ambient beats and grooves.", screen_name: "groovesalad" },
	{ token:[4,0,0,0], id: "dronezone", title: "Drone Zone", description: "Served best chilled, safe with most medications. Atmospheric textures with minimal beats.", screen_name: "dronezone" },
	{ token:[5,0,0,0], id: "missioncontrol", title: "Mission Control", description: "Live and historic NASA mission audio mixed with electronic ambient.", screen_name: "missioncontrol" },
	{ token:[96,95,35,17], id: "suburbsofgoa", title: "Suburbs of Goa", description: "Desi-influenced Asian world beats and beyond.", screen_name: "suburbsofgoa" },
	{ token:[112,205,28,1], id: "lush", title: "Lush", description: "Sensuous and mellow vocals, mostly female, with an electronic influence.", screen_name: "lush" },
	{ token:[8,0,0,0], id: "tags", title: "Tag's Trip", description: "Progressive house / trance. Tip top tunes.", screen_name: "tags" },
	{ token:[180,12,210,81], id: "u80s", title: "Underground 80s", thumbnail: "u80s-120.png", description: "Early 80s UK Synthpop and a bit of New Wave.", screen_name: "u80s" },
	{ token:[10,0,0,0], id: "sonicuniverse", title: "Sonic Universe", description: "A mix of avant garde jazz, euro jazz and nu jazz. Eclectic takes on traditional jazz.", screen_name: "sonicuniverse" },
	{ token:[11,0,0,0], id: "digitalis", title: "Digitalis", description: "Digitally affected analog rock to calm the agitated heart. Screengazing encouraged. ", screen_name: "digitalis" },
	{ token:[39,166,65,175], id: "poptron", title: "PopTron!", description: "Electropop and indie dance rock with sparkle and pop.", screen_name: "poptron" },
	{ token:[13,0,0,0], id: "bootliquor", title: "Boot Liquor", description: "Americana roots music with a bit of attitude. For Cowhands, Cowpokes and Cowtippers.", screen_name: "bootliquor" },
	{ token:[14,0,0,0], id: "beatblender", title: "Beat Blender", description: "A late night blend of deep-house and downtempo chill.", screen_name: "beatblender" },
	{ token:[15,0,0,0], id: "doomed", title: "Doomed", description: "Dark music for tortured souls. A haunted industrial/ambient soundtrack.", screen_name: "doomed" },
	{ token:[], id: "", title: "Off", thumbnail: "", description: "", screen_name: "" },
];