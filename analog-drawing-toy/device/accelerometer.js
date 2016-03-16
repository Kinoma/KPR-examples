//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

exports.pins = {
	x: { type: "Analog" },
    y: { type: "Analog" },
    z: { type: "Analog" }
};

exports.configure = function() {
	this.x.init();
    this.y.init();
    this.z.init();
}

exports.read = function() {
    return { x: this.x.read(), y: this.y.read(), z: this.z.read() };
}

exports.metadata = {
	sources: [
		{
			name: "read",
			result: 
				{ type: "Object", name: "result", properties:
					[
						{ type: "Number", name: "x" },
						{ type: "Number", name: "y" },
						{ type: "Number", name: "z" },
					]
				},
		},
	]
};

