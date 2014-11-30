//@module
exports.pins = {
    ts: {type: "Digital", direction: "input"},
    reset: {type: "Digital", direction: "output"},
    data: {type: "I2C", address: 0x42},
}

exports.configure = function(configuration) {
    this.tsPin = configuration.pins.ts.pin;

    this.ts.init();
    this.reset.init();
    this.data.init();

    this.reset.write(0);
    this.reset.direction = "input";

    sensorUtils.delay(1);
}

exports.close = function() {
    this.ts.close();
    this.reset.close();
    this.data.close();
}

exports.read = function() {
    var result;

    if (this.ts.read())
        return;

    try {
        this.ts.direction = "output";
        this.ts.write(0);

        var busData = this.data.readBlockDataSMB(0, 18, "Array");

        var gestureEvent = busData[10];
        if (gestureEvent > 1) {
            switch (gestureEvent) {
                case  2: result = "swipe to right"; break;
                case  3: result = "swipe to left"; break;
                case  4: result = "swipe up"; break;
                case  5: result = "swipe down"; break;
                default: result = "mystery swipe 0x" + gestureEvent.toString(16); break;
            }
        }

        var touchEvent = ((busData[14] & 0xE0) >>> 5) | ((busData[15] & 0x03) << 3);
        if (touchEvent > 0) {
            switch (touchEvent) {
                case  1: result = "touch bottom"; break;
                case  2: result = "touch left"; break;
                case  4: result = "touch top"; break;
                case  8: result = "touch right"; break;
                case 16: result = "touch center"; break;
                default: result = "mystery touch 0x" + busData[14].toString(16) + ", 0x" + busData[15].toString(16); break;
            }
        }
    }
    catch (e) {
        result = "error";
    }
    finally {
        this.ts.write(1);
        this.ts.direction = "input";
    }

    return result;
}
