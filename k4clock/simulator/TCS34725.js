//@module

var PartSimulators = require ("kdt/simulator/PartSimulators");

exports.configure = function(configuration) {
	return;
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
    this.index = 0;
    var values = this.values = new Array(4);
	for (var index = 0; index < 4; index++)
		values[index] = 0;
}
exports.close = function() {
	return;
	shell.delegate("removeSimulatorPart", this.container);
}
exports.getColor = function() {
	return 1;
    var value = this.container.delegate( "getValue" );
	var index = this.index;
	this.values[index] = (((value.r + value.g + value.b) / 3) > 128) ? 1 : 0;
	index++;
	if (index > 3)
		index = 0;
	this.index = index;
	var value = 0;
	for (var index = 0; index < 4; index++)
		value += this.values[index] 
	//trace("#" + value + "\n");
	if (value == 0)
		return 0;
	if (value == 4)
		return 1;
}
exports.setLED = function() {
}
