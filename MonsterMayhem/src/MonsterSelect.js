//@module

var img = [
	"NFCGuys-1.png",
	"NFCGuys-2.png",
	"NFCGuys-3.png",
	"NFCGuys-4.png",
	"NFCGuys-5.png",
	"NFCGuys-6.png",
	"NFCGuys-7.png",
	"NFCGuys-8.png",
	"NFCGuys-9.png",
	"NFCGuys-10.png",
	"NFCGuys-11.png",
	"NFCGuys-12.png",
	"NFCGuys-13.png",
	"NFCGuys-14.png",
	"NFCGuys-15.png",
	"NFCGuys-16.png",
];
 
var pictures = new Array(img.length);

/**********
 * Helper Templates
 */
 
var scroller = SCROLLER.HorizontalScroller.template(function($){

	return{
		top: 0, bottom:0, left:0,
		active: true,
		contents: [
			new Line({
				top: 0, bottom: 0, left:0, 
				contents: $.contents,
			}),
			new (SCROLLER.HorizontalScrollbar.template(function($) { return { 
				behavior: Object.create(SCROLLER.HorizontalScrollbarBehavior.prototype, {
					onScrolled: { value: function(scrollbar) {
						SCROLLER.HorizontalScrollbarBehavior.prototype.onScrolled.call(this, scrollbar);
						scrollbar.visible = true;
					}}
				}),
				
			}
			}))(),
		],
	}
});

var picContainer = Container.template(function($){

	return{
		top:0, bottom:0, left:0, right :0,
		contents:[
			new Picture({
				top: 0,bottom: 0, width:200,
				active: true,
				url: $.url,
				behavior: Behavior({
					onTouchBegan: function(contents) {
						contents.opacity = .6;
					}, 
					onTouchCancelled: function(contents) {
						contents.opacity = 1;
					},
					onTouchEnded: function(c) { return function(contents) {
						contents.opacity = 1;
						NFCHELP.writeData(JSON.stringify({"id":c, "tries":3}))
						var oldScreen = currentScreen;
						currentScreen = new CompleteScreen({url:"assets/" + img[c]});
						application.run(new TRANSITIONS.CrossFade(), oldScreen, currentScreen, {duration: 500});
					}} ($.i)
				}), 
			})
		],
	}
});

/**********
 * Successful Selection Screen
 */

var CompleteScreen = Column.template(function($) {

	return {
		top: 0, bottom: 0, left: 0, right: 0,
		behavior: Behavior({
			onNFCLost: function(container) {
				// go to the main screen
				var oldScreen = currentScreen;
				currentScreen = new HomeScreenTemplate;
				application.run(new TRANSITIONS.CrossFade(), oldScreen, currentScreen, {duration: 500});
			}
		}), 
		contents: [
			new Column({
				top: 0, left: 0, right: 0, bottom: 0, skin: new Skin({fill: "white"}),
				contents: [	
					new TitleLabel({string: "Go play the game!"}), 
					new Picture({
						top: 0, left:0, right:0, bottom:0,
						url: $.url
					}),
					new Label({
						left:0, right:0, height: 40,
						style: new Style({color: "white", font: "bold 30px fira sans", horizontal: "center", vertical: "center"}),
						string: "Come back if you forget!",
						skin: new Skin({ fill: "#76b321", stroke: "#f78e0f", borders: {top: 5}})
					})
				]
			})
		]
	}
});

/**********
 * Exported Monster Selection Screen
 */

exports.Screen = Column.template(function($) {

	for (var i = 0; i < img.length; i ++) {
		pictures[i] = new picContainer({ url: "assets/" + img[i], i: i })
	}
	
	return {
		top: 0, bottom: 0, left: 0, right: 0,
		skin: new Skin({fill:"white"}),
		behavior: Behavior({
			onNFCLost: function(container) {
				// go to the main screen
				var oldScreen = currentScreen;
				currentScreen = new HomeScreenTemplate;
				application.run(new TRANSITIONS.CrossFade(), oldScreen, currentScreen, {duration: 500});
			}
		}),
		contents: [
			new TitleLabel({string: "Tap Your Monster!"}),
			new Container({
				top: 0, left: 0, right: 0, bottom: 0,
				contents: [
					new scroller({
						contents: pictures
					}),
					new Container({
						bottom:0, left:0, right:0, height:10,
						skin: new Skin({ fill:"rgba(0,0,0,.2)" })
					}),
				]
			}),
		]
	}
});
