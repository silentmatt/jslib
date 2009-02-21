// Network Functions

JSLIB.require("thread");

// XMLHttpRequest Object
// PUT and DELETE methods work for local files
(function() {
	// From Simulated browser environment for Rhino
	// By John Resig <http://ejohn.org/>
	// Copyright 2007 John Resig, under the MIT License
	// Originally implemented by Yehuda Katz

	this.XMLHttpRequest = function() {
		this.headers = {};
		this.responseHeaders = {};
	};

	this.XMLHttpRequest.prototype = {
		open: function(method, url, async, user, password) {  
			this.readyState = 1;
			if (async)
				this.async = true;
			this.method = method || "GET";
			this.url = url;
			this.onreadystatechange();
		},
		setRequestHeader: function(header, value) {
			this.headers[header] = value;
		},
		getResponseHeader: function(header) { },
		send: function(data) {
			var self = this;
			
			function makeRequest() {
				var baseURL = getcwd(true);
				var url = new java.net.URL(new java.net.URL("file://" + baseURL), self.url);
				
				if ( url.getProtocol() == "file" ) {
					if ( self.method == "PUT" ) {
						// TODO: Handle errors
						var out = new java.io.FileWriter( 
								new java.io.File( new java.net.URI( url.toString() ) ) ),
							text = new java.lang.String( data || "" );
						
						out.write( text, 0, text.length() );
						out.flush();
						out.close();
					}
					else if ( self.method == "DELETE" ) {
						// TODO: Handle errors
						var file = new java.io.File( new java.net.URI( url.toString() ) );
						file["delete"]();
					}
					else {
						try {
							var connection = url.openConnection();
							connection.connect();
							handleResponse();
						}
						catch (e) {
							// TODO: Handle the error
						}
					}
				}
				else {
					var connection = url.openConnection();
					
					connection.setRequestMethod( self.method );
					
					// Add headers to Java connection
					for (var header in self.headers)
						connection.addRequestProperty(header, self.headers[header]);
					try {
						connection.connect();
					}
					catch (e) {
					}
					// Stick the response headers into responseHeaders
					for (var i = 0; ; i++) { 
						var headerName = connection.getHeaderFieldKey(i); 
						var headerValue = connection.getHeaderField(i); 
						if (!headerName && !headerValue) break; 
						if (headerName)
							self.responseHeaders[headerName] = headerValue;
					}
					
					handleResponse();
				}
				
				function handleResponse() {
					try {
						self.readyState = 4;
						self.status = parseInt(connection.responseCode) || undefined;
						self.statusText = connection.responseMessage || "";
						var inputStream = connection.getInputStream();
						var stream = new java.io.InputStreamReader(inputStream),
							buffer = new java.io.BufferedReader(stream), line;
					
						while ((line = buffer.readLine()) != null)
							self.responseText += line;
						
						self.responseXML = null;
					
						buffer.close();
						stream.close();
						inputStream.close();
					
						if ( self.responseText.match(/^\s*</) ) {
							try {
								self.responseXML = new DOMDocument(
									new java.io.ByteArrayInputStream(
										(new java.lang.String(
											self.responseText)).getBytes("UTF8")));
							} catch(e) {}
						}
					} catch (e) {
						if (buffer) buffer.close();
						if (stream) stream.close();
						if (inputStream) inputStream.close();
					}
				}
				
				self.onreadystatechange();
			}

			if (this.async)
				thread(makeRequest).start();
			else
				makeRequest();
		},
		abort: function() {},
		onreadystatechange: function() {},
		getResponseHeader: function(header) {
			if (this.readyState < 3)
				throw new Error("INVALID_STATE_ERR");
			else {
				var returnedHeaders = [];
				for (var rHeader in this.responseHeaders) {
					if (rHeader.match(new RegExp(header, "i")))
						returnedHeaders.push(this.responseHeaders[rHeader]);
				}
			
				if (returnedHeaders.length)
					return returnedHeaders.join(", ");
			}
			
			return null;
		},
		getAllResponseHeaders: function(header) {
			if (this.readyState < 3)
				throw new Error("INVALID_STATE_ERR");
			else {
				var returnedHeaders = [];
				
				for (var header in this.responseHeaders)
					returnedHeaders.push( header + ": " + this.responseHeaders[header] );
				
				return returnedHeaders.join("\r\n");
			}
		},
		async: true,
		readyState: 0,
		responseText: "",
		status: 0
	};
})();

