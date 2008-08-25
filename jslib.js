// General Utilities

// Bind a function to an object (like a delegate)
// You can optionally provide some or all of the arguments
Function.prototype.bind = function(obj, args) {
	return Function.bind.apply(null, [this].concat(array(arguments)));
};

Function.bind = function(func, obj) {
	var args = array(arguments).slice(2);

	return function() {
		return func.apply(obj, args.concat(array(arguments)));
	};
};

// Don't do anything
function nop() {
	// Do nothing
}

// Get the execution time of <fn> in milliseconds
function timeExecution(fn) {
	var start = Date.now();
	fn();
	return Date.now() - start;
}

// Execute a command in a shell (/bin/sh)
// An optional object can be passed with options for runCommand
// With one argument, this is like C's system function
function system(command, opts) {
	var options = opts || {};
	runCommand("/bin/sh", "-c", command, options);
}

// Create a Java thread from a function
function thread(fn) {
	return new java.lang.Thread(new java.lang.Runnable({
		run: fn
	}));
}

// Get the current Thread
function currentThread() {
	return java.lang.Thread.currentThread();
}

// Stop the current thread for <time> milliseconds
function sleep(time) {
	return currentThread().sleep(time);
}

// Create an object, env, containing the system environment as properties
var env = {};
(function() {
	var envIterator = java.lang.System.getenv().entrySet().iterator();

	while (envIterator.hasNext()) {
		var envEntry = envIterator.next();
		var key = toString(envEntry.getKey());
		var value = toString(envEntry.getValue());
		env[key] = value;
	}
})();

// Exception object
// <msg> is a description of the exception
// <trace> is an optional Exception that caused this one
// The following is based on jsolait (http://jsolait.net/)
function Exception(msg,trace) {
	this.name = "Exception";
	this.message = toString(msg);
	this.trace = trace;

	this.toString = function() {
		return this.toTraceString();
	};

	this.toTraceString = function(indent) {
		indent = indent || 0;
		var s="%s\n%s".format(this.name, this.message.indent(indent)).indent(indent);
		if(this.trace) {
			if(this.trace.toTraceString) {
				s += ('\n\nbecause:\n' + this.trace.toTraceString(indent+4));
			} else {
				s += (this.trace + '\n').indent(indent+4);
			}
		}
		return s;
	};
}

// Include/run javascript files
// The file MUST end with ".js", but the caller can leave it off
// The file is searched for in the current directory, $HOME/lib/, $HOME/lib/js, the directories in java.library.path, and directories in $JSLIB_PATH
// If $HOME is not set, "/usr/" will be substituted
var include = function() {
	var mod = {
		moduleSearchPath: [".", "%(HOME)s/lib", "%(HOME)s/lib/js"],
		HOME: environment["user.home"] || "/usr"
	};

	var pathSep = environment["path.separator"] || ":";
	function addPaths(pathList) {
		var paths = pathList.split(pathSep);
		for (var i=0; i<paths.length; i++) {
			if (paths[i] !== "") {
				mod.moduleSearchPath.push(paths[i]);
			}
		}
	}

	addPaths(environment["java.library.path"] || "");
	addPaths(env.JSLIB_PATH || "");

	function ImportFailed(moduleName, moduleURIs, trace) {
		this.name = "ImportFailed";
		this.message = "Failed to import module: '%s' from:\n%s".format(moduleName, moduleURIs.join(',\n').indent(2));
		this.trace = trace;
		this.moduleName = moduleName;
		this.moduleURIs = moduleURIs;
	}
	ImportFailed.prototype = new Exception();

	function doImport(name) {
		name = name.format(mod);
		if (name.startsWith("/")) {
			if (!name.endsWith(".js")) {
				name = name + ".js";
			}
			if (fileExists(name)) {
				try {
					load(name.format(mod));
				} catch(ex) {
					throw new ImportFailed(name,name,ex);
				}
			}
			else {
				throw new ImportFailed(name, [name]);
			}
			return;
		}

		var src, modPath;
		var searchURIs = [];
		for(var i=0;i<mod.moduleSearchPath.length;i++) {
			searchURIs.push("%s/%s%s".format(mod.moduleSearchPath[i].format(mod), name, name.endsWith(".js") ? "" : ".js")); 
		}
		var failedURIs = [];
		for(i=0;i<searchURIs.length;i++) {
			try {
				if (fileExists(searchURIs[i])) {
					load(searchURIs[i]);
					src = searchURIs[i];
					break;
				}
				else {
					failedURIs.push(searchURIs[i]);
				}
			} catch(e) {
				throw new ImportFailed(name,src,e);
			}
		}

		if (!src) {
			throw new ImportFailed(name, failedURIs);
		}
	}

	return function() {
		for (var i=0; i<arguments.length; i++) {
			doImport(arguments[i]);
		}
	};
}();




