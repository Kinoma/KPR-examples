/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
export var dump = function() {
	if (!exports.active) return;

	var formatter = new Formatter();
	for (var i = 0, c = arguments.length; i < c; ++i) {
		trace(formatter.format(arguments[i]));
	}
}

export var active = true;

class Formatter {
	format(v) {
		this.lines = [];
		this.repo = [];

		this.formatValue(v, '', '', '');

		return this.lines.join("\n") + "\n";
	}
	toArray(args) {
		if (Array.isArray(args)) return args;

		var c = args.length;
		var result = new Array(c);
		for (var i = 0; i < c; i++) {
			result[i] = args[i];
		}
		return result;
	}
	append(line) {
		var args = this.toArray(arguments).map(function(v) { return Array.isArray(v) ? v : [v]});
		this.lines = this.lines.concat.apply(this.lines, args);
	}
	formatValue(v, indent, prefix, suffix) {
		var t = typeof v;

		if (v === undefined) {
			v = 'undefined';
		} else if (v === null) {
			v = 'null';
		} else if (v instanceof Chunk) {
			this.formatChunkValue(v, indent, prefix, suffix);
			return;
		} else if (v instanceof Array) {
			this.formatStructure(v, indent, prefix, suffix, '[', ']', function(a) {
				return a.map(function(val, index) { return [index, val] });
			});
			return;
		} else {
			if (t === 'object') {
				v = v.valueOf();
				t = typeof v;
			}

			switch (t) {
				case 'string':
					v = '"' + v + '"';
					break;

				case 'number':
					v = '' + v;
					break;

				case 'boolean':
					v = (v ? 'true' : 'false');
					break;

				case 'function':
					v = formatFunction(v);
					break;

				case 'object':
					this.formatStructure(v, indent, prefix, suffix, '{', '}', function(obj) {
						return Object.keys(obj).map(function(key) {
							return [key.toString(), obj[key]];
						}, this);
					});
					return;

				default:
					v = 'unknown ' + t + " (" + v.toString() + ")";
					break;
			}
		}

		this.append(indent + prefix + v + suffix);
	}
	checkInObject(v, indent, prefix, suffix, open, close) {
		var oid;
		this.repo.forEach(function(obj, index) { if (obj === v) oid = '#' + (index + 1); });
		if (oid) {
			this.append(indent + prefix + open + oid + close + suffix);
		} else {
			this.repo.push(v);
			return '#' + this.repo.length;
		}
	}
	formatChunkValue(v, indent, prefix, suffix) {
		prefix = indent + prefix + '< ' + v.length + " bytes";
		suffix = indent + ' >' + suffix;
		lines = formatChunk(v);
		if (indent) lines = lines.map(function(line) { return indent + line});
		this.append(prefix, lines, suffix);
	}
	formatStructure(v, indent, prefix, suffix, open, close, genpairs) {
		var oid = this.checkInObject(v, indent, prefix, suffix, open, close);
		if (oid) {
			this.append(indent + prefix + open + ' (' + oid + ')');

			var pairs = genpairs.call(this, v);
			var last = pairs.length - 1;
			pairs.forEach(function(pair, index) {
				var key = pair[0], val = pair[1];
				this.formatValue(val, indent + '  ', key + ': ', (index < last ? ',' : ''));
			}, this);

			this.append(indent + close + suffix);
		}
	}
}

function formatFunction(f) {
	for (var i = 0, c = f.length, vars = new Array(c); i < c; ++i) {
		vars[i] = 'v' + (i + 1);
	}
	return 'function(' + vars.join(', ') + ') { ... }';
}

function formatChunk(chunk,maxLines) {
	var len = chunk.length;
	var lines = [];
	var num = 16;

	var line = undefined, cs = undefined;
	for (var i = 0; i < len; ++i) {
		if (i % num == 0) {
			if (line) lines.push(line + '| ' + cs);
			line = "";
			cs = "";
			if (maxLines && lines.length >= maxLines) {
				lines.push("...");
				break;
			}
		}

		var n = chunk.peek(i);
		var c = Number(n).toString(16).toUpperCase();
		if (c.length == 1) c = '0' + c;

		line += c + " ";

		c = (n >= 0x20 && n < 0x80 ? String.fromCharCode(n) : '.');
		cs += c;
	}

	if (line) {
		while (line.length < (3 * num)) {
			line += "   ";
		}

		lines.push(line + '| ' + cs);
	}
	return lines;
}

export default {
	dump, active
}