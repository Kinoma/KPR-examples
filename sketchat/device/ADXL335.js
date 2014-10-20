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
	var g2 = x*x + y*y + z*z;
	//trace(g2 + "\n");
	if (g2 > 250)
		return true;
}