// File System Functions

// Get the current directory
// Optional <asURL> for URL version
function getcwd(asURL) {
	var f = new java.io.File("");
	return toString(asURL ? f.toURL() : f.getCanonicalPath());
}

// Create a directory, optionally creating any missing parent directories
function mkdir(path, parents) {
	var f = new java.io.File(path);
	return parents ? f.mkdirs() : f.mkdir();
}

// Return a list of files in <path>, optionally matching against a regular expression
// You can also optionally hide files starting with a "." and sort the files
function listFiles(path, regex, hideHidden, sort) {
	var dir = new java.io.File(path || ".");
	var files = dir.list();
	if (!files) { return null; }

	// convert to a javascript array of javascript strings
	files = array(files).map(function(f) { return toString(f); });

	if (hideHidden) {
		files = files.filter(function(name) { return !name.startsWith("."); });
	}

	if (regex) {
		files = array(files).filter(function(name) { return regex.test(name); });
	}

	return sort ? files.sort() : files;
}

// Delete a file
function unlink(filename) {
	return new java.io.File(filename)["delete"]();
}

// Class for reading files
// Can be created as 'Reader("filename")' or 'new Reader("filename")'
// Default stream is stdin
function Reader(name) {
	if (this instanceof Reader) {
		this.javaFile = new java.io.BufferedReader(new java.io.InputStreamReader(name ? new java.io.FileInputStream(name) : java.System["in"]));
	}
	else {
		return new Reader(name);
	}
}

Reader.prototype = {
	// Close the file
	close: function() {
		this.javaFile.close();
	},

	// read(3) => ['a', 'b', 'c'], read() => 'a'
	read: function() {
		var c;
		if (arguments.length) {
			var array = [];
			var count = +arguments[0];
			for (var i=0; i<count; i++) {
				c = this.read();
				if (c) { array.push(c); }
				else { break; }
			}
			return array;
		}
		else {
			c = this.javaFile.read();
			if (c == -1) { return ""; }
			return String.fromCharCode(c);
		}
	},

	// Get a line of text from the file
	readLine: function() {
		var s = this.javaFile.readLine();
		if (s === null) { return null; }
		return toString(s);
	},

	// Ensure that there is data to read
	ready: function() {
		return !!this.javaFile.ready();
	},

	// Skip ahead in the stream
	skip: function(n) {
		this.javaFile.skip(+n);
	}
};

// Class for writing files
// Can be created as 'Writer("filename")' or 'new Writer("filename")'
// Use the optional <append> argument to append instead of wiping out existing data
// Default stream is stdout
function Writer(name, append) {
	if (this instanceof Writer) {
		this.javaFile = name ? new java.io.PrintStream(new java.io.FileOutputStream(name.toString(), !!append)) : java.System.out;
	}
	else {
		return new Writer(name, append);
	}
}

Writer.prototype = {
	// Close the stream
	close: function() {
		this.javaFile.close();
	},

	// Flush any pending writes
	flush: function() {
		this.javaFile.flush();
	},

	// Write formatted text (i.e. "formatstring".format(arguments))
	format: function(format) {
		this.print(format.format(array(arguments).slice(1)));
		return this;
	},

	// Write a string to the file stream
	print: function(s) {
		this.javaFile.print(s.toString());
		return this;
	},

	// Write a string to the file stream with a newline at the end
	println: function(s) {
		this.javaFile.println(s.toString());
		return this;
	}
};

// Read a line from a stream (defaults to stdin)
function readline(stream) {
	var input = new java.io.BufferedReader(new java.io.InputStreamReader(stream || java.lang.System["in"]));
	var line = input.readLine();
	return line !== null ? toString(line) : null;
}

// Check a filename to make sure it exists (it may be a directory)
function fileExists(filename) {
	return new java.io.File(filename.toString()).exists();
}



