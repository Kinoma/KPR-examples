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

let AWS = require("aws");

class RequestSignerS3 extends AWS.RequestSignerS3 {
	sign(secret, string) {
		// KinomaJS routines
		let length = secret.length;
		let key = new Uint8Array(length);
		for (let i = 0; i < length; i++) {
			key[i] = secret.charCodeAt(i);
		}
		let Crypt = require.weak("crypt");
		let hmac = new Crypt.HMAC(new Crypt.SHA1(), key);
		hmac.update(string);
		let result = hmac.close();
		let Bin = require.weak("bin");
		return Bin.encode(result);
	}
}

AWS.Signers = { S3:RequestSignerS3 };

class S3 {
	static createMessage(data, request, date, stream) { // optional date (default new Date())
		// http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
		let url = `https://s3-${data.config.region}.amazonaws.com${request.path}`;
		let http;
		if(stream){
			let HTTPStreamClient = require.weak("HTTPStreamClient");
			http = new HTTPStreamClient(url);	
		}
		else{
			let HTTPClient = require.weak("HTTPClient");
			http = new HTTPClient(url);
		}
		
		let signer = new AWS.Signers.S3(request);
		signer.addAuthorization(data.credentials, date);
		for (let key in request.headers) {
			http.addHeader(key, request.headers[key]);
		}
		http.method = request.method;
		
		return http;
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
		let signature = signer.sign(data.credentials.secretAccessKey, signer.stringToSign());
		let query = { AWSAccessKeyId:data.credentials.accessKeyId, Expires:expires, Signature:signature };
		return `https://s3-${data.config.region}.amazonaws.com/${data.bucket}/${parseURI(request.path).name}?${serializeQuery(query)}`;
	}
}

const AMZ = { S3:S3 };

// module.exports = AMZ;
export default AMZ;
