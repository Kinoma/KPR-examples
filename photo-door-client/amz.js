/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import credentials from "credentials";
let AWS = require("aws");

var str2chunk = function(str) {	var chunk = new Chunk(str.length);	for (var i = 0, c = str.length; i < c; i++) {		chunk.poke(i, str.charCodeAt(i));	}	return chunk;};
	
class RequestSignerS3 extends AWS.RequestSignerS3 {
	sign(secret, string) {
		// KinomaJS routines
		var c= Crypt.SHA1;		var hmac = new Crypt.HMAC(new Crypt.SHA1(), str2chunk(secret));		return hmac.sign(string).toString();
	}
}

AWS.Signers = { S3:RequestSignerS3 };

class S3 {
	static createMessage(data, request, date) { // optional date (default new Date())
		// http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
		let url = 'https://s3-us-west-2.amazonaws.com'+request.path;
		trace("S3::createMessage url:"+url+"\n");
		trace("S3::createMessage()  "  + (new Date()) + "\n");
		let message = new Message(url);
		trace(url);
		let signer = new AWS.Signers.S3(request);
		signer.addAuthorization(credentials, date);
 		for (let key in request.headers) {
			message.setRequestHeader(key, request.headers[key]);
 		}
 		message.method = request.method;
 		return message;
 	}
 
	static presignedExpiresURL(data, request, expires) { // optional expires (default presigned-expires or 2145916800)
 		// http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html#RESTAuthenticationQueryStringAuth
 		if (expires === undefined) {
			// Note: Presigning does not support expiry time greater than a week with SigV4 signing.
			expires = request.headers["presigned-expires"] || 2145916800; // Fri, 01 Jan 2038 00:00:00 GMT
 		}
 		if (request.headers["presigned-expires"] === undefined) {
			request.headers["presigned-expires"] = expires;
		}
 		let signer = new AWS.Signers.S3(request);
 		let signature = signer.sign(credentials.secretAccessKey, signer.stringToSign());
		let query = { AWSAccessKeyId:credentials.accessKeyId, Expires:expires, Signature:signature };
		return "https://s3-us-west-2.amazonaws.com/element-photo-door/"+parseURI(request.path).name+"?"+serializeQuery(query);
	}
}

const AMZ = { S3:S3 };

export default AMZ;
