//@module

exports.configure = function(configuration) {
	this.c.init();
}
exports.close = function() {
	this.c.close();
}
exports.get = function() {
    var raw = this.c.read();
	var result = new Object();
	result.raw = raw;
	result.celsius = (500 * (raw - 0.1));
	result.fahrenheit = (result.celsius * 1.8) + 32;
	return result;
}
