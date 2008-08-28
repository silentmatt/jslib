// General Utilities

JSLIB = { version: "0.1a" };
JSLIB.loaded = {};
JSLIB.require = function() {
	var args = getVarArgs(arguments);
	for (var i = 0; i < args.length; i++) {
		var mod = args[i];
		if (!JSLIB.loaded[mod]) {
			include("jslib/" + mod);
			JSLIB.loaded[mod] = true;
		}
	}
};

// 1.0pre1 < 1.0pre2 < 1.0 == 1.0.0 == 1.0.0.0 < 1.1pre == 1.1pre0 == 1.0+ < 1.1pre1a < 1.1pre1 < 1.1pre10a < 1.1pre10

// 1.-1
// < 1 == 1. == 1.0 == 1.0.0
// < 1.1a < 1.1aa < 1.1ab < 1.1b < 1.1c
// < 1.1whatever
// < 1.1pre == 1.1pre0 == 1.0+
// < 1.1pre1a < 1.1pre1aa < 1.1pre1b < 1.1pre1
// < 1.1pre2
// < 1.1pre10
// < 1.1.-1
// < 1.1 == 1.1.0 == 1.1.00
// < 1.10
// < 1.* < 1.*.1
// < 2.0
(function() {
	function VersionPart(numA, strB, numC, extraD) {
		this.numA = numA;
		this.strB = strB; // can be a null pointer
		this.numC = numC;
		this.extraD = extraD;
	};

	function strtol(s) {
		return [parseInt(s), s.replace(/^[-+]?[0-9]+/, '')];
	}

	function ParseVP(part, result) {
		result.numA = 0;
		result.strB = null;
		result.numC = 0;
		result.extraD = null;

		if (part === null || part === undefined)
			return part;

		var subParts = part.split('.');
		part = subParts.shift();
		var dot = subParts.join('.');

		if (part == '*') {
			result.numA = Infinity;
			result.strB = "";
		}
		else {
			result.numA = parseInt(part) || 0;
			result.strB = part.replace(/^[-+]?[0-9]+/, '');
		}

		if (result.strB === "") {
			result.strB = null;
		}
		else {
			if (result.strB.charAt(0) == '+') {
				++result.numA;
				result.strB = "pre";
			}
			else {
				if (/[-+0123456789]/.test(result.strB)) {
					var extra = result.strB;

					result.strB = result.strB.replace(/[-+0123456789].*$/, "");

					extra = extra.substring(result.strB.length);

					result.numC = parseInt(extra);
					result.extraD = extra.replace(/^[-+]?[0-9]+/, '');
					if (result.extraD === "") {
						result.extraD = null;
					}
				}
			}
		}

		return dot;
	}

	function compare(a, b) {
		if (a < b) return -1;
		if (a > b) return +1;
		return 0;
	}

	function strcmp(str1, str2)
	{
		// any string is *before* no string
		if (str1 === null || str1 === undefined)
			return str2 !== null && str2 !== undefined;

		if (str2 === null || str2 === undefined)
			return -1;

		return compare(str1, str2);
	}

	function CompareVP(v1, v2) {
		var r = compare(v1.numA, v2.numA);
		if (r) return r;

		r = strcmp(v1.strB, v2.strB);
		if (r) return r;

		r = compare(v1.numC, v2.numC);
		if (r) return r;

		return strcmp(v1.extraD, v2.extraD);
	}

	JSLIB.compareVersions = function(a, b) {
		a = string(a);
		b = string(b);

		if (!a) {
			return b ? -1 : 0;
		}

		if (!b) {
			return 1;
		}

		var result = 0;

		do {
			va = new VersionPart(), vb = new VersionPart();

			a = ParseVP(a, va);
			b = ParseVP(b, vb);

			result = CompareVP(va, vb);
			if (result)
				break;
		} while (a || b);

		return result;
	}
})();

// Convert a value to a *JavaScript* string (including Java strings)
// This is sometimes necessary because typeof(javaObject.toString()) != "string"
function string(s) {
	if (typeof s === "string" || typeof s === "undefined" || s === null) {
		return s;
	}
	return "" + s;
}

var isString = (function() {
	var javaStringClass = new java.lang.String().getClass();

	return function(s) {
		return !!(typeof s === "string" || s instanceof String || (s.getClass && s.getClass() === javaStringClass));
	}
})();

// Create an object, env, containing the system environment as properties
var env = {};
(function() {
	var envIterator = java.lang.System.getenv().entrySet().iterator();

	while (envIterator.hasNext()) {
		var envEntry = envIterator.next();
		var key = string(envEntry.getKey());
		var value = string(envEntry.getValue());
		env[key] = value;
	}
})();

// Exception object
// <msg> is a description of the exception
// <trace> is an optional Exception that caused this one
// The following is based on jsolait (http://jsolait.net/)
function Exception(msg, trace) {
	this.name = "Exception";
	this.message = msg;
	this.trace = trace;

	this.toString = function() {
		return this.toTraceString();
	};

	this.toTraceString = function(indent) {
		function indentString(s, indent) {
			var prefix = new Array(indent + 1).join(" ");
			return s.split("\n").map(function(x) { return x ? prefix + x : x; }).join("\n");
		}
		indent = indent || 0;
		var s = indentString(this.name + "\n" + indentString(this.message, indent), indent) + "\n";
		if (this.trace) {
			if (this.trace.toTraceString) {
				s += ('\nbecause:\n' + this.trace.toTraceString(indent + 4));
			} else {
				s += indentString(this.trace + '\n', indent + 4);
			}
		}
		return s;
	};
}


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

