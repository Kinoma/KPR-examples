//@program



(function(){

/**
 * UTIL LOCALS
 */
var NOW        = 1
,    PNSDK      = 'PubNub-JS-' + PLATFORM + '/' + VERSION
,   XHRTME     = 310000;



/**
 * LOCAL STORAGE
 */
var db = (function(){
    var ls = typeof localStorage != 'undefined' && localStorage;
    return {
        get : function(key) {
            try {
                if (ls) return ls.getItem(key);
                if (document.cookie.indexOf(key) == -1) return null;
                return ((document.cookie||'').match(
                    RegExp(key+'=([^;]+)')
                )||[])[1] || null;
            } catch(e) { return }
        },
        set : function( key, value ) {
            try {
                if (ls) return ls.setItem( key, value ) && 0;
                document.cookie = key + '=' + value +
                    '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
            } catch(e) { return }
        }
    };
})();


/**
 * CORS XHR Request
 * ================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr( setup ) {
	if (!("data" in setup))
		setup.data = {};
	setup.data['pnsdk'] = PNSDK;
	if (!("timeout" in setup))
		setup.timeout = XHRTME;
	return pubNubContent.behavior.xdr(pubNubContent, setup);
}

/**
 * BIND
 * ====
 * bind( 'keydown', search('a')[0], function(element) {
 *     ...
 * } );
 */
function bind( type, el, fun ) {
    each( type.split(','), function(etype) {
        var rapfun = function(e) {
            if (!e) e = window.event;
            if (!fun(e)) {
                e.cancelBubble = true;
                e.returnValue  = false;
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation();
            }
        };

        if ( el.addEventListener ) el.addEventListener( etype, rapfun, false );
        else if ( el.attachEvent ) el.attachEvent( 'on' + etype, rapfun );
        else  el[ 'on' + etype ] = rapfun;
    } );
}

/**
 * UNBIND
 * ======
 * unbind( 'keydown', search('a')[0] );
 */
function unbind( type, el, fun ) {
    if ( el.removeEventListener ) el.removeEventListener( type, false );
    else if ( el.detachEvent ) el.detachEvent( 'on' + type, false );
    else  el[ 'on' + type ] = null;
}

/**
 * ERROR
 * ===
 * error('message');
 */
function error(message) { console['error'](message) }

/**
 * EVENTS
 * ======
 * PUBNUB.events.bind( 'you-stepped-on-flower', function(message) {
 *     // Do Stuff with message
 * } );
 *
 * PUBNUB.events.fire( 'you-stepped-on-flower', "message-data" );
 * PUBNUB.events.fire( 'you-stepped-on-flower', {message:"data"} );
 * PUBNUB.events.fire( 'you-stepped-on-flower', [1,2,3] );
 *
 */
var events = {
    'list'   : {},
    'unbind' : function( name ) { events.list[name] = [] },
    'bind'   : function( name, fun ) {
        (events.list[name] = events.list[name] || []).push(fun);
    },
    'fire' : function( name, data ) {
        each(
            events.list[name] || [],
            function(fun) { fun(data) }
        );
    }
};

/**
 * ATTR
 * ====
 * var attribute = attr( node, 'attribute' );
 */
function attr( node, attribute, value ) {
    if (value) node.setAttribute( attribute, value );
    else return node && node.getAttribute && node.getAttribute(attribute);
}

/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) { return document.getElementById(id) }


/**
 * SEARCH
 * ======
 * var elements = search('a div span');
 */
function search( elements, start ) {
    var list = [];
    each( elements.split(/\s+/), function(el) {
        each( (start || document).getElementsByTagName(el), function(node) {
            list.push(node);
        } );
    } );
    return list;
}

/**
 * CSS
 * ===
 * var obj = create('div');
 */
function css( element, styles ) {
    for (var style in styles) if (styles.hasOwnProperty(style))
        try {element.style[style] = styles[style] + (
            '|width|height|top|left|'.indexOf(style) > 0 &&
            typeof styles[style] == 'number'
            ? 'px' : ''
        )}catch(e){}
}

/**
 * CREATE
 * ======
 * var obj = create('div');
 */
function create(element) { return document.createElement(element) }


function get_hmac_SHA256(data,key) {
    var hash = CryptoJS['HmacSHA256'](data, key);
    return hash.toString(CryptoJS['enc']['Base64']);
}

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

function CREATE_PUBNUB(setup) {


    setup['db'] = db;
    setup['xdr'] = xdr;
    setup['error'] = setup['error'] || error;
    setup['hmac_SHA256']= get_hmac_SHA256;
    setup['crypto_obj'] = crypto_obj();
    setup['params']      = { 'pnsdk' : PNSDK }

    SELF = function(setup) {
        return CREATE_PUBNUB(setup);
    }
    var PN = PN_API(setup);
    for (var prop in PN) {
        if (PN.hasOwnProperty(prop)) {
            SELF[prop] = PN[prop];
        }
    }

    SELF['init'] = SELF;
    SELF['$'] = $;
    SELF['attr'] = attr;
    SELF['search'] = search;
    SELF['bind'] = bind;
    SELF['css'] = css;
    SELF['create'] = create;

    if (typeof(window) !== 'undefined'){
        bind( 'beforeunload', window, function() {
            SELF['each-channel'](function(ch){ SELF['LEAVE']( ch.name, 1 ) });
            return true;
        });
    }

    // Return without Testing
    if (setup['notest']) return SELF;

    if (typeof(window) !== 'undefined'){
        bind( 'offline', window,   SELF['_reset_offline'] );
    }

    if (typeof(document) !== 'undefined'){
        bind( 'offline', document, SELF['_reset_offline'] );
    }

    SELF['ready']();
    return SELF;
}
CREATE_PUBNUB['init'] = CREATE_PUBNUB
CREATE_PUBNUB['secure'] = CREATE_PUBNUB
//PUBNUB = CREATE_PUBNUB({})
//typeof module  !== 'undefined' && (module.exports = CREATE_PUBNUB) ||
//typeof exports !== 'undefined' && (exports.PUBNUB = CREATE_PUBNUB) || (PUBNUB = CREATE_PUBNUB);
this.PUBNUB = CREATE_PUBNUB;

var pubNubContent = null;
this.PubNubBehavior = function(content, data) {
	Behavior.call(this, content, data);
};
this.PubNubBehavior.template = Behavior.template;
this.PubNubBehavior.prototype = Object.create(Behavior.prototype, {
	onCreate: { value: function(content, data) {
		pubNubContent = content;
		this.data = data;
		this.nextRequest = null;
		this.timerIndex = 0;
		this.nextTimer = null;
	}},
	onDisplaying: { value: function(content) {
		PUBNUB = CREATE_PUBNUB({})
	}},
/* TIMEOUTS */	
	setTimeout: { value: function(content, callback, delay) {
		var timer = {
			callback: callback,
			index: this.timerIndex++,
			nextTimer: null,
			time: content.time + delay
		};
		if (this.nextTimer) {
			var former = this, current;
			while (current = former.nextTimer) {
				if (timer.time < current.time)
					break;
				former = current;
			}
			timer.nextTimer = current;
			former.nextTimer = timer;
		}
		else {
			this.nextTimer = timer;
			content.start();
		}
		//trace("# setTimeout " + timer.index + " " + delay + "\n");
		return timer;
	}},
	clearTimeout: { value: function(content, timer) {
		//trace("# clearTimeout " + timer.index + "\n");
		var former = this, current;
		while (current = former.nextTimer) {
			if (current == timer) {
				former.nextTimer = current.nextTimer;
				break;
			}
			former = current;
		}
	}},
	onTimeChanged: { value: function(content) {
		var callbacks;
		var time = content.time;
		var former = this, current;
		var timer = null;
		while (current = former.nextTimer) {
			if (current.time > time)
				break;
			former.nextTimer = current.nextTimer;
			current.nextTimer = timer;
			timer = current;
		}
		while (timer) {
			//trace("# timeout " + timer.index + "\n");
			timer.callback.call(null, timer);
			timer = timer.nextTimer;
		}
	}},
/* XDR */	
	xdr: { value: function(content, request) {
		var url = build_url(request.url, request.data);
		var message = new Message(url);
		//trace("# xdr " + url + "\n");
		var cancel = function(failed, json) {
			var request = content.behavior.deleteRequest(content, url);
			if (request) {
				//trace("# xdr cancel" + url + " " + failed + "\n");
				message.cancel();
				if (failed) {
					if ("fail" in request)
						request.fail.call(null, json);
				}
				else {
					if ("success" in request)
						request.success.call(null, json);
				}
			}
		}
		request.URL = url;
		request.nextRequest = this.nextRequest;
		this.nextRequest = request;
		request.timer = this.setTimeout(content, function() { cancel(1) }, request.timeout);
		content.invoke(message, Message.TEXT);
		return cancel;
	}},
	deleteRequest: { value: function(content, url) {
		var former = this, current;
		while (current = former.nextRequest) {
			if (current.URL == url) {
				this.clearTimeout(content, current.timer);
				former.nextRequest = current.nextRequest;
				current.nextRequest = null;
				return current;
			}
			former = current;
		}
		return null;
	}},
	onComplete: { value: function(content, message, text) {
		var url = message.url;
		var request = this.deleteRequest(content, url);
		if (request) {
			//trace("# xdr complete " + url + " " + message.status + " " + text + "\n");
			var json = null;
			if (text) {
				try {
					json = JSON.parse(text);
				}
				catch (e) { 
					json = { "error" : "JSON Error"}
				}
			}
			else {
				json = { "error" : "Network Connection Error"}
			}
			if (message.status == 200) {
				if ("success" in request)
					request.success.call(null, json);
			}
			else {
				if ("fail" in request)
					request.fail.call(null, json);
			}		
		}		
	}},
});

this.setTimeout = function(callback, delay) {
	return pubNubContent.behavior.setTimeout(pubNubContent, callback, delay);
}
this.clearTimeout = function(timer) {
	return pubNubContent.behavior.clearTimeout(pubNubContent, timer);
}

})();


