// String Functions

String.isNullOrEmpty = function(s) {
	return !s || string(s).length == 0;
}

// Repeat a string <l> times ("asdf".mul(4) == "asdfasdfasdfasdf")
String.prototype.mul = function(l) {
	if (l <= 0) return "";
	var a = new Array(l + 1);
	return a.join(this);
};

String.mul = function(s, l) {
	return string(s).mul(l);
};

// Indent <indent> levels with c (default to a single space)
String.prototype.indent = function(indent, c) {
	var out = [];
	var s = this.split('\n');
	c = c || " ";
	var indentStr = c.mul(indent);
	for (var i = 0; i < s.length; i++) {
		out.push(indentStr + s[i]);
	}
	return out.join('\n');
};

String.indent = function(s, indent, c) {
	return string(s).indent(indent, c);
};

// Based on Douglas Crockford's String.supplant code, but I added an optional length specifier.
// If a substitution expression looks like this: "{name:10}", o.name will be left-padded to 10 characters
// with either '0' or ' ' as appropriate.
String.prototype.supplant = function (o) {
	return this.replace(/{([^{}]*)}/g,
		function (a, b) {
			var formatSep = b.indexOf(':');
			if (formatSep != -1) {
				var temp = b.substring(0, formatSep);
				var len = parseInt(b.substring(formatSep + 1));
				b = temp;

				r = o[b];
				var padChar = ' ';
				if (typeof r === 'number') {
					r = string(r);
					padChar = '0';
				}

				if (isString(r)) {
					while (r.length < len) {
						r = padChar + r;
					}
				}
			}
			else {
				var r = o[b];
			}

			return isString(r) || typeof r === 'number' ? r : a;
		}
	);
};

String.supplant = function(s, o) {
	return string(s).supplant(o);
};

// Test the end of a string
String.prototype.endsWith = function(str) {
	return (this.length - str.length) == this.lastIndexOf(str);
};

String.endsWith = function(s, str) {
	return string(s).endsWith(str);
};

// Test the beginning of a string
String.prototype.startsWith = function(str) {
	return this.indexOf(str) === 0;
};

String.startsWith = function(s, str) {
	return string(s).startsWith(str);
};

// quote() produces a quoted string. This method returns a string that is like the original string
// except that it is wrapped in quotes and all quote and backslash characters are preceded with backslash.
// From Douglas Crockford's Remedial JavaScript
String.prototype.quote = function() {
	var c, i, l = this.length, o = '"';
	for (i = 0; i < l; i += 1) {
		c = this.charAt(i);
		if (c >= ' ') {
			if (c === '\\' || c === '"') {
				o += '\\';
			}
			o += c;
		} else {
			switch (c) {
			case '\b':
				o += '\\b';
				break;
			case '\f':
				o += '\\f';
				break;
			case '\n':
				o += '\\n';
				break;
			case '\r':
				o += '\\r';
				break;
			case '\t':
				o += '\\t';
				break;
			default:
				c = c.charCodeAt();
				o += '\\u00' + Math.floor(c / 16).toString(16) +
					(c % 16).toString(16);
			}
		}
	}
	return o + '"';
};

String.quote = function(s) {
	return string(s).quote();
};

// Trim whitespace from the beginning and end of a string
// From Douglas Crockford's Remedial JavaScript
String.prototype.trim = function() {
	return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};

String.trim = function(s) {
	return string(s).trim();
};

// Get a reversed version of the string
String.prototype.reverse = function() {
	var s = new StringBuilder();
	var i = this.length;
	while (i>0) {
		s.append(this.substring(i-1,i));
		i--;
	}
	return s.toString();
};

String.reverse = function(s) {
	return string(s).reverse();
};

// Convert from a string to an array of character codes
String.prototype.toIntArray = function() {
	var a = new Array();
	for (var i = 0; i < this.length; i++) {
		a[i] = this.charCodeAt(i);
	}
	return a;
};

String.toIntArray = function(s) {
	return string(s).toIntArray();
};

// Convert from an array of character codes to a string
Array.prototype.intArrayToString = function() {
	var a = new String();
	for (var i = 0; i < this.length; i++) {
		if(typeof this[i] != "number") {
			throw new Error("Array must be all numbers");
		} else if (this[i] < 0) {
			throw new Error("Numbers must be 0 and up");
		}
		a += String.fromCharCode(this[i]);
	}
	return a;
};

