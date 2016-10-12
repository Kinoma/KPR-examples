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

class OAuth1Authorizer{
	consctructor(consumer_key, consumer_secret){
		this.consumer = {
			key: consumer_key,
			secret: consumer_secret
		};
	}
	authorize(message, authorization, more){
		let time = "" + Math.floor(Date.now() / 1000);
		let nonce = "" + Math.floor(1000000 * Math.random()) + time;

		this.authorizeWithTime(message, authorization, more, time, nonce);
	}
	authorizeWithTime(message, authorization, more, time, nonce){
		let params = this.oauthParams(authorization, more, time, nonce);
		params.oauth_signature = this.sign(message, params, authorization);

		let DST = 'OAuth ' + Object.keys(params).sort().map(function(key) {
			return key + '="' + encodeURIComponentRFC3986(params[key]) + '"';
		}).join(', ');

		message.setRequestHeader("Authorization", DST);
	}
	oauthParams(authorization, more, time, nonce){
		let params = {
			oauth_consumer_key: this.consumer.key,
			oauth_nonce: nonce,
			oauth_signature_method: "HMAC-SHA1",
			oauth_timestamp: time,
			oauth_version: "1.0"
		};

		if (more) {
			Object.keys(more).forEach(function(key) {
				params[key] = more[key];
			});
		}

		if (authorization && authorization.token) {
			params.oauth_token = authorization.token;
		}

		return params;
	}
	sign(message, params, authorization){
		let query = message.query ? message.query.split('&') : [];
		let body = message.requestText ? message.requestText.split('&') : [];

		let seeds = query.concat(body, Object.keys(params).map(function(key) {
			return key + '=' + encodeURIComponentRFC3986(params[key]);
		})).sort().join('&');

		let url = message.url.split('?')[0];

		let data = [
			message.method.toUpperCase(),
			encodeURIComponentRFC3986(url),
			encodeURIComponentRFC3986(seeds)
		].join('&');

		let signing_key = this.consumer.secret + '&';
		if (authorization && authorization.token_secret) {
			signing_key += authorization.token_secret;
		}

		let c= Crypt.SHA1;
		let hmac = new Crypt.HMAC(new Crypt.SHA1(), str2chunk(signing_key));
		return hmac.sign(data).toString();
	}
};

let str2chunk = function(str) {
	let chunk = new Chunk(str.length);
	for (let i = 0, c = str.length; i < c; i++) {
		chunk.poke(i, str.charCodeAt(i));
	}
	return chunk;
};

export function parseTokenResponse(response){
	let result = parseQuery(response);
	if  (!('oauth_token' in result)) return null;
	if  (!('oauth_token_secret' in result)) return null;

	return {
		token: result.oauth_token,
		token_secret: result.oauth_token_secret
	};
}

export const OAuth1 = {
	Authorizer: OAuth1Authorizer,
};

let oauth = { OAuth1 };
export default oauth;
