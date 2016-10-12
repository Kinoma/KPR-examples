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

import MODEL from 'mobile/model';
import CONTROL from 'mobile/control';

let sknGray = new Skin({ fill: "#757575" });
let sknDarkGray = new Skin({ fill: "#303030" });
let sknLightGray = new Skin({ fill: "#eee" });
let buttonSkin = new Skin({ fill: ['#ccc', '#FFC48A', '#FFA64D'] });
let buttonLabelStyle = new Style({ color: 'black', font: '24px bold Arial', horizontal: 'null', vertical: 'null' });
let sknWhite = new Skin({ fill: '#fff' });

let em = new Style({ color: 'black', font: '36px bold Arial', horizontal: 'null', vertical: 'null' });
let titleStyle = new Style({ color: 'black', font: '24px', horizontal: 'center', vertical: 'middle' });
let errorStyle = new Style({ color: 'red', font: '14px', horizontal: 'center', vertical: 'middle' });

var Menu = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: sknLightGray,
  contents: [
  	Column($, { width: 400,
      contents: [
    		Text($, { left: 0, right: 0, height: 80, style: errorStyle, }),
    		Container($, { left: 0, right: 0, height: 80, active: true, skin: buttonSkin,
          Behavior: class extends CONTROL.ButtonBehavior{
            onTap(container){
              container.invoke(new Message('/twitter/start'));
            }
          },
          contents: [
            Label($, { style: buttonLabelStyle, string: 'Twitter (OAuth 1.0a)', })
    		  ]
        }),
    		Container($, { left: 0, right: 0, top: 10, height: 80, active: true, skin: buttonSkin,
          Behavior: class extends CONTROL.ButtonBehavior{
            onTap(container){
              container.invoke(new Message('/google/start'));
            }
          },
          contents: [
            Label($, { style: buttonLabelStyle, string: 'Google (OAuth 2.0)', })
    		  ]
        })
  	 ]
   })
  ]
}));

let OAuthBrowserBehavior = class extends Behavior{};

var AuthenticatePane = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: sknDarkGray,
  contents: [
    (() => {
      var browser = $.BROWSER = new Browser({ left: 0, right: 0, top: 0, bottom: 70,  }, $.url);
      browser.behavior = new (class extends Behavior{
        onCreate(browser, data){
          this.data = data;
        }
        onLoaded(browser){
          if (browser.canBack) {
            this.data.BACK.visible = true;
          } else {
            this.data.BACK.visible = false;
          }
        }
        onInvoke(browser, message){
          if (this.data.isActionMessage(message)) {
            message.cancel();

            var action = this.data.action + '?' + message.query;
            browser.invoke(new Message(action));

            application.remove(application.last);
          }
        }
      })(browser, $);
      return browser;
    })(),
    Container($, { left: 10, right: 10, height: 50, bottom: 10, active: true, skin: buttonSkin,
      Behavior: class extends Behavior{
        onTap(container){
          container.invoke(new Message('/startover'));
        }
      },
      contents: [
        Label($, { style: buttonLabelStyle, string: 'Dismiss' })
      ]
    }),
    Container($, { left: 10, width: 50, height: 50, bottom: 10, active: true, visible: false, skin: sknLightGray, anchor: 'BACK',
      Behavior: class extends Behavior{
        onTap(container){
          var browser = this.data.BROWSER;
          browser.back();
        }
      },
      contents: [
        Label($, { style: buttonLabelStyle, string: 'Back' })
      ]
    })
  ]
}));

var UserPane = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: sknWhite,
  contents: [
    Column($, {
      contents: [
        Label($, { style: em, string: 'Nice to meet you' }),

        Picture($, { width: 128, height: 128, url: $.image }),

        Label($, { style: em, string: $.name })
      ]
    }),

    Container($, { left: 10, right: 10, height: 50, bottom: 10, active: true, skin: buttonSkin,
      Behavior: class extends Behavior{
        onTap(container){
          container.invoke(new Message('/startover'));
        }
      },
      contents: [
        Label($, { style: buttonLabelStyle, string: 'Try Again', }),
      ]
    })
  ]
}));

var ErrorContainer = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: sknLightGray, style: errorStyle,
  contents: [
    Column($, {
      contents: [
        Label($, { string: 'Bad news.' }),

        Label($, { string: 'Browser is not supported in your platform.' }),

        Label($, { style: titleStyle, string: $.platform })
      ]
    })
  ]
}));

let session = {}, container;

 if (["mac", "android", "iphone"].indexOf(system.platform) < 0) {
     container = new ErrorContainer({ platform: system.platform });
 } else {
     container = new Menu();
 }

 application.add(container);

 function setMessage(msg) {
     application.last.first.first.string = msg;
 }
 class startoverBehavior extends MODEL.CommandBehavior{
   onQuery(handler, query) {
     session = {};
     application.remove(application.last);
     application.add(new Menu());
   }
 }
Handler.bind("/startover", new startoverBehavior);

