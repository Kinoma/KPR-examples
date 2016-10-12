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
let CLIENT_ID = "Your cliend id goes here";
let CLIENT_SECRET = "Your secret goes here";
let REDIRECT_URI = "http://localhost";
let SCOPE = "https://www.googleapis.com/auth/plus.login";

let AUTHENTICATION_URL = "https://accounts.google.com/o/oauth2/auth";
let ACCESS_TOKEN_URL = "https://accounts.google.com/o/oauth2/token";

export function checkCredentialsValid(){
	if (CLIENT_ID.indexOf("Your cliend id goes here") >= 0) return false;
	if (CLIENT_SECRET.indexOf("Your secret goes here") >= 0) return false;
	return true;
};

export function authenticationUrl(scope, state){
	return AUTHENTICATION_URL + "?" + serializeQuery({
		response_type: 'code',
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		scope: scope ? scope : SCOPE,
		state: state ? state : "",
		include_granted_scopes: true,
	});
};


export function isRedirectUrl(message){
	return (message.authority === 'localhost');
};

export function accessTokenMessage(authorization_code){
	let message = new Message(ACCESS_TOKEN_URL);
	message.method = "POST";
	let body = serializeQuery({
		code: authorization_code,
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		redirect_uri: REDIRECT_URI,
		grant_type: 'authorization_code',
	});
	message.requestText = body;
	message.setRequestHeader("Content-Length", body.length);
	message.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	return message;
};
