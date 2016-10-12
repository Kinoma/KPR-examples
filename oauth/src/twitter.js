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

import OAUTH from 'oauth';

let CONSUMER_KEY = 'Your consumer key goes here';
let CONSUMER_SECRET = 'Your consumer secret goes here';

// Setup consumer key and secret for Twitter application
let authorizer = new OAUTH.OAuth1.Authorizer(CONSUMER_KEY, CONSUMER_SECRET);

let BaseURL = 'https://api.twitter.com';
let CallbackUrl = "kinoma://twitter/oauth";

let RequestTokenURL = "https://api.twitter.com/oauth/request_token";
let AuthorizeURL = "https://api.twitter.com/oauth/authorize";
let AccessTokenURL = "https://api.twitter.com/oauth/access_token";

let UserInfoURL = 'https://api.twitter.com/1.1/account/verify_credentials.json';

export function checkCredentialsValid(){
if (CONSUMER_KEY.indexOf("Your consumer key goes here") >= 0) return false;
if (CONSUMER_SECRET.indexOf("Your consumer secret goes here") >= 0) return false;
return true;
};


export function fetchRequestTokenMessage(){
  let message = new Message(RequestTokenURL);
  message.method = "POST";
  message.requestText = "";

  authorizer.authorize(message, null, { "oauth_callback": CallbackUrl });

  return message;
}

export function gotRequestToken(session, response){
  let token = OAUTH.parseTokenResponse(response);

  session.requestToken = token;
}

export function authorizePageUrl(session){
  let params = {
    oauth_token: session.requestToken.token
  };
  console.log(session);
  return AuthorizeURL + "?" + serializeQuery(params);
}

export function gotAuthorizeResponse(session, query){
  if ('denied' in query) return false;

  session.verifier = query.oauth_verifier;
  return true;
}

export function fetchAccessTokenMessage(session){
  let message = new Message(AccessTokenURL);
  message.method = "POST";
  let body = serializeQuery({
    oauth_verifier: session.verifier
  });
  message.requestText = body;
  message.setRequestHeader("Content-Length", body.length);
  message.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  authorizer.authorize(message, session.requestToken);

  return message;
}


export function gotAccessToken(response){
  return OAUTH.parseTokenResponse(response);
}

export function userInfoMessage(accessToken){
  let message = new Message(UserInfoURL);
  message.method = "GET";
  message.requestText = "";

  authorizer.authorize(message, accessToken);

  return message;
}

let twitter = { checkCredentialsValid, fetchRequestTokenMessage, gotRequestToken, authorizePageUrl, 
gotAuthorizeResponse, fetchAccessTokenMessage, gotAccessToken, userInfoMessage };

export default twitter;
 