// Console Functions

// Write text to stdout without appending a newline
function write() {
	java.lang.System.out.print(Array.join(arguments, " "));
}

// Write text to stderr without appending a newline
function ewrite() {
	java.lang.System.err.print(Array.join(arguments, " "));
}

// Write text to stderr with a newline at the end
function ewriteln() {
	ewrite.apply(this, arguments);
	ewrite("\n");
}

// Same as ewriteln
var eprint = ewriteln;

// Write text to stdout with a newline at the end
var writeln = print;

// Clear the console (on Linux at least)
function cls() {
	write('\x1B[H\x1B[2J');
}



// General Object Utilities

// Get the global-context object
var getGlobal = function() {
	var globalContext = this;
	return function() {
		return globalContext;
	};
}();

// Convert an array-like object to an actual array
function array(a) {
	return Array.slice(a, 0);
}

// Delete all enumerated properties of an object
// 'obj.clear()' or 'clear(obj)'
// 'clear()' will not clear the global scope
var clear = function() {
	return function(o) {
		o = o || this;
		if (o === getGlobal()) { return; }
		for (var k in o) {
			delete o[k];
		}
	};
}();

// Create a new object using an existing object as its prototype
// For example: var newObject = object(prototype);
// From Douglas Crockford's Remedial JavaScript
function object(o) {
	function F() {}
	F.prototype = o;
	return new F();
}

// Like the typeof operator, but returns 'array' for Array objects and 'null' for null.
// From Douglas Crockford's Remedial JavaScript
function typeOf(value) {
	var s = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
	}
	return s;
}

// isEmpty(v) returns true if v is an object containing no enumerable members.
// From Douglas Crockford's Remedial JavaScript
function isEmpty(o) {
	var i, v;
	if (typeOf(o) === 'object') {
		for (i in o) {
			v = o[i];
			if (v !== undefined && typeOf(v) !== 'function') {
				return false;
			}
		}
	}
	return true;
}

// Helper method for extending one object with another
function extend(a, b) {
	for (var i in b) {
		var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
		if (g || s) {
			if (g) {
				a.__defineGetter__(i, g);
			}
			if (s) {
				a.__defineSetter__(i, s);
			}
		}
		else {
			a[i] = b[i];
		}
	}
	return a;
}

// Get all the enumerable properties of an object as an array
function getProperties(o) {
	return [k for (k in o)];
}

// Project an object onto a new object
// <template> specifies the format of the new object
// Each property of <template> is assigned to to the new object based on its type:
//     function - Call the function on the existing object and get the return value
//     object - Recursively project the object onto the property
//     string/other - Copy a property from the existing object (use to rename a field)
// <o> is the object to project
// <constructor> if provided will be called (as new constructor()) to create the new object
/*
	Example:

	var data = {
		id: "094747",
		fname: "Matthew",
		lname: "Crumley"
	};

	function Person() {}
	Person.prototype.toString = function() {
		return "[" + this.ID + "] " + this.name.last + ", " + this.name.first;
	};

	var p = project({
		name: { first: "fname", last: "lname" },
		ID: "id",
		fullName: function(o) { return o.fname + " " + o.lname }
	}, data, Person);

	p.toString() == "[094747] Crumley, Matthew";
	p instanceof Person;
	p.toSource() == '({ID:"094747", name:{last:"Crumley", first:"Matthew"}, fullName:"Matthew Crumley"})';
*/
function project(template, o, constructor) {
	var p = constructor ? new constructor() : {};
	for each ([to, from] in Iterator(template)) {
		var type = typeOf(from);
		if (type == "function") {
			p[to] = from(o);
		}
		else if (type == "object") {
			p[to] = project(from, o);
		}
		else {
			p[to] = o[from];
		}
	}
	return p;
}


// String Functions

// Convert a value to a *JavaScript* string (including Java strings)
// This is sometimes necessary because typeof(javaObject.toString()) != "string"
// FIXME: toString(null) === "null". Is that correct?
function toString(s) {
	if (typeof s == "string") {
		return s;
	}
	else if (typeof s == "undefined") {
		return "undefined";
	}
	else if (s == null) {
		return "null";
	}

	return "" + s;
}

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
					r = toString(r);
					padChar = '0';
				}

				if (typeof r === 'string') {
					while (r.length < len) {
						r = padChar + r;
					}
				}
			}
			else {
				var r = o[b];
			}

			return typeof r === 'string' || typeof r === 'number' ? r : a;
		}
	);
};

