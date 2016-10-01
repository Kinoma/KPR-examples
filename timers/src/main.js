var blackSkin = new Skin({ fill: 'black',});
var redSkin = new Skin({ fill: 'red',});
var greenSkin = new Skin({ fill: 'green',});
var blueSkin = new Skin({ fill: 'blue',});
var yellowSkin = new Skin({ fill: 'yellow',});
var graySkin = new Skin({ fill: 'gray',});

var broadcastTexture = new Texture('./assets/streaming-icon.png', 1);
var broadcastSkin = new Skin({ texture: broadcastTexture, width: 50, height: 35, variants: 50 });
var purpleFrameSkin = new Skin({ borders: { left:2, right:2, top:2, bottom:2 }, stroke: 'purple' });
var labelStyle = new Style({ color: 'white', font: 'bold 18px', horizontal: 'center', vertical: 'middle' });

Handler.bind("/delay", Behavior({
	onInvoke: function( handler, message ) {
		var query = parseQuery( message.query );
		var duration = query.duration;
		handler.wait( duration )
	}
}));

var TimerContainer = Container.template($ => ({ width: 60, height: 60 }));

var MainContainer = Column.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, skin: blackSkin, 
	contents: [
		Line($, { top: 0, bottom: 0, contents: [
			TimerContainer($, { left: 0, skin: redSkin, anchor: 'ONESHOT', 
				behavior: Behavior({
					onCreate: function(container, data) {
						container.duration = 1000;
						container.first.string = 'Started';
						container.start();
					},
					onFinished: function(container) {
						container.first.string = 'Done';
					},
				}),
				contents: [
					Label($, { left: 0, right: 0, top: 0, bottom: 0, style: labelStyle, }),
				], 
			}),
			Content($, { width: 20, }),
			TimerContainer($, { right: 0, skin: greenSkin, anchor: 'INTERVAL', 
				behavior: Behavior({
					onCreate: function(container, data) {
						this.count = 0;
						container.interval = 500;
						container.first.string = this.count;
						container.start();
					},
					onTimeChanged: function(container) {
						container.first.string = ++this.count;
					},
				}),
				contents: [
					Label($, { left: 0, right: 0, top: 0, bottom: 0, style: labelStyle, }),
				], 
			}),
			Content($, { width: 20, }),
			TimerContainer($, { right: 0, skin: blueSkin, anchor: 'REPEATING', 
				behavior: Behavior({
					onCreate: function(container, data) {
						this.count = 0;
						container.interval = 500;
						container.duration = 2500;
						container.first.string = this.count;
						container.start();
					},
					onTimeChanged: function(container) {
						container.first.string = ++this.count;
					},
					onFinished: function(container) {
						this.count = 0
						container.first.string = this.count;
						container.time = 0;
						container.start();
					},
				}),
				contents: [
					Label($, { left: 0, right: 0, top: 0, bottom: 0, style: labelStyle, }),
				], 
			}),
		], }),
		Line($, { top: 0, bottom: 0, contents: [
			TimerContainer($, { left: 0, skin: yellowSkin, anchor: 'CONTAINER_WAIT', 
				behavior: Behavior({
					onCreate: function(container, data) {
						container.first.string = 'Waiting';
						container.wait(3000);
					},
					onComplete: function(container) {
						container.first.string = 'Done';
					},
				}),
				contents: [
					Label($, { left: 0, right: 0, top: 0, bottom: 0, style: labelStyle, }),
				], 
			}),
			Content($, { width: 20, }),
			TimerContainer($, { right: 0, skin: graySkin, anchor: 'HANDLER_WAIT', 
				behavior: Behavior({
					onCreate: function(container, data) {
						this.count = 0;
						this.container = container;
						container.first.string = 'Waiting';
						this.delay( 2000 );
					},
					onComplete: function(container) {
						container.first.string = ++this.count;
						this.delay( 500 );
					},
					delay: function(milliseconds) {
						this.container.invoke( new Message( "/delay?duration=" + milliseconds ), Message.TEXT );
					},
				}),
				contents: [
					Label($, { left: 0, right: 0, top: 0, bottom: 0, style: labelStyle, }),
				], 
			}),
			Content($, { width: 20, }),
			TimerContainer($, { right: 0, skin: broadcastSkin, variant: 0, 
				behavior: Behavior({
					onDisplaying: function(container) {
						container.interval = 2000;
						container.start();
					},
					onTimeChanged: function(container) {
						container.variant = (container.variant + 1) % 3;
					},
				}), 
				contents: [
					Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: purpleFrameSkin, }),
				], 
			}),
		], }),
	], 
}));

class AppBehavior extends Behavior {
	onLaunch(application) {
		application.add( new MainContainer({}));
	}
} 
application.behavior = new AppBehavior();