import TWITTER from 'twitter';
class twitterStartBehavior extends MODEL.CommandBehavior{
	onQuery(handler, query) {
    if (!TWITTER.checkCredentialsValid()) {
      setMessage("This example requires the 'CONSUMER_KEY' and 'CONSUMER_SECRET' variables in twitter.js file set to a valid client id and secret. See Twitter Developer Site.");
      return;
    }
    application.remove(application.last);
    // Step 1. Fetching request token
    var message = TWITTER.fetchRequestTokenMessage();
    handler.invoke(message, Message.TEXT);
  }
  onResponse(handler, query, message, response) {
    // Step 2. Store request token inside session
    TWITTER.gotRequestToken(session, response);

    // Step 3. Prepare inline web view for user authorization.
    var data = {
      url: TWITTER.authorizePageUrl(session),
      isActionMessage: function(message) {
        return (message.scheme == 'kinoma');
      },
      action: "/twitter/authorized"
    };
    var pane = new AuthenticatePane(data);

    // Step 4. Display web view to user.
    application.add(pane);
  }
  onError(handler, query, message, result){
    debugger;
  }
}
Handler.bind("/twitter/start", new twitterStartBehavior);
class twitterAuthorizedBehavior extends MODEL.CommandBehavior{
  onQuery(handler, query) {
    // Step 5. The user granted me to see tweets.
    var authorized = TWITTER.gotAuthorizeResponse(session, query);
    if (authorized) {
      // Step 5a. The user granted me to see tweets.
      trace("Authorization granted. Go on.\n");
      handler.invoke(new Message("/twitter/fetchAccessToken"));
    } else {
      // Step 5b. The user denied.
      trace("Authorization denied.\n");
    }
  }
}
Handler.bind("/twitter/authorized", new twitterAuthorizedBehavior);
class twitterFetchAccessTokenBehavior extends MODEL.CommandBehavior{
	onQuery(handler, query){
    // Step 6. Fetching access token
    var message = TWITTER.fetchAccessTokenMessage(session);
    handler.invoke(message, Message.TEXT);
  }
  onResponse(handler, query, message, response){
    // Step 7. Got access token
    var accessToken = TWITTER.gotAccessToken(response);
    // Optional.
    handler.invoke(new Message("/twitter/fetchUserInfo?" + serializeQuery(accessToken)));
  }
  onError(handler, query, message, result){
    debugger;
  }
}
Handler.bind("/twitter/fetchAccessToken", new twitterFetchAccessTokenBehavior);
class twitterFetchUserInfoBehavior extends MODEL.CommandBehavior{
	onQuery(handler, query) {
    // Step 1. Fetching user info. Access token is passed by query string
    var message = TWITTER.userInfoMessage(query);
    handler.invoke(message, Message.JSON);
  }
  onResponse(handler, query, message, response) {
  // Step 2. Got access user info
    var data = {
    image: response.profile_image_url,
    name: response.name,
    };

    application.add(new UserPane(data));
  }

  onError(handler, query, message, result) {
    debugger;
  }
}
Handler.bind("/twitter/fetchUserInfo", new twitterFetchUserInfoBehavior);

import GOOGLE from 'google';
class googleStartBehavior extends MODEL.CommandBehavior{
	onQuery(handler, query) {
    if (!GOOGLE.checkCredentialsValid()) {
      setMessage("This example requires the 'CLIENT_ID' and 'CLIENT_SECRET' variables in google.xml file set to a valid client id and secret. See Google Developers Console.");
      return;
    }

    application.remove(application.last);

    // Step 1. Display authentication web view to user.

    var scope = "https://www.googleapis.com/auth/plus.login";
    var url = GOOGLE.authenticationUrl(scope);

    var data = {
      url: url,
      isActionMessage: function(message) {
        trace(message.url + "\n");
        return GOOGLE.isRedirectUrl(message);
      },
      action: "/google/authorized"
    };
    var pane = new AuthenticatePane(data);

    application.add(pane);
  }
}
Handler.bind("/google/start", new googleStartBehavior);
class googleAuthorizedBehavior extends MODEL.CommandBehavior{
	onQuery(handler, query) {
    // Step 2. The user granted me to see info.
    if ('code' in query) {
      // Step 2a. The user granted.
      trace("Authorization granted. Go on.\n");

      // Step 3. Access to exchange authorization code and access token.
      var message = GOOGLE.accessTokenMessage(query.code);

      handler.invoke(message, Message.TEXT);
    } else {
      // Step 2b. The user denied.
      trace("Authorization denied.\n");
    }
  }
  onResponse(handler, query, message, response) {
    trace("Success: " + response + "\n");

    // Step 4. Got access token. Store info for later use.
    session = JSON.parse(response);

    // Optional
    handler.invoke(new Message("/google/userInfo"));
  }
  onError(handler, query, message, response) {
    trace("Stetus: " + message.status + "\n");
    trace("Failed: " + response + "\n");
  }
}
Handler.bind("/google/authorized", new googleAuthorizedBehavior);
class googleUserInfoBehavior extends MODEL.CommandBehavior{
	onQuery(handler, query) {
    // Example 1. To fetch the user info
    var url = 'https://www.googleapis.com/plus/v1/people/me?' + serializeQuery({
      access_token: session.access_token
    });

    var message = new Message(url);
    handler.invoke(message, Message.JSON);
  }
  onResponse(handler, query, message, response){
    var data = {
      image: response.image.url,
      name: response.displayName,
    };

    application.add(new UserPane(data));
  }
  onError(handler, query, message, result){
    debugger;
  }
}
Handler.bind("/google/userInfo", new googleUserInfoBehavior );
