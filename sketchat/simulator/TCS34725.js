//@module

var PartSimulators = require ("kdt/simulator/PartSimulators");

exports.configure = function(configuration) {
	this.container = shell.delegate("addSimulatorPart", {
		id : 'TCS34725',
		behavior: PartSimulators.PartColumnBehavior,
		header : { 
			label : this.id, 
			name : "TCS34725 - RGB Sensor", 
			iconVariant : PartSimulators.SENSOR_KNOB 
		},
		axes : [
			new PartSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "R",
					valueID : "r",
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
					valueLabel : "G",
					valueID : "g",
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
					valueLabel : "B",
					valueID : "b",
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
exports.getColor = function() {
    var value = this.container.delegate( "getValue" );
	var result = new Object();
	result.raw = new Object();
	result.raw.r = result.r = Math.round(value.r * 255);
	result.raw.g = result.g = Math.round(value.g * 255);
	result.raw.b = result.b = Math.round(value.b * 255);
	return result;
}
exports.setLED = function() {
}
