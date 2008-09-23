// File System Functions

JSLIB.require("string");

// Get the current directory
// Optional <asURL> for URL version
function getcwd(asURL) {
	var f = new java.io.File("");
	return "" + (asURL ? f.toURL() : f.getCanonicalPath());
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
	files = array(files).map(string);

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
		return string(s);
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
readline = (function() {
	var stdin = new java.io.BufferedReader(new java.io.InputStreamReader(java.lang.System["in"]));
	return function(stream) {
		var input = stream ? new java.io.BufferedReader(new java.io.InputStreamReader(stream)) : stdin;
		var line = input.readLine();
		return line !== null ? string(line) : null;
	}
})();

// Check a filename to make sure it exists (it may be a directory)
function fileExists(filename) {
	return new java.io.File(filename.toString()).exists();
}

