// JSON Functions

/*  See http://www.JSON.org/js.html

		json_encode(value, whitelist)
			value       any JavaScript value, usually an object or array.

			whitelist   an optional array prameter that determines how object
						values are stringified.

			This method produces a JSON text from a JavaScript value.
			There are three possible ways to stringify an object, depending
			on the optional whitelist parameter.

			If an object has a toJSON method, then the toJSON() method will be
			called. The value returned from the toJSON method will be
			stringified.

			Otherwise, if the optional whitelist parameter is an array, then
			the elements of the array will be used to select members of the
			object for stringification.

			Otherwise, if there is no whitelist parameter, then all of the
			members of the object will be stringified.

			Values that do not have JSON representaions, such as undefined or
			functions, will not be serialized. Such values in objects will be
			dropped; in arrays will be replaced with null.
			JSON.stringify(undefined) returns undefined. Dates will be
			stringified as quoted ISO dates.

			Example:

			var text = json_encode(['e', {pluribus: 'unum'}]);
			// text is '["e",{"pluribus":"unum"}]'

		json_decode(text, filter)
			This method parses a JSON text to produce an object or
			array. It can throw a SyntaxError exception.

			The optional filter parameter is a function that can filter and
			transform the results. It receives each of the keys and values, and
			its return value is used instead of the original value. If it
			returns what it received, then structure is not modified. If it
			returns undefined then the member is deleted.

			Example:

			// Parse the text. If a key contains the string 'date' then
			// convert the value to a date.

			myData = json_decode(text, function (key, value) {
				return key.indexOf('date') >= 0 ? new Date(value) : value;
			});
*/

if (typeof JSON === "undefined") {

getGlobal().JSON = function() {

	function f(n) {	// Format integers to have at least two digits.
		return n < 10 ? '0' + n : n;
	}

	Date.prototype.toJSON = function () {
		// Eventually, this method will be based on the date.toISOString method.
		return this.getUTCFullYear()  + '-' +
			f(this.getUTCMonth() + 1) + '-' +
			f(this.getUTCDate())      + 'T' +
			f(this.getUTCHours())     + ':' +
			f(this.getUTCMinutes())   + ':' +
			f(this.getUTCSeconds())   + 'Z';
	};

	var m = {	// table of character substitutions
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	};

	function stringify(value, whitelist) {
		var a,		// The array holding the partial texts.
			i,		// The loop counter.
			k,		// The member key.
			l,		// Length.
			r = /["\\\x00-\x1f\x7f-\x9f]/g,
			v;		// The member value.

		switch (typeof value) {
		case 'string':
			return r.test(value) ?
				'"' + value.replace(r, function (a) {
					var c = m[a];
					if (c) {
						return c;
					}
					c = a.charCodeAt();
					return '\\u00' + Math.floor(c / 16).toString(16) +
					                           (c % 16).toString(16);
				}) + '"' :
				'"' + value + '"';

		case 'number':
			return isFinite(value) ? String(value) : 'null';

		case 'boolean':
		case 'null':
			return String(value);

		case 'object':
			if (!value) {
				return 'null';
			}

			if (typeof value.toJSON === 'function') {
				return stringify(value.toJSON());
			}
			a = [];
			if (typeof value.length === 'number' &&
					!(value.propertyIsEnumerable('length'))) {
				l = value.length;
				for (i = 0; i < l; i += 1) {
					a.push(stringify(value[i], whitelist) || 'null');
				}
				return '[' + a.join(',') + ']';
			}
			if (whitelist) {
				l = whitelist.length;
				for (i = 0; i < l; i += 1) {
					k = whitelist[i];
					if (typeof k === 'string') {
						v = stringify(value[k], whitelist);
						if (v) {
							a.push(stringify(k) + ':' + v);
						}
					}
				}
			} else {
				for (k in value) {
					if (typeof k === 'string') {
						v = stringify(value[k], whitelist);
						if (v) {
							a.push(stringify(k) + ':' + v);
						}
					}
				}
			}

			return '{' + a.join(',') + '}';
		default:
			return 'null';
		}
	}

	return {
		stringify: stringify,
		parse: function (text, filter) {
			var j;

			function walk(k, v) {
				var i, n;
				if (v && typeof v === 'object') {
					for (i in v) {
						if (Object.prototype.hasOwnProperty.apply(v, [i])) {
							n = walk(i, v[i]);
							if (n !== undefined) {
								v[i] = n;
							}
						}
					}
				}
				return filter(k, v);
			}

			// Look for non-JSON patterns.
			if (/^[\],:{}\s]*$/.test(text.replace(/\\./g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				j = eval('(' + text + ')');

				return typeof filter === 'function' ? walk('', j) : j;
			}

			throw new SyntaxError('parseJSON');
		}
	};
}();

}

var json_encode = JSON.stringify;
var json_decode = JSON.parse;
