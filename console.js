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

