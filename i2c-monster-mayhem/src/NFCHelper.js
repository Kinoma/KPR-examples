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

exports.current = {
	id: []
}

exports.writeData = function(param) {
	var message = {
		command: "mifare_WriteString",
		commandParams: {
			page: 16,
			data: param,
			token: this.current.id,
			key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
		}
	};
	    
	application.invoke(new MessageWithObject("/sendPin", message));
}

exports.cardOnReader = function() {
	return this.current.id.length > 0;
}

/**********
 * HANDLERS
 */

Handler.bind("/sendPin", {
    onInvoke: function(handler, message) {
        var request = message.requestObject;
        handler.invoke(new MessageWithObject("pins:/nfc/" + request.command, request.commandParams), Message.JSON);
    },
});

Handler.bind("/nfc", {
	onInvoke: function(handler, message) {
		var msg = message.requestObject;
		
		if (msg.token) {
			try {
				if (msg.commandData !== "") {
					msg.commandData = JSON.parse(msg.commandData);
				}
				exports.current.id = msg.token;
			} catch (e) {
				trace("JSON parse error\n")
			}
			application.distribute("onNFCFound", msg);
		} else {
			exports.current.id = [];
			application.distribute("onNFCLost");
		}
    }
});