String.supplant = function(s, o) {
	return toString(s).supplant(o);
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
	return toString(s).quote();
};

// Trim whitespace from the beginning and end of a string
// From Douglas Crockford's Remedial JavaScript
String.prototype.trim = function() {
	return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};

String.trim = function(s) {
	return toString(s).trim();
};

// Test the end of a string
String.prototype.endsWith = function(str) {
	return (this.length - str.length) == this.lastIndexOf(str);
};

String.endsWith = function(s, str) {
	return toString(s).endsWith(str);
};

// Test the beginning of a string
String.prototype.startsWith = function(str) {
	return this.indexOf(str) === 0;
};

String.startsWith = function(s, str) {
	return toString(s).startsWith(str);
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
	return toString(s).reverse();
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
	return toString(s).toIntArray();
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
		var s = s.match(/%(\(\w+\)){0,1}([ 0-]){0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}(.)/);
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
			var c = toString(flag);
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
	return toString(s).format(Array.slice(arguments, 1));
};

// Pad on the right up to <len> characters with 'c' (default to a space)
String.prototype.padRight = function(len, c) {
	var c = c || " ";
	return this + c.mul(len - this.length);
};

String.padRight = function(s, len, c) {
	return toString(s).padRight(len, c);
};

// Pad on the left up to <len> characters with 'c' (default to a space)
String.prototype.padLeft = function(len, c) {
	var c = c || " ";
	return c.mul(len - this.length) + this;
};

String.padLeft = function(s, len, c) {
	return toString(s).padLeft(len, c);
};

// Indent <indent> levels with c (default to a single space)
String.prototype.indent = function(indent, c) {
	var out = [];
	var s = this.split('\n');
	var c = c || " ";
	var indentStr = c.mul(indent);
	for (var i = 0; i < s.length; i++) {
		out.push(indentStr + s[i]);
	}
	return out.join('\n');
};

String.indent = function(s, indent, c) {
	return toString(s).indent(indent, c);
};

// Repeat a string <l> times ("asdf".mul(4) == "asdfasdfasdfasdf")
String.prototype.mul = function(l) {
	if (l <= 0) return "";
	var a = new Array(l + 1);
	return a.join(this);
};

