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

// Note: portions of code below sourced from AWS SDK for JavaScript (aws-sdk-2.3.6.js)
//       https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/#License
//       https://sdk.amazonaws.com/js/aws-sdk-2.3.6.js

const util = {
	abort: {},
	each: function each(object, iterFunction) {
		for (let key in object) {
			if (Object.prototype.hasOwnProperty.call(object, key)) {
				let ret = iterFunction.call(this, key, object[key]);
				if (ret === util.abort) break;
			}
		}
	},
	arrayEach: function arrayEach(array, iterFunction) {
		for (let idx in array) {
			if (array.hasOwnProperty(idx)) {
				let ret = iterFunction.call(this, array[idx], parseInt(idx, 10));
				if (ret === util.abort) break;
			}
		}
	},
	crypto: {
		hmac: function hmac(key, string, digest, fn) {
			throw new Error("crypto.hmac is not supported here");
		}
	},
	date: {
		getDate: function getDate() {
			if (AWS.config.systemClockOffset) {
				return new Date(new Date().getTime() + AWS.config.systemClockOffset);
			} else {
				return new Date();
			}
		},
		rfc822: function rfc822(date) {
			if (date === undefined) {
				date = util.date.getDate();
			}
			return date.toUTCString();
		},
		unixTimestamp: function unixTimestamp(date) {
			if (date === undefined) {
				date = util.date.getDate();
			}
			return date.getTime() / 1e3;
		},
	},
};

class RequestSigner {
	constructor(request) {
		this.request = request || {};
	}
	static getVersion(version) {
		switch (version) {
			case "s3": return RequestSignerS3; // AWS.Signers.S3
		}
		throw new Error('Unknown signing version ' + version);
	}
}

class RequestSignerS3 extends RequestSigner {
	get subResources() {
		return {
			acl: 1,
			accelerate: 1,
			cors: 1,
			lifecycle: 1,
			"delete": 1,
			location: 1,
			logging: 1,
			notification: 1,
			partNumber: 1,
			policy: 1,
			requestPayment: 1,
			replication: 1,
			restore: 1,
			tagging: 1,
			torrent: 1,
			uploadId: 1,
			uploads: 1,
			versionId: 1,
			versioning: 1,
			versions: 1,
			website: 1
		}
	}
	get responseHeaders() {
		return {
			"response-content-type": 1,
			"response-content-language": 1,
			"response-expires": 1,
			"response-cache-control": 1,
			"response-content-disposition": 1,
			"response-content-encoding": 1
		}
	}
	addAuthorization(credentials, date) {
		if (!this.request.headers["presigned-expires"]) {
			this.request.headers["X-Amz-Date"] = AWS.util.date.rfc822(date);
		}
		if (credentials.sessionToken) {
			this.request.headers["x-amz-security-token"] = credentials.sessionToken;
		}
		let signature = this.sign(credentials.secretAccessKey, this.stringToSign());
		let auth = "AWS " + credentials.accessKeyId + ":" + signature;
		this.request.headers["Authorization"] = auth;
	}
	stringToSign() {
		let r = this.request;
		let parts = [];
		parts.push(r.method);
		parts.push(r.headers["Content-MD5"] || "");
		parts.push(r.headers["Content-Type"] || "");
		parts.push(r.headers["presigned-expires"] || "");
		let headers = this.canonicalizedAmzHeaders();
		if (headers) parts.push(headers);
		parts.push(this.canonicalizedResource());
		return parts.join("\n");
	}
	canonicalizedAmzHeaders() {
		let amzHeaders = [];
		AWS.util.each(this.request.headers, function(name) {
			if (name.match(/^x-amz-/i)) amzHeaders.push(name);
		});
		amzHeaders.sort(function(a, b) {
			return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
		});
		let parts = [];
		AWS.util.arrayEach.call(this, amzHeaders, function(name) {
			parts.push(name.toLowerCase() + ":" + String(this.request.headers[name]));
		});
		return parts.join("\n");
	}
	canonicalizedResource() {
		let r = this.request;
		let parts = r.path.split("?");
		let path = parts[0];
		let querystring = parts[1];
		let resource = "";
		if (r.virtualHostedBucket) resource += "/" + r.virtualHostedBucket;
		resource += path;
		if (querystring) {
			let resources = [];
			AWS.util.arrayEach.call(this, querystring.split("&"), function(param) {
				let name = param.split("=")[0];
				let value = param.split("=")[1];
				if (this.subResources[name] || this.responseHeaders[name]) {
					let subresource = {
						name: name
					};
					if (value !== undefined) {
						if (this.subResources[name]) {
							subresource.value = value;
						} else {
							subresource.value = decodeURIComponent(value);
						}
					}
					resources.push(subresource);
				}
			});
			resources.sort(function(a, b) {
				return a.name < b.name ? -1 : 1;
			});
			if (resources.length) {
				querystring = [];
				AWS.util.arrayEach(resources, function(res) {
					if (res.value === undefined) {
						querystring.push(res.name);
					} else {
						querystring.push(res.name + "=" + res.value);
					}
				});
				resource += "?" + querystring.join("&");
			}
		}
		return resource;
	}
	sign(secret, string) {
		return AWS.util.crypto.hmac(secret, string, "base64", "sha1");
	}
}

const AWS = { RequestSignerS3:RequestSignerS3, util:util };
export default AWS;
