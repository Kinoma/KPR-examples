//@module

exports.configure = function(configuration) {
    this.leftVoltage = new PINS.constructors.Digital({pin: 1026, direction: "output"});
    this.leftVoltage.init();
    this.leftVoltage.write(0);
	this.x.init();
	this.y.init();
	this.z.init();
}
exports.close = function() {
	this.x.close();
	this.y.close();
	this.z.close();
    this.leftVoltage.close();
}
exports.get = function() {
	var x = this.x.read();
	var y = this.y.read();
	var z = this.z.read();
	x = (x - 0.34) * 100;
	y = (y - 0.34) * 100;
	z = (z - 0.34) * 100;
	//trace(x + " " + y + " " + z + "\n");
	var orientation = -1;
	if (Math.abs(x) < 4) {
		if (y > 4)
			orientation = 2;
		else if (y < -4)
			orientation = 0;
	}
	else if (Math.abs(y) < 4) {
		if (x > 4)
			orientation = 1;
		else if (x < -4)
			orientation = 3;
	}
	//trace(orientation + "\n");
	return orientation;
}