String.mul = function(s, l) {
	return toString(s).mul(l);
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
		s.push(toString(val));
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



// Math Functions

// Always-positive version of (<val> % <mod>)
// From http://www.svendtofte.com/code/usefull_prototypes/prototypes.js
Math.mod = function(val, mod) {
	if (val < 0) {
		while (val < 0) val += mod;
		return val;
	}
	else {
		return val % mod;
	}
};

// Return true if x is even
function isEven(x) { return x % 2 == 0; }
Number.prototype.isEven = function() {
	return isEven(this);
};

// Return true if x is odd
function isOdd(x) { return x % 2 == 1; }
Number.prototype.isOdd = function() {
	return isOdd(this);
};

// Return true if x is positive
function isPositive(x) { return x > 0; }
Number.prototype.isPositive = function() {
	return isPositive(this);
};

// Return true if x is negative
function isNegative(x) { return x < 0; }
Number.prototype.isNegative = function() {
	return isNegative(this);
};

// Return true if x is a "small" prime (<= 37)
var isSmallPrime = (function() {
	var _smallPrimes = [2,3,5,7,9,11,13,17,19,23,29,31,37];
	return function(x) { return _smallPrimes.indexOf(x) != -1; }
})();
Number.prototype.isSmallPrime = function() {
	return isSmallPrime(this);
};

// Return x*x
function square(x) { return x * x; }

// Get a function to add <n> to another number
function add(n) { return function(x) { return x + n; }; }

// Get a function to multiply another number by <n>
function mul(n) { return function(x) { return x * n; }; }

// Add 1 to a number
var add1 = add(1);

// Subtract one from a number
var sub1 = add(-1);

// Multiply a number by two
var mul2 = mul(2);

// Divide a number by two
var div2 = mul(0.5);

// Get a random integer from [start, end) or [0, start)
function random(start, end, rng) {
	rng = rng || Math.random;

	if (arguments.length < 2) {
		end = start;
		start = 0;
	}

	var range = end - start;

	return Math.floor(start + (rng() * range));
}



// Array Functions

Array.prototype.head = function() {
	return this[0];
};

Array.head = function(a) {
	return a.head();
};

Array.prototype.tail = function() {
	return this.slice(1);
};

Array.tail = function(a) {
	return a.tail();
};

// Get arguments as an array, optionally specifying the first argument to consider
// args[start] is an array, and is the last argument, it is returned as is.
// If you need to get a single argument as an array, nest it, for example, getVarArgs([[1, 2, 3]], 0)
// The purpose of this function is to allow fn(1, 2, 3) to be equivalent to fn([1, 2, 3]).
function getVarArgs(args, start) {
	start = start || 0;

	if ((start == args.length - 1) && typeOf(args[start]) == "array") {
		return args[start];
	}
	else {
		return Array.slice(args, start);
	}
}

// Return the maximum element
Array.prototype.max = function(fn) {
	fn = fn || function(a, b) { return (a > b) ? a : b; };
	return this.reduce(fn);
};
Array.max = function(a, fn) {
	return a.max(fn);
};

// Return the minimum element
Array.prototype.min = function(fn) {
	fn = fn || function(a, b) { return (a < b) ? a : b; };
	return this.reduce(fn);
};
Array.min = function(a, fn) {
	return a.min(fn);
};

// Fill an array with random integers from [<min>, <max>)
Array.prototype.randomize = function(min, max) {
	for (var i = 0; i < this.length; i++) {
		this[i] = random(min, max, Math.random);
	}
	return this;
};
Array.randomize = function(a, min, max) {
	return a.randomize(min, max);
};

// Shuffle an array in place, optionally with a custom random number generator
Array.prototype.shuffle = function(rng) {
	rng = rng || Math.random;
	var n = this.length;
	while (n > 1) {
		var k = random(0, n, rng);
		n--;
		[this[n], this[k]] = [this[k], this[n]];
	}
	return this;
};
Array.shuffle = function(a, rng) {
	return a.shuffle(rng);
};

// Function to pass to sort that does a normal "<" and ">" comparison
function order(a, b) {
	if (a < b) return -1;
	if (a > b) return +1;
	return 0;
}

// Generate an ordering function
// All ordering is done by calling order, which does a "<" and ">" comparison
// The second argument is an optional direction - "desc" reversed the direction of the sort
// Field format:
//   makeOrder("foo")        => order by obj.foo
//   makeOrder(fn)           => order by fn(obj)
//   makeOrder({asc:<foo>})  => makeOrder(foo, "asc")
//     or
//   makeOrder({desc:<foo>}) => makeOrder(foo, "desc")
//     or
//   makeOrder(object)       => makeOrder(object.toString(), "desc")
// For the last form, if the object contains both "asc" and "desc" (i.e. both are truthy), the "asc" property is used.
function makeOrder(field, dir) {
	if (dir && dir.toLowerCase && dir.toLowerCase() == "desc") {
		dir = -1;
	}
	else {
		dir = +1;
	}

	if (typeof field == "function") {
		return function(a, b) { return dir * order(field(a), field(b)); };
	}
	else if (typeof field == "object") {
		// Example: { asc: "FieldName" } or { desc: functionName }
		let {asc: ascOrder, desc:descOrder} = field;
		if (ascOrder)       return makeOrder(ascOrder, "asc");
		else if (descOrder) return makeOrder(descOrder, "desc");
		else                return makeOrder(field.toString(), dir < 0 ? "desc" : "asc");
	}
	else { // String
		return function(a, b) { return dir * order(a[field], b[field]); };
	}
}

// Generate an ordering function on multiple fields
// Each field is passed to <makeOrder>
function multiLevelOrder(fields) {
	var orders = fields.map(makeOrder);

	return function(a, b) {
		for (var i = 0; i < orders.length; i++) {
			var cmp = orders[i](a, b);
			if (cmp) {
				return cmp;
			}
		}
		return 0;
	}
}

// Test two arrays for equality
Array.prototype.compareArrays = function(arr) {
	if (this.length != arr.length) return false;
	for (var i = 0; i < arr.length; i++) {
		if (this[i].compareArrays) { //likely nested array
			if (!this[i].compareArrays(arr[i])) return false;
			else continue;
		}
		if (this[i] != arr[i]) return false;
	}
	return true;
};

Array.compareArrays = function(a, b) {
	return a.compareArrays(b);
};

// Reduce an array from the right
// [].reduceRight(f, start) => f gets called with as f(value, start/current)
if (!Array.prototype.reduceRight) {
	Array.prototype.reduceRight = function(fun /*, initial*/) {
		var len = this.length;
		if (typeof fun != "function") {
			throw new TypeError();
		}

		// no value to return if no initial value, empty array
		if (len == 0 && arguments.length == 1) {
			throw new TypeError();
		}

		var i = len - 1;
		if (arguments.length >= 2) {
			var rv = arguments[1];
		}
		else {
			do {
				if (i in this) {
					rv = this[i--];
					break;
				}

				// if array contains no values, no initial value to return
				if (--i < 0) {
					throw new TypeError();
				}
			} while (true);
		}

		for (; i >= 0; i--) {
			if (i in this) {
				rv = fun.call(null, rv, this[i], i, this);
			}
		}

		return rv;
	};
}

if (!Array.reduceRight) {
	Array.reduceRight = function(a, fnc, start) {
		return a.reduceRight(fnc, start);
	};
}

// Reduce an array from the left
// [].reduce(f, start) => f gets called with as f(value, start/current)
if (!Array.prototype.reduce)
{
	Array.prototype.reduce = function(fun /*, initial*/) {
		var len = this.length;
		if (typeof fun != "function") {
			throw new TypeError();
		}

		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1) {
			throw new TypeError();
		}

		var i = 0;
		if (arguments.length >= 2) {
			var rv = arguments[1];
		}
		else {
			do {
				if (i in this) {
					rv = this[i++];
					break;
				}

				// if array contains no values, no initial value to return
				if (++i >= len) {
					throw new TypeError();
				}
			} while (true);
		}

		for (; i < len; i++) {
			if (i in this) {
				rv = fun.call(null, rv, this[i], i, this);
			}
		}

		return rv;
	};
}