Array.intArrayToString = function(a) {
	return array(a).intArrayToString();
};

// printf-like formatting
// based on jsolait (http://jsolait.net/)
/*
A formatting specifier looks as follows:  "%[(key)][flag][sign][min][precision]typeOfValue"
[...] are optional.

    * (key) If specified the first argument is treated as an object/associative array and the formating values are retrieved from that object using the key.
    * flag:
      0 Use zeros for padding.
      - Left justify result, padding it with spaces.
      (a space) Use spaces for padding.
    * sign:
      + Numeric values will contain a positive or negative sign in front of the number.
    * min:
      l The string will be padded with the padding character until it has a minimum length of l.
    * precision:
      .x Where x is the precision for floating point numbers and the length for 0 padding for integers.
    * typeOfValue:
      d Signed integer decimal.
      i Signed integer decimal.
      b Unsigned binary. This does not exist in python.
      o Unsigned octal.
      u Unsigned decimal.
      x Unsigned hexadecimal (lowercase).
      X Unsigned hexadecimal (uppercase).
      e Floating point exponential format (lowercase).
      E Floating point exponential format (uppercase).
      f Floating point decimal format.
      F Floating point decimal format.
      c Single character (accepts byte or single character string).
      s String (converts any object using object.toString()).

Examples:

"%02d".format(8) == "08"
"%05.2f".format(1.234) == "01.23"
"123 in binary is: %08b".format(123) == "123 in binary is: 01111011"

*/
String.prototype.format = (function() {
	function FormatSpecifier(s) {
		s = s.match(/%(\(\w+\)){0,1}([ 0-]){0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}(.)/);
		if(s[1]) {
			this.key = s[1].slice(1,-1);
		} else {
			this.key = null;
		}
		this.paddingFlag = s[2];
		if(this.paddingFlag == "") {
			this.paddingFlag = " ";
		}
		this.signed = (s[3] == "+");
		this.minLength = parseInt(s[4]);
		if(isNaN(this.minLength)) {
			this.minLength = 0;
		}
		if(s[5]) {
			this.percision = parseInt(s[5].slice(1, s[5].length));
		} else {
			this.percision = -1;
		}
		this.type = s[6];
	}

	function pad(s, flag, len) {
		if (flag == "-") {
			var c = " ";
		} else {
			var c = string(flag) || "";
		}
		var rslt = c.mul(len - s.length);
		if (flag == "-") {
			rslt = s + rslt;
		} else {
			rslt += s;
		}
		return rslt;
	}

	return function() {
		if (this == "")
			return "";
		var sf = this.match(/(%(\(\w+\)){0,1}[ 0-]{0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}[dibouxXeEfFgGcrs%])|([^%]+)/g);
		if (sf) {
			if (sf.join("") != this) {
				throw new Exception("Unsupported formating string: '" + this + "'");
			}
		}
		else {
			throw new Exception("Unsupported formating string: '" + this + "'");
		}
		var rslt = "";
		var s;
		var obj;
		var cnt = 0;
		var frmt;
		var sign = "";
		for (var i = 0; i < sf.length; i++) {
			s = sf[i];
			if (s=="%%") {
				s = "%";
			}
			else if (s == "%s") {
				if (cnt >= arguments.length) {
					throw new Exception("Not enough arguments for format string.");
				}
				else {
					obj = arguments[cnt];
					cnt++;
				}
				if (obj === null) {
					obj = "null";
				}
				else if (obj === undefined) {
					obj = "undefined";
				}
				s = obj.toString();
			}
			else if (s.slice(0,1) == "%") {
				frmt = new FormatSpecifier(s);
				if (frmt.key) {
					if((typeof arguments[0]) == "object" && arguments.length == 1) {
						obj = arguments[0][frmt.key];
					}
					else {
						throw new Exception("Object or associative array expected as formating value.");
					}
				}
				else {
					if (cnt >= arguments.length) {
						throw new Exception("Not enough arguments for format string.");
					}
					else {
						obj = arguments[cnt];
						cnt++;
					}
				}
				if (frmt.type == "s") {
					if (obj === null) {
						obj = "null";
					}
					else if (obj === undefined) {
						obj = "undefined";
					}
					s = pad(obj.toString(), frmt.paddingFlag, frmt.minLength);
				}
				else if(frmt.type == "c") {
					if (frmt.paddingFlag == "0") {
						frmt.paddingFlag = " ";
					}
					if (typeof obj == "number") {
						s = pad(String.fromCharCode(obj), frmt.paddingFlag, frmt.minLength);
					}
					else if (typeof obj == "string") {
						if (obj.length == 1) {
							s = pad(obj, frmt.paddingFlag, frmt.minLength);
						}
						else {
							throw new Exception("Character of length 1 required.");
						}
					}
					else {
						throw new Exception("Character or Byte required.");
					}
				}
				else if (typeof obj == "number") {
					if (obj < 0) {
						obj = -obj;
						sign = "-";
					}
					else if (frmt.signed) {
						sign = "+";
					}
					else {
						sign = "";
					}
					switch (frmt.type) {
					case "f":
					case "F":
						if (frmt.percision > -1) {
							s = obj.toFixed(frmt.percision).toString();
						}
						else {
							s = obj.toString();
						}
						break;
					case "E":
					case "e":
						if (frmt.percision > -1) {
							s = obj.toExponential(frmt.percision);
						}
						else {
							s = obj.toExponential();
						}
						s = s.replace("e", frmt.type);
						break;
					case "b":
						s = obj.toString(2);
						s = pad(s, "0", frmt.percision);
						break;
					case "o":
						s = obj.toString(8);
						s = pad(s, "0", frmt.percision);
						break;
					case "x":
						s = obj.toString(16).toLowerCase();
						s = pad(s, "0", frmt.percision);
						break;
					case "X":
						s = obj.toString(16).toUpperCase();
						s = pad(s, "0", frmt.percision);
						break;
					default:
						s = parseInt(obj).toString();
						s = pad(s, "0", frmt.percision);
						break;
					}
					if (frmt.paddingFlag == "0") {
						s = pad(s, "0", frmt.minLength - sign.length);
					}
					s = sign + s;
					s = pad(s, frmt.paddingFlag, frmt.minLength);
				}
				else {
					throw new Exception("Number required.");
				}
			}
			rslt += s;
		}
		return rslt;
	};
})();

