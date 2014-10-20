//@module

var PartSimulators = require ("kdt/simulator/PartSimulators");

exports.pins = {
	c: { type: "A2D" },
};

exports.configure = function(configuration) {
	return
	this.container = shell.delegate("addSimulatorPart", {
		id : 'LM35',
		behavior: PartSimulators.PartColumnBehavior,
		header : { 
			label : this.id, 
			name : "LM35 - Temperature", 
			iconVariant : PartSimulators.SENSOR_KNOB 
		},
		axes : [
			new PartSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Temperature",
					valueID : "raw",
					minValue : -0.5,
					maxValue : 0.5,
					value : 0,                                                 
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
 	return { fahrenheit: 72 }
	var value = this.container.delegate( "getValue" );
	var result = new Object();
	result.raw = value.raw;
	result.celsius = (100 * result.raw);
	result.fahrenheit = (result.celsius * 1.8) + 32;
	return result;
}