if (!Array.reduce) {
	Array.reduce = function(a, fnc, start) {
		return a.reduce(fnc, start);
	};
}

// Check for the existence of a value in an array
// TODO: Shouldn't this just be "return this.indexOf(x) != -1;"?
Array.prototype.exists = function(x) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == x) return true;
	}
	return false;
};

Array.exists = function(a, x) {
	return a.exists(x);
};

// Return a random element of an array
Array.prototype.random = function() {
	return this[Math.floor((Math.random()*this.length))];
};

Array.random = function(a) {
	return a.random();
};

// Partition an array into buckets based on <fnc>
// Return values from <fnc> are converted to numeric indices
Array.prototype.partition = function(fnc) {
	var map = [];
	for (var i = 0; i < this.length; i++) {
		var x = this[i];
		var key = +fnc(x);
		if (!(key in map)) map[key] = [];
		map[key].push(x);
	}
	return map;
};

Array.partition = function(a, fnc) {
	return a.partition(fnc);
};

function range(begin, end) {
	if (arguments.length < 2) {
		end = begin;
		begin = 0;
	}
	for (let i = begin; i < end; ++i) {
		yield i;
	}
}



// Functional-programming Functions

// Identity function
function identity(x) {
	return x;
}

// Compose functions, e.g. compose(f, g, h)(x) == f(g(h(x)))
// Also accepts an array of functions, i.e. compose([f, g, h]) == compose(f, g, h)
// compose()(x) == x
function compose() {
	var fns = array(arguments);
	if (fns.length == 0) return identity; // keep compose()(x) from returning "arguments"
	if (fns[0].reduceRight) fns = fns[0]; // compose([f, g, h]) === compose(f, g, h);
	return function() {
		return fns.reduceRight(function(f, x) { return [f.apply(null, x)]; }, arguments);
	};
}

// Compose functions in reverse order, e.g. pipe(f, g, h)(x) == h(g(f(x)))
// Also accepts an array of functions, i.e. pipe([f, g, h]) == pipe(f, g, h)
// pipe()(x) == x
function pipe() {
	var fns = array(arguments);
	if (fns.length == 0) return identity; // Optimization -- compose would do it too, also protects next condition
	if (fns[0].reduceRight) fns = fns[0]; // pipe([f, g, h]) === pipe(f, g, h)
	return compose.apply(null, fns.reverse());
}

