//@program
/*
  Copyright 2014 DouZen, Inc.

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
var i2h = function(i)
{	var answer = Math.floor(i).toString(16);
	return answer;
}

//255 in -> 255 out:
var  HSVtoHex = function(h255,s255,v255)
{	var rgb = HSVtoRGB255(h255,s255,v255)
	return RGBtoHex(rgb[0], rgb[1], rgb[2]);
}	

var  RGBtoHex = function(r,g,b)
{	var hex= "#" + 
		this.i2h(r/16) + "" + this.i2h(r%16) + "" +
		this.i2h(g/16) + "" + this.i2h(g%16) + "" + 
		this.i2h(b/16) + "" + this.i2h(b%16);
	return hex;
}	

var  RGBAtoHex = function(r,g,b,a255)
{	var answer= "rgba(" +  r + "," + g + "," + b + ",.5" +  a255/255 + ")";
	return answer;
}	

var randomHexColorAlpha = function(a)				{return RGBAtoHex(rand(0,255), rand(0,255), rand(0,255), a);}
var randomHexColor 		= function()				{return RGBtoHex(rand(0,255), rand(0,255), rand(0,255));}
var randomHexColorDark 	= function()				{return RGBtoHex(rand(0,115), rand(0,115), rand(0,115));}
var randomHexColorMed 	= function()				{return RGBtoHex(rand(60,165), rand(60,165), rand(60,165));}
var randint 			= function( min, max ) 		{return Math.round( (Math.random() * (max - min)) + min );}

var HSVtoRGB255 = function (h255, s255, v255)
{	var h = h255*360/255;
	var s = s255/255;
	var v = v255/255;
	var rgb = [255,255,255];

    if(s <= 0) {       // < bad case - protect
        return rgb;
    }
  
    while(h <0) 	h += 360;
    while(h >= 360) h -= 360;
    h /= 60.0;
    var i = Math.floor(h);
    var ff = h - i;
    var p = v * (1 - s);
    var q = v * (1 - (s * ff));
    var t = v * (1 - (s * (1 - ff)));
	var r = 255;
	var g = 255;
	var b = 255;

    switch(i) {
    case 0:
        r = v;
        g = t;
        b = p;
        break;
    case 1:
        r = q;
        g = v;
        b = p;
        break;
    case 2:
        r = p;
        g = v;
        b = t;
        break;
    case 3:
        r = p;
        g = q;
        b = v;
        break;
    case 4:
        r = t;
        g = p;
        b = v;
        break;
    case 5:
    default:
        r = v;
        g = p;
        b = q;
        break;
    }
    
    rgb = [	Math.round(r*255),
    		Math.round(g*255),
    		Math.round(b*255)];
    
    return rgb;  
}  