Ajax = {
	event: {
		trigger: function(event, args) {
			if (event in Ajax.event.handlers) {
				args = Array.slice(args || []);
				var h = Ajax.event.handlers[event];
				args.unshift({
					type: event,
					timeStamp: +(new Date())
				});

				h.forEach(function(fn) {
					fn.apply(undefined, args);
				});
			}
		},

		unbind: function(event, fn) {
			if (event in Ajax.event.handlers) {
				var h = Ajax.event.handlers[event];
				var i = h.indexOf(fn);
				if (i !== -1) {
					h.splice(i, 1);
				}
			}
		},

		bind: function(event, fn) {
			if (event in Ajax.event.handlers) {
				Ajax.event.handlers[event].push(fn);
			}
		},

		handlers: {
			ajaxStart: [],
			ajaxStop: [],
			ajaxSend: [],
			ajaxSuccess: [],
			ajaxError: [],
			ajaxComplete: []
		}
	},

	ajaxStart: function(fn) {
		Ajax.event.bind("ajaxStart", fn);
	},

	ajaxStop: function(fn) {
		Ajax.event.bind("ajaxStop", fn);
	},

	ajaxSend: function(fn) {
		Ajax.event.bind("ajaxSend", fn);
	},

	ajaxSuccess: function(fn) {
		Ajax.event.bind("ajaxSuccess", fn);
	},

	ajaxError: function(fn) {
		Ajax.event.bind("ajaxError", fn);
	},

	ajaxComplete: function(fn) {
		Ajax.event.bind("ajaxComplete", fn);
	},

	// TODO: This doesn't *actually* evaluate in the global context
	globalEval: function() {
		return eval(arguments[0]);
	},

	// See test/unit/core.js from jquery for details concerning this function.
	isFunction: function( fn ) {
		return !!fn && typeof fn != "string" && !fn.nodeName &&
			fn.constructor != Array && /^[\s[]?function/.test( fn + "" );
	},

	get: function( url, data, callback, type ) {
		// shift arguments if data argument was ommited
		if ( Ajax.isFunction( data ) ) {
			callback = data;
			data = null;
		}

		return Ajax.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	getScript: function( url, callback ) {
		return Ajax.get(url, null, callback, "script");
	},

	getJSON: function( url, data, callback ) {
		return Ajax.get(url, data, callback, "json");
	},

	post: function( url, data, callback, type ) {
		if ( Ajax.isFunction( data ) ) {
			callback = data;
			data = {};
		}

		return Ajax.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	ajaxSetup: function( settings ) {
		Ajax.extend( Ajax.ajaxSettings, settings );
	},

	ajaxSettings: {
		url: "",
		global: true,
		type: "GET",
		timeout: 0,
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		data: null,
		username: null,
		password: null,
		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			script: "text/javascript, application/javascript",
			json: "application/json, text/javascript",
			text: "text/plain",
			_default: "*/*"
		}
	},

	// Last-Modified header cache for next request
	lastModified: {},

	ajax: function( s ) {
		// Extend the settings, but re-extend 's' so that it can be
		// checked again later (in the test suite, specifically)
		s = Ajax.extend(true, s, Ajax.extend(true, {}, Ajax.ajaxSettings, s));

		var jsonp, jsre = /=\?(&|$)/g, status, data,
			type = s.type.toUpperCase();

		// convert data if not already a string
		if ( s.data && s.processData && typeof s.data != "string" )
			s.data = Ajax.param(s.data);

		// Handle JSONP Parameter Callbacks
		if ( s.dataType == "jsonp" ) {
			if ( type == "GET" ) {
				if ( !s.url.match(jsre) )
					s.url += (s.url.match(/\?/) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			} else if ( !s.data || !s.data.match(jsre) )
				s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
			s.dataType = "json";
		}

		// Build temporary JSONP function
		if ( s.dataType == "json" && (s.data && s.data.match(jsre) || s.url.match(jsre)) ) {
			jsonp = "jsonp" + jsc++;

			// Replace the =? sequence both in the query string and the data
			if ( s.data )
				s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
			s.url = s.url.replace(jsre, "=" + jsonp + "$1");

			// We need to make sure
			// that a JSONP style response is executed properly
			s.dataType = "script";

			// Handle JSONP-style loading
			getGlobal()[ jsonp ] = function(tmp){
				data = tmp;
				success();
				complete();
				// Garbage collect
				getGlobal()[ jsonp ] = undefined;
				try{ delete getGlobal()[ jsonp ]; } catch(e){}
				if ( head )
					head.removeChild( script );
			};
		}

		if ( s.dataType == "script" && s.cache == null )
			s.cache = false;

		if ( s.cache === false && type == "GET" ) {
			var ts = now();
			// try replacing _= if it is there
			var ret = s.url.replace(/(\?|&)_=.*?(&|$)/, "$1_=" + ts + "$2");
			// if nothing was replaced, add timestamp to the end
			s.url = ret + ((ret == s.url) ? (s.url.match(/\?/) ? "&" : "?") + "_=" + ts : "");
		}

		// If data is available, append data to url for get requests
		if ( s.data && type == "GET" ) {
			s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;

			// IE likes to send both get and post data, prevent this
			s.data = null;
		}

		// Watch for a new set of requests
		if ( s.global && ! Ajax.active++ )
			Ajax.event.trigger( "ajaxStart" );

		var requestDone = false;

		// Create the request object
		var xhr = new XMLHttpRequest();

		// Open the socket
		// Passing null username, generates a login popup on Opera (#2865)
		if( s.username )
			xhr.open(type, s.url, s.async, s.username, s.password);
		else
			xhr.open(type, s.url, s.async);

		// Need an extra try/catch for cross domain requests in Firefox 3
		try {
			// Set the correct header, if data is being sent
			if ( s.data )
				xhr.setRequestHeader("Content-Type", s.contentType);

			// Set the If-Modified-Since header, if ifModified mode.
			if ( s.ifModified )
				xhr.setRequestHeader("If-Modified-Since",
					jQuery.lastModified[s.url] || "Thu, 01 Jan 1970 00:00:00 GMT" );

			// Set header so the called script knows that it's an XMLHttpRequest
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

			// Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				s.accepts[ s.dataType ] + ", */*" :
				s.accepts._default );
		} catch(e){}

		// Allow custom headers/mimetypes
		if ( s.beforeSend && s.beforeSend(xhr, s) === false ) {
			// cleanup active request counter
			s.global && jQuery.active--;
			// close opended socket
			xhr.abort();
			return false;
		}

		if ( s.global )
			Ajax.event.trigger("ajaxSend", [xhr, s]);

		// Wait for a response to come back
		var onreadystatechange = function(isTimeout){
			// The transfer is complete and the data is available, or the request timed out
			if ( !requestDone && xhr && (xhr.readyState == 4 || isTimeout == "timeout") ) {
				requestDone = true;

				// clear poll interval
				if (ival) {
					clearInterval(ival);
					ival = null;
				}

				status = isTimeout == "timeout" && "timeout" ||
					!Ajax.httpSuccess( xhr ) && "error" ||
					s.ifModified && Ajax.httpNotModified( xhr, s.url ) && "notmodified" ||
					"success";

				if ( status == "success" ) {
					// Watch for, and catch, XML document parse errors
					try {
						// process the data (runs the xml through httpData regardless of callback)
						data = Ajax.httpData( xhr, s.dataType, s.dataFilter );
					} catch(e) {
						status = "parsererror";
					}
				}

				// Make sure that the request was successful or notmodified
				if ( status == "success" ) {
					// Cache Last-Modified header, if ifModified mode.
					var modRes;
					try {
						modRes = xhr.getResponseHeader("Last-Modified");
					} catch(e) {} // swallow exception thrown by FF if header is not available

					if ( s.ifModified && modRes )
						Ajax.lastModified[s.url] = modRes;

					// JSONP handles its own success callback
					if ( !jsonp )
						success();
				} else
					Ajax.handleError(s, xhr, status);

				// Fire the complete handlers
				complete();

				// Stop memory leaks
				if ( s.async )
					xhr = null;
			}
		};

		if ( s.async ) {
			// don't attach the handler to the request, just poll it instead
			var ival = setInterval(onreadystatechange, 13);

			// Timeout checker
			if ( s.timeout > 0 )
				setTimeout(function(){
					// Check to see if the request is still happening
					if ( xhr ) {
						// Cancel the request
						xhr.abort();

						if( !requestDone )
							onreadystatechange( "timeout" );
					}
				}, s.timeout);
		}

		// Send the data
		try {
			xhr.send(s.data);
		} catch(e) {
			Ajax.handleError(s, xhr, null, e);
		}

		// firefox 1.5 doesn't fire statechange for sync requests
		if ( !s.async )
			onreadystatechange();

		function success(){
			// If a local callback was specified, fire it and pass it the data
			if ( s.success )
				s.success( data, status );

			// Fire the global callback
			if ( s.global )
				Ajax.event.trigger( "ajaxSuccess", [xhr, s] );
		}

		function complete(){
			// Process result
			if ( s.complete )
				s.complete(xhr, status);

			// The request was completed
			if ( s.global )
				Ajax.event.trigger( "ajaxComplete", [xhr, s] );

			// Handle the global AJAX counter
			if ( s.global && ! --Ajax.active )
				Ajax.event.trigger( "ajaxStop" );
		}

		// return XMLHttpRequest to allow aborting the request etc.
		return xhr;
	},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) s.error( xhr, status, e );

		// Fire the global callback
		if ( s.global )
			Ajax.event.trigger( "ajaxError", [xhr, s, e] );
	},

	// Counter for holding the number of active queries
	active: 0,

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol == "file:" ||
				( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223 ||
				false && xhr.status == undefined;
		} catch(e){}
		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		try {
			var xhrRes = xhr.getResponseHeader("Last-Modified");

			// Firefox always returns 200. check Last-Modified date
			return xhr.status == 304 || xhrRes == Ajax.lastModified[url] ||
				false && xhr.status == undefined;
		} catch(e){}
		return false;
	},

	httpData: function( xhr, type, filter ) {
		var ct = xhr.getResponseHeader("content-type"),
			xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.tagName == "parsererror" )
			throw "parsererror";
			
		// Allow a pre-filtering function to sanitize the response
		if( filter )
			data = filter( data, type );

		// If the type is "script", eval it in global context
		if ( type == "script" )
			Ajax.globalEval( data );

		// Get the JavaScript object, if JSON is used.
		if ( type == "json" )
			data = eval("(" + data + ")");

		return data;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a ) {
		var s = [];

		// If an array was passed in, assume that it is an array
		// of form elements
		if ( a.constructor == Array)
			// Serialize the form elements
			a.forEach(function(){
				s.push( encodeURIComponent(this.name) + "=" + encodeURIComponent( this.value ) );
			});

		// Otherwise, assume that it's an object of key/value pairs
		else
			// Serialize the key/values
			for ( var j in a )
				// If the value is an array then the key names need to be repeated
				if ( a[j] && a[j].constructor == Array )
					a[j].forEach(function(){
						s.push( encodeURIComponent(j) + "=" + encodeURIComponent( this ) );
					});
				else
					s.push( encodeURIComponent(j) + "=" + encodeURIComponent( Ajax.isFunction(a[j]) ? a[j]() : a[j] ) );

		// Return the resulting serialization
		return s.join("&").replace(/%20/g, "+");
	},

	extend: function() {
		// copy reference to target object
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

		// Handle a deep copy situation
		if ( target.constructor == Boolean ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target != "object" && typeof target != "function" )
			target = {};
	
		// extend jQuery itself if only one argument is passed
		if ( length == i ) {
			target = this;
			--i;
		}
	
		for ( ; i < length; i++ )
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null )
				// Extend the base object
				for ( var name in options ) {
					var src = target[ name ], copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy )
						continue;
	
					// Recurse if we're merging object values
					if ( deep && copy && typeof copy == "object" && !copy.nodeType )
						target[ name ] = Ajax.extend( deep, 
							// Never move original objects, clone them
							src || ( copy.length != null ? [ ] : { } )
						, copy );
	
					// Don't bring in undefined values
					else if ( copy !== undefined )
						target[ name ] = copy;
	
				}
	
		// Return the modified object
		return target;
	}
};