// Create a function that returns true if "any" of the given functions return true
// It will stop calling the functions when the first one returns true
function any() {
	var fns = arguments;
	return function() {
		for (var i = 0; i < fns.length; i++) {
			if (fns[i].apply(null, arguments)) {
				return true;
			}
		}
		return false;
	};
}

// Create a function that returns true if "all" of the given functions return true
// It will stop calling the functions when the first one returns false
function all() {
	var fns = arguments;
	return function() {
		for (var i = 0; i < fns.length; i++) {
			if (!fns[i].apply(null, arguments)) {
				return false;
			}
		}
		return true;
	};
}



// Encryption Functions

// Encrypt/decrypt a string <s> using basic XOR encryption with <key>
function xor_encrypt(s, key) {
	var e = new Array(s.length);
	var l = key.length;
	for (var i=0; i<s.length; i++) {
		e[i] = String.fromCharCode(s.charCodeAt(i) ^ key.charCodeAt(i % l));
	}
	return e.join("");
};
var xor_decrypt = xor_encrypt;

// Encrypt/decrypt a string <s> using RC-4 encryption with <key>
function rc4_encrypt(s, key) {
	var sbox = new Array(256);
	for(var i=0; i<256; i++) {
		sbox[i] = i;
	}
	var j = 0;
	for (var i=0; i<256; i++) {
		j = (j + sbox[i] + key.charCodeAt(i % key.length)) % 256;
		var tmp = sbox[i];
		sbox[i] = sbox[j];
		sbox[j] = tmp;
	}
	var i = 256;
	var j = 256;
	var rslt = new Array(s.length);
	for (var k=0; k<s.length; k++) {
		i = (i+1) % 256;
		j = (j+sbox[i]) % 256;
		var tmp = sbox[i];
		sbox[i] = sbox[j];
		sbox[j] = tmp;
		t = (sbox[i]+sbox[j]) % 256;
		rslt[k] = String.fromCharCode(s.charCodeAt(k) ^ sbox[t]);
	}
	return rslt.join("");
};
var rc4_decrypt = rc4_encrypt;



// Text Encoding/Decoding Functions

// Decode a base64-encoded string
function base64_decode(s) {
	if ((s.length % 4) == 0) {
		if (typeof(atob) != "undefined") {
			return atob(s);
		}
		else {
			var nBits;
			var sDecoded = new Array(s.length / 4);
			var base64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			for (var i=0; i<s.length; i+=4) {
				nBits = (base64.indexOf(s.charAt(i)) & 0xff) << 18 |
				(base64.indexOf(s.charAt(i+1)) & 0xff) << 12 |
				(base64.indexOf(s.charAt(i+2)) & 0xff) << 6 |
				(base64.indexOf(s.charAt(i+3)) & 0xff);
				sDecoded[i] = String.fromCharCode((nBits & 0xff0000) >> 16, (nBits & 0xff00) >> 8, nBits & 0xff);
			}
			sDecoded[sDecoded.length-1] = sDecoded[sDecoded.length-1].substring(
				0, 3 - ((s.charCodeAt(i-2) == 61) ? 2: (s.charCodeAt(i-1) == 61 ? 1 : 0)));
			return sDecoded.join("");
		}
	}
	else {
		throw new Exception("String length must be divisible by 4.");
	}
}

// Base64-encode a string
function base64_encode(s) {
	if(typeof(btoa) != "undefined") {
		return btoa(s);
	}
	else {
		var base64 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
		              'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
		              '0','1','2','3','4','5','6','7','8','9','+','/'];
		var sbin;
		var pad = 0;
		var s = toString(s);
		if ((s.length % 3) == 1) {
			s += String.fromCharCode(0);
			s += String.fromCharCode(0);
			pad = 2;
		}
		else if ((s.length % 3) == 2) {
			s += String.fromCharCode(0);
			pad = 1;
		}
		var rslt = new Array(s.length / 3);
		var ri = 0;
		for (var i=0; i<s.length; i+=3) {
			sbin = ((s.charCodeAt(i) & 0xff) << 16) | ((s.charCodeAt(i+1) & 0xff) << 8) | (s.charCodeAt(i+2) & 0xff);
			rslt[ri] = (base64[(sbin>>18) & 0x3f] + base64[(sbin>>12) & 0x3f] + base64[(sbin>>6) & 0x3f] + base64[sbin & 0x3f]);
			ri++;
		}
		if (pad > 0) {
			rslt[rslt.length - 1] = rslt[rslt.length - 1].substr(0, 4-pad) + ((pad==2) ? "==" : (pad==1) ? "=" : "");
		}
		return rslt.join("");
	}
}

