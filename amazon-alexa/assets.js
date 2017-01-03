/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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
export const BLACK = "black";
export const BLUE = "#4a90e2";
export const GREEN = "#7fbd3b";
export const ORANGE = "#fe9d27";
export const WHITE = "white";
export const GRAY = "#474747";

export const blueSkin = new Skin({ fill:BLUE });
export const whiteSkin = new Skin({ fill:WHITE });

export const alexaSkin = new Skin({ texture:new Texture("./assets/alexa.png", 1), x:0, y:0, width:120, height:120, variants:120 });

export const applicationStyle = new Style({ font:"Fira Sans", color:BLACK });
export const subtitleStyle = new Style({ size:30 });
