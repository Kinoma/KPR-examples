//@module

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
