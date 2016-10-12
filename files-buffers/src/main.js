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

import THEME from 'mobile/theme';
import SCROLLER from 'mobile/scroller';
import CONTROL from 'mobile/control';

let blackSkin = new Skin({ fill: 'black' });
let toolsTexture = (screenScale == 2) ? new Texture('./assets/tools.png', 1) : (screenScale == 1.5) ? new Texture('./assets/tools.png', 1) : new Texture('./assets/tools.png', 1);
let toolsSkin = new Skin({ texture: toolsTexture, width: 32, height: 32, states: 32, });
let textLineStyle = new Style({ color: '#afff51', font: '20px', horizontal: 'left', vertical: 'null', });

let ExitButton = Container.template( $ => ({ left: 0, top: 0, active: true,
  Behavior: class extends CONTROL.ButtonBehavior{
    onTap(container) {
		    application.invoke(new Message("xkpr://shell/close?id=" + application.id));
    }
  },
  contents: [
    Content($, { skin: toolsSkin, })
  ]
}));

let MainContainer = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin,
  Behavior: class extends Behavior{
    onDisplayed(container){
    		fileReadWrite();
				directoryOperations();
				bufferOperations();
				jsonOperations();
				xmlOperations();
				directoryIterator();
  	}
  },
  contents: [
  	SCROLLER.VerticalScroller($, { left: 0, right: 0, top: 0, bottom: 0, anchor: 'SCROLLER',
      contents: [
    		Text($, { left: 5, right: 5, top: 5, style: textLineStyle,
          Behavior: class extends Behavior{
            onCreate(text, data){
          		text.string = "***** Files and Buffers Example *****\n";
          	}
          	onLog(text, string){
          		text.string += string + "\n";
          	}
          }
        }),

    		SCROLLER.VerticalScrollbar($, { }),
    	]
    }),
  	ExitButton($, { }),
  ]
}));

application.add( new MainContainer( {} ) );

let fileReadWrite = function() {
 try {
   let path1 = mergeURI(application.url, "./assets/lorem.txt");
   let info = Files.getInfo(path1);
   if (info.type != Files.fileType)
     throw("FAIL");
   let string1 = Files.readText(path1);
   let path2 = mergeURI(Files.temporaryDirectory, "./lorem.txt");
   Files.writeText(path2, string1);
   let string2 = Files.readText(path2);
   if (string1 != string2)
     throw("FAIL");
   Files.appendText(path2, "**appended**");
   string2 = Files.readText(path2);
   if (string1 + "**appended**" != string2)
     throw("FAIL");
   Files.deleteFile(path2);
   log("fileReadWrite PASS");
 }
 catch (e) {
   log("fileReadWrite FAIL");
 }
}
let directoryOperations = function() {
 try {
   let path1 = mergeURI(Files.temporaryDirectory, "example/");
   Files.ensureDirectory(path1);
   if (!Files.exists(path1))
     throw("FAIL");
   let info = Files.getInfo(path1);
   if (info.type != Files.directoryType)
     throw("FAIL");
   Files.renameDirectory(path1, "example2");
   let path2 = mergeURI(Files.temporaryDirectory, "example2/");
   if (Files.exists(path1))
     throw("FAIL");
   if (!Files.exists(path2))
     throw("FAIL");
   Files.deleteDirectory(path2);
   if (Files.exists(path2))
     throw("FAIL");
   log("directoryOperations PASS");
 }
 catch (e) {
   log("directoryOperations FAIL");
 }
}
let bufferOperations = function() {
 try {
   let path = mergeURI(Files.temporaryDirectory, "buffers/");
   Files.ensureDirectory(path);
   if (!Files.exists(path))
     throw("FAIL");
   let path1 = mergeURI(path, "./buffer");
   let buffer1 = new ArrayBuffer(10);
   let array1 = new Uint8Array(buffer1);
   for (let i = 0; i < 10; ++i)
     array1[i] = i;
   Files.writeBuffer(path1, buffer1);
   let buffer2 = Files.readBuffer(path1);
   let array2 = new Uint8Array(buffer2);
   for (let i = 0; i < 10; ++i) {
     if (array2[i] != array1[i])
       throw("FAIL");
   }
   let buffer3 = new ArrayBuffer(10);
   let array3 = new Uint8Array(buffer3);
   for (let i = 10; i < 20; ++i)
     array3[i-10] = i;
   Files.appendBuffer(path1, buffer3);
   let buffer4 = Files.readBuffer(path1);
   let array4 = new Uint8Array(buffer4);
   if (array4.length != array1.length + array3.length)
     throw("FAIL");
   for (let i = 0, c = array4.length; i < c; ++i) {
     if (array4[i] != i)
       throw("FAIL");
   }
   Files.deleteFile(path1);
   log("bufferOperations PASS");
 }
 catch (e) {
   log("bufferOperations FAIL");
 }
}
let jsonOperations = function() {
 try {
   let path1 = mergeURI(Files.temporaryDirectory, "example.json");
   Files.ensureDirectory(path1);
   let item1 = {fruit: "apple", color: "red"};
   Files.writeJSON(path1, item1);
   let item2 = Files.readJSON(path1);
   if (item1.fruit != item2.fruit || item1.color != item2.color)
     throw("FAIL");
   Files.deleteFile(path1);
   log("jsonOperations PASS");
 }
 catch (e) {
   log("jsonOperations FAIL");
 }
}
let xmlOperations = function() {
 try {
   let path1 = mergeURI(application.url, "./assets/person.xml");
   let document1 = Files.readXML(path1);
   let node, items = document1.getElementsByTagName("person");
   let name, address, city, state;
   if (items.length > 0) {
     node = items.item(0);
     name = node.getAttribute("name");
     if (!name || (name != "Brian")) throw("FAIL");
     items = node.getElementsByTagName("address");
     if (items.length > 0) address = items.item(0).firstChild.nodeValue;
     items = node.getElementsByTagName("city");
     if (items.length > 0) city = items.item(0).firstChild.nodeValue;
     items = node.getElementsByTagName("state");
     if (items.length > 0) state = items.item(0).firstChild.nodeValue;
   }
   path1 = mergeURI(Files.temporaryDirectory, "example.xml");
   Files.ensureDirectory(path1);
   Files.writeXML(path1, document1);

   let document2 = Files.readXML(path1);
   node, items = document2.getElementsByTagName("person");
   if (items.length > 0) {
     node = items.item(0);
     if (name != node.getAttribute("name"))
       throw("FAIL");
     items = node.getElementsByTagName("address");
     if (address != items.item(0).firstChild.nodeValue)
       throw("FAIL");
     items = node.getElementsByTagName("city");
     if (city != items.item(0).firstChild.nodeValue)
       throw("FAIL");
     items = node.getElementsByTagName("state");
     if (state != items.item(0).firstChild.nodeValue)
       throw("FAIL");
   }
   Files.deleteFile(path1);
   log("xmlOperations PASS");
 }
 catch (e) {
   log("xmlOperations FAIL");
 }
}
let directoryIterator = function() {
 try {
   iterateDirectory(mergeURI(application.url, "../"), 0);
   log("directoryIterator PASS");
 }
 catch (e) {
   log("directoryIterator FAIL");
 }
}
let iterateDirectory = function(path, level) {
 let space = "";
 for (let i = 0; i < 3 * level; ++i)
   space += " ";
 let info, iterator = new Files.Iterator(path);
 while (info = iterator.getNext()) {
   log(space + info.path);
 if (Files.directoryType == info.type) {
   iterateDirectory(path + info.path + "/", level + 1);
 }
 }
}
let log = function(string) {
 application.distribute("onLog", string);
}
