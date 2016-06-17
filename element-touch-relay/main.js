import Pins from "pins";

var main = {
	onLaunch(){
		Pins.configure({
			touchSensor: {
				require: "Digital",
				pins:{
					power: {pin: 6, type: "Power"},
					ground: {pin: 8, type: "Ground"},
					digital: {pin: 7, direction: "input"},
				}
			},
			relay: {
				require: "Digital",
				pins:{
					power: {pin: 14, type: "Power"},
					ground: {pin: 15, type: "Ground"},
					digital: {pin:16, direction: "ouput"},	
				}
			},
		}, success => {
			let prevState = -1;
			let ledState = 0;
			Pins.repeat("/touchSensor/read", 100, result => {
				if ((prevState == 1) && (result == 0)) {
					ledState = !ledState;
					Pins.invoke("/relay/write", ledState);
				}
				prevState = result;
			});
		});
	},
}

export default main;