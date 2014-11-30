//@program

var touchSkin = new Skin({ fill: ["#00FFFFFF", "white" ] } );
var arrowsTexture = new Texture("./arrows.png");
var arrowsSkin = new Skin({ texture: arrowsTexture, x:0, y:0, width:200, height:200, variants:200, states:200 } );

var fadeBehavior = Object.create(Behavior.prototype, {
	onCreate: { value: function(content, data) {
		content.duration = 1500;
	}},
	onTimeChanged: { value: function(content) {
		content.state = 1 - Math.cubicEaseOut(content.fraction);
	}},
});

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#76b321" }),
	contents: [
		Content($, { anchor:"touch left", behavior:fadeBehavior, left:0, width:20, top:0, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch top", behavior:fadeBehavior, left:20, right:20, top:0, height:20, skin: touchSkin }),
		Content($, { anchor:"touch right", behavior:fadeBehavior, width:20, right:0, top:0, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch bottom", behavior:fadeBehavior, left:20, right:20, height:20, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch center", behavior:fadeBehavior, left:20, right:20, top:20, bottom:20, skin: touchSkin }),
		Content($, { anchor:"swipe to right", behavior:fadeBehavior, skin: arrowsSkin, variant:0 }),
		Content($, { anchor:"swipe to left", behavior:fadeBehavior, skin: arrowsSkin, variant:1 }),
		Content($, { anchor:"swipe down", behavior:fadeBehavior, skin: arrowsSkin, variant:2 }),
		Content($, { anchor:"swipe up", behavior:fadeBehavior, skin: arrowsSkin, variant:3 }),
	]
}});

Handler.bind("/hoverData", {
	onInvoke: function(handler, message) {
		var data = model.data;
		var it = message.requestObject;
		var content = data[it];
		content.state = 1;
		content.time = 0;
		content.start();
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onLaunch: { value: function(content) {
        var message = new MessageWithObject("pins:configure", {
            hover: {
                require: "hover",
                pins: {
                    ts: {pin: 23},
                    reset: {pin: 24},
                    data: {sda: 27, clock: 29}
                }
            }});
        application.invoke(message);

        message = new MessageWithObject("pins:/hover/read?repeat=on&callback=/hoverData&interval=16");
        application.invoke(message);

		this.data = { };
 		application.add(new Screen(this.data));
	}},
});