// Include/run javascript files
// The file MUST end with ".js", but the caller can leave it off
// The file is searched for in the current directory, $HOME/lib/, $HOME/lib/js, the directories in java.library.path, and directories in $JSLIB_PATH
// If $HOME is not set, "/usr/" will be substituted
// A global variable, __FILE__ will be defined with the absolute path to the file
include = (function() {
	var globalContext = this;
	var moduleSearchPath = [];

	// TODO: make "/usr" depend on the OS?
	var HOME = (environment["user.home"] ? ("" + environment["user.home"]) : "/usr");

	function expand(path) {
		return path.replace("{HOME}", HOME);
	}

	function absPath(p) {
		return "" + new java.io.File(p).getAbsolutePath();
	}

	function includeFunction() {
		var args = getVarArgs(arguments);
		for (var i = 0; i < args.length; i++) {
			doImport(args[i]);
		}
	}

	includeFunction.addPath = function(path) {
		moduleSearchPath.push(absPath(expand(path)));
	};

	includeFunction.prependPath = function(path) {
		moduleSearchPath.unshift(absPath(expand(path)));
	};

	includeFunction.removePath = function(path) {
		path = absPath(expand(path));

		var i = -1;
		while ((i = moduleSearchPath.indexOf(path)) != -1) {
			moduleSearchPath.splice(i, 1);
		}
	};

	includeFunction.addPaths = function(paths) {
		for (var i = 0; i < paths.length; i++) {
			if (paths[i] !== "") {
				includeFunction.addPath(paths[i]);
			}
		}
	};

	includeFunction.prependPaths = function(paths) {
		for (var i = paths.length - 1; i >= 0; i--) {
			if (paths[i] !== "") {
				includeFunction.prependPath(paths[i]);
			}
		}
	};

	includeFunction.getSearchPath = function() {
		return [].concat(moduleSearchPath);
	};

	["", "{HOME}/lib", "{HOME}/lib/js"].forEach(includeFunction.addPath);

	var pathSep = "" + environment["path.separator"] || ":";
	includeFunction.addPaths(("" + environment["java.library.path"] || "").split(pathSep));
	includeFunction.addPaths((env.JSLIB_PATH || "").split(pathSep));

	function doImport(name) {
		function ImportFailed(moduleName, ex) {
			if (!(this instanceof ImportFailed)) {
				return new ImportFailed(moduleName);
			}
			this.message = "Failed to import module: '" + moduleName + "'";
			if (ex) {
				this.message += ": " + ex;
			}
		}
		ImportFailed.prototype.toString = function() {
			return this.message;
		};

		function fileExists(filename) {
			return new java.io.File(filename.toString()).exists();
		}

		// TODO: Make this OS-independent
		function isAbsolute(path) {
			return new java.io.File(path).isAbsolute();
		}

		function endsWith(path, ext) {
			return (path.length - ext.length) == path.toLowerCase().lastIndexOf(ext.toLowerCase());
		}

		function loadFile(name) {
			if (!endsWith(name, ".js")) {
				name = name + ".js";
			}

			if (!fileExists(name)) {
				return false;
			}

			try {
				var old__FILE__ = globalContext.__FILE__;
				globalContext.__FILE__ = absPath(name);
				load(name);
			}
			finally {
				delete globalContext.__FILE__;
				globalContext.__FILE__ = old__FILE__;
			}

			return true;
		}

		if (isAbsolute(name)) {
			try {
				if (!loadFile(name)) {
					throw new ImportFailed(name, "File not found");
				}
			}
			catch (ex) {
				throw new ImportFailed(name, ex);
			}
		}
		else {
			var fileName = "/" + name;

			try {
				for(i = 0; i < moduleSearchPath.length; i++) {
					var path = moduleSearchPath[i] + fileName;
					if (loadFile(path)) {
						return;
					}
				}
			}
			catch (ex) {
				throw new ImportFailed(name, ex);
			}

			throw new ImportFailed(name, "File not found");
		}
	}

	return includeFunction;
})();

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

function javaArray(length, type) {
	if (typeOf(length) == "array") {
		var ja = javaArray(length.length, type || java.lang.Object);
		for (var i = 0; i < ja.length; i++) {
			ja[i] = length[i];
		}
		return ja;
	}

	return java.lang.reflect.Array.newInstance(type || java.lang.Object, length || 0);
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

// Get the prototype of an object
if (typeof Object.getPrototypeOf !== "function") {
	Object.getPrototypeOf = function(object) {
		return object.__proto__;
	};
}

// Prevent an object from being modified
if (typeof Object.freeze !== "function") {
	Object.freeze = function(object) {
		return seal(object);
	};
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

JSLIB.loaded["jslib"] = true;

JSLIB.core = [ "thread", "filesystem", "string", "console", "math", "array", "functional", "json", "xmlhttprequest" ];
JSLIB.extras = [ "complex", "dialog", "encoding", "encryption", "inflector", "roman" ];

JSLIB.require(core);

