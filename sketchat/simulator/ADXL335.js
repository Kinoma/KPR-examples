//@module

var PinsSimulators = require ("PinsSimulators");

exports.configure = function(configuration) {
	this.container = shell.delegate("addSimulatorPart", {
		id : 'ADXL335',
		behavior: PinsSimulators.PartColumnBehavior,
		header : { 
			label : this.id, 
			name : "ADXL335 - Accelerometer", 
			iconVariant : PinsSimulators.SENSOR_KNOB 
		},
		axes : [
			new PinsSimulators.FloatAxisDescription(
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
			new PinsSimulators.FloatAxisDescription(
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
			new PinsSimulators.FloatAxisDescription(
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
	shell.delegate("removeSimulatorPart", this.container);
}
exports.get = function() {
}
exports.setLED = function() {
}
