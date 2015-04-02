//@program

var keyboardSkin = new Skin({ fill: "green" });
var keySkin = new Skin({ fill: ["white", "silver"], stroke:"green", borders: {left: 1, right: 1, top: 1, bottom: 1} });

var Key = Content.template(function($) { return {
    top: 40, width: 38, height: 80, skin: keySkin,
    behavior: Behavior({
        onCreate: function(container, data) {
            this.frequency = data;
        },
    }),
}});

var Keyboard = Container.template(function($) { return {
    left: 0, right: 0, top: 0, bottom: 0, active: true, multipleTouch: true, skin: keyboardSkin,
    behavior: Behavior({
        updateFrequencies: function(container) {
            var frequencies = [];
            for (var content = container.first; content; content = content.next)
                if (content.state)
                    frequencies.push(content.behavior.frequency);

            if (0 == frequencies.length)
                application.invoke(new MessageWithObject("pins:/audio/setSequence", {
                    sequence: [
                        {samples: 200, frequencies: [523,660]},
                        {samples: 200, frequencies: [660,763]},
                        {samples: 200, frequencies: [763,880]}
                    ]
                }));
            else
                application.invoke(new MessageWithObject("pins:/audio/setFrequencies", frequencies));
        },
        hitIndex: function(container, x, y) {
            y -= container.y;
            if ((40 <= y) && (y < 120)) {
                x -= container.x;
                return Math.floor(x / 40);
            }
            return -1;
        },
        hitTouch: function(container, id, current) {
            var former = this.touches[id];
            if (former != current) {
                if (former >= 0)
                    container.content(former).state = 0;
                if (current >= 0)
                    container.content(current).state = 1;
                this.touches[id] = current;
                this.updateFrequencies(container);
            }	
        },
        onCreate: function(container, data) {
            this.touches = [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ];
        },
        onTouchBegan: function(container, id, x, y, tick) {
            this.hitTouch(container, id, this.hitIndex(container, x, y));
        },
        onTouchMoved: function(container, id, x, y, tick) {
            this.hitTouch(container, id, this.hitIndex(container, x, y));
        },
        onTouchEnded: function(container, id, x, y, tick) {
            this.hitTouch(container, id, -1);
        },
    }),
    contents: $.map(function(frequency, index) {
        return new Key(frequency, { left: index * 40 });
    }),
}});

application.behavior = Object.create(Object.prototype, {
   onLaunch: { value: function(application) {
        application.add(new Keyboard([523, 587, 660, 698, 783, 880, 988, 1046]));
        application.invoke(new MessageWithObject("pins:configure", {
            audio: {
                require: "synthOut",
                pins: {
                    speaker: {sampleRate: 8000, amplitude: 2048}
                }
            }}));

        application.invoke(new MessageWithObject("pins:/audio/synthesize?repeat=on&timer=speaker&callback=/getSamples"));
        application.invoke(new MessageWithObject("pins:/audio/start"));
    }}
});