// Decode a URI-encoded string
var uri_decode = decodeURIComponent;

// URI-encode a string
var uri_encode = encodeURIComponent;

// LZW-compress a string
function lzw_encode(s) {
	var dict = {};
	var data = (s + "").split("");
	var out = [];
	var currChar;
	var phrase = data[0];
	var code = 256;
	for (var i=1; i<data.length; i++) {
		currChar=data[i];
		if (dict[phrase + currChar] != null) {
			phrase += currChar;
		}
		else {
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			dict[phrase + currChar] = code;
			code++;
			phrase=currChar;
		}
	}
	out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	for (var i=0; i<out.length; i++) {
		out[i] = String.fromCharCode(out[i]);
	}
	return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
	var dict = {};
	var data = (s + "").split("");
	var currChar = data[0];
	var oldPhrase = currChar;
	var out = [currChar];
	var code = 256;
	var phrase;
	for (var i=1; i<data.length; i++) {
		var currCode = data[i].charCodeAt(0);
		if (currCode < 256) {
			phrase = data[i];
		}
		else {
			phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
		}
		out.push(phrase);
		currChar = phrase.charAt(0);
		dict[code] = oldPhrase + currChar;
		code++;
		oldPhrase = phrase;
	}
	return out.join("");
}



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
JSON = function() {

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
		}
	}

	return {
		encode: stringify,
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

json_encode = JSON.encode;
json_decode = JSON.parse;
delete JSON;



// Timer Functions

// From Simulated browser environment for Rhino
// By John Resig <http://ejohn.org/>
// Copyright 2007 John Resig, under the MIT License

(function() {
	var timers = [];

	// Run <fn> after <time> milliseconds
	this.setTimeout = function(fn, time) {
		var num;
		return num = setInterval(function() {
			fn();
			clearInterval(num);
		}, time);
	};

	// Run <fn> every <time> milliseconds
	this.setInterval = function(fn, time) {
		var num = timers.length;

		timers[num] = thread(function() {
			while (true) {
				sleep(time);
				fn();
			}
		});

		timers[num].start();

		return num;
	};

	// Prevent a function from being called
	// <num> is the return value from setTimeout or setInterval
	this.clearInterval = function(num) {
		if (timers[num]) {
			timers[num].stop();
			delete timers[num];
		}
	};
})();



// Network Functions

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
				var url = new java.net.URL(baseURL, self.url);
				
				if ( url.getProtocol() == "file" ) {
					if ( self.method == "PUT" ) {
						var out = new java.io.FileWriter( 
								new java.io.File( new java.net.URI( url.toString() ) ) ),
							text = new java.lang.String( data || "" );
						
						out.write( text, 0, text.length() );
						out.flush();
						out.close();
					}
					else if ( self.method == "DELETE" ) {
						var file = new java.io.File( new java.net.URI( url.toString() ) );
						file["delete"]();
					}
					else {
						var connection = url.openConnection();
						connection.connect();
						handleResponse();
					}
				}
				else { 
					var connection = url.openConnection();
					
					connection.setRequestMethod( self.method );
					
					// Add headers to Java connection
					for (var header in self.headers)
						connection.addRequestProperty(header, self.headers[header]);
				
					connection.connect();
					
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
					self.readyState = 4;
					self.status = parseInt(connection.responseCode) || undefined;
					self.statusText = connection.responseMessage || "";
					
					var stream = new java.io.InputStreamReader(connection.getInputStream()),
						buffer = new java.io.BufferedReader(stream), line;
					
					while ((line = buffer.readLine()) != null)
						self.responseText += line;
						
					self.responseXML = null;
					
					if ( self.responseText.match(/^\s*</) ) {
						try {
							self.responseXML = new DOMDocument(
								new java.io.ByteArrayInputStream(
									(new java.lang.String(
										self.responseText)).getBytes("UTF8")));
						} catch(e) {}
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
					if (rHeader.match(new Regexp(header, "i")))
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

