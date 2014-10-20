//@module

var PartSimulators = require ("kdt/simulator/PartSimulators");

exports.configure = function(configuration) {
	return
	this.container = shell.delegate("addSimulatorPart", {
		id : 'ADXL335',
		behavior: PartSimulators.PartColumnBehavior,
		header : { 
			label : this.id, 
			name : "ADXL335 - Accelerometer", 
			iconVariant : PartSimulators.SENSOR_KNOB 
		},
		axes : [
			new PartSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "X",
					valueID : "x",
					minValue : 0,
					maxValue : 1,
					value : 0.5,                                                 
					speed : 5
				}
			),
			new PartSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Y",
					valueID : "y",
					minValue : 0,
					maxValue : 1,
					value : 0.5,                                                 
					speed : 5
				}
			),
			new PartSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Z",
					valueID : "z",
					minValue : 0,
					maxValue : 1,
					value : 0.5,                                                 
					speed : 5
				}
			),
		]
	});
}
exports.close = function() {
	return
	shell.delegate("removeSimulatorPart", this.container);
}
exports.get = function() {
	return 3;
   var value = this.container.delegate( "getValue" );
	x = (value.x - 0.27) / 0.07;
	y = (value.y - 0.41) / 0.07;
	z = (value.z - 0.47) / 0.07;
	var orientation = -1;
	if (Math.abs(x) < 0.2) {
		if (y > 0.4)
			orientation = 0;
		else if (y < -0.4)
			orientation = 2;
	}
	else if (Math.abs(y) < 0.2) {
		if (x > 0.4)
			orientation = 3;
		else if (x < -0.4)
			orientation = 1;
	}
	return orientation;
}
exports.setLED = function() {
}