String.format = function(s) {
	return string(s).format(Array.slice(arguments, 1));
};

// Pad on the right up to <len> characters with 'c' (default to a space)
String.prototype.padRight = function(len, c) {
	c = c || " ";
	return this + c.mul(len - this.length);
};

String.padRight = function(s, len, c) {
	return string(s).padRight(len, c);
};

// Pad on the left up to <len> characters with 'c' (default to a space)
String.prototype.padLeft = function(len, c) {
	c = c || " ";
	return c.mul(len - this.length) + this;
};

String.padLeft = function(s, len, c) {
	return string(s).padLeft(len, c);
};

// Compare strings with corresponding numbers compared numerically instead of lexicographically
var naturalCompare = (function() {
	function WordNumberStringSplitter(s) {
		this.s = s;
		this.next = function() {
			if (this.s.length == 0) {
				return null;
			}
			var m = this.s.match(/^(\s*[0-9]+\s*)/);
			if (m) {
				this.s = this.s.slice(m[1].length);
				return +m[1];
			}
			else {
				m = this.s.match(/^([^0-9]+)/);
				if (m) {
					this.s = this.s.slice(m[1].length);
					return m[1].replace(" ", "");
				}
				else {
					return null;
				}
			}
		};
	}

	return function(a, b) {
		var asplitter = new WordNumberStringSplitter(a);
		var bsplitter = new WordNumberStringSplitter(b);
		while (true) {
			var x = asplitter.next();
			var y = bsplitter.next();
			if (x < y) {
				return -1;
			}
			else if (x > y) {
				return 1;
			}
			else if (x == null && y == null) {
				return 0;
			}
		}
	}
})();

// Class to build up a string without constantly creating new strings
function StringBuilder(value) {
	if (!(this instanceof StringBuilder)) {
		return new StringBuilder(value);
	}

	var s = [];

	// Append a string to the end of the current string
	this.append = function(val) {
		s.push(string(val));
		return this;
	};

	// Convert to a string - may be called automatically
	this.toString = function() {
		s = [s.join("")]; // Collapse segments
		return s[0];
	};

	// Clear the current string
	this.clear = function() {
		s = [];
	};

	if (value) {
		this.append(value);
	}
}

