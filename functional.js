// Functional-programming Functions

JSLIB.require("array");

// Identity function
function identity(x) {
	return x;
}

var operator = {
	// unary logic operators
	truth: function (a) { return !!a; },
	not: function (a) { return !a; },
	identity: function (a) { return a; },

	// bitwise unary operators
	bitnot: function (a) { return ~a; },

	// unary operators
	neg: function (a) { return -a; },

	// binary operators
	add: function (a, b) { return a + b; },
	sub: function (a, b) { return a - b; },
	div: function (a, b) { return a / b; },
	mod: function (a, b) { return a % b; },
	mul: function (a, b) { return a * b; },

	// bitwise binary operators
	bitand: function (a, b) { return a & b; },
	bitor: function (a, b) { return a | b; },
	bitxor: function (a, b) { return a ^ b; },
	xor:    function (a, b) { return a ^ b; },
	lshift: function (a, b) { return a << b; },
	rshift: function (a, b) { return a >> b; },
	zrshift: function (a, b) { return a >>> b; },

	// near-worthless built-in comparators
	eq: function (a, b) { return a == b; },
	ne: function (a, b) { return a != b; },
	gt: function (a, b) { return a > b; },
	ge: function (a, b) { return a >= b; },
	lt: function (a, b) { return a < b; },
	le: function (a, b) { return a <= b; },

	// strict built-in comparators
	seq: function (a, b) { return a === b; },
	sne: function (a, b) { return a !== b; },

	// compare comparators
	ceq: function (a, b) { return compare(a, b) === 0; },
	cne: function (a, b) { return compare(a, b) !== 0; },
	cgt: function (a, b) { return compare(a, b) == 1; },
	cge: function (a, b) { return compare(a, b) != -1; },
	clt: function (a, b) { return compare(a, b) == -1; },
	cle: function (a, b) { return compare(a, b) != 1; },

	// binary logical operators
	and: function (a, b) { return a && b; },
	or: function (a, b) { return a || b; },
	contains: function (a, b) { return b in a; }
};

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

Function.partial = function(func) {
	return Function.bind.apply(this, [func, undefined].concat(array(arguments, 1)));
};

// Get a function that returns a property of it's argument
function itemgetter(key) {
	return function(arg) {
		return arg[key];
	};
}

// Get a function that calls a method (key or function reference) on it's argument
function methodcaller(func /*, args... */) {
	var args = array(arguments, 1);

	if (typeof(func) == "function") {
		return function (obj) {
			return func.apply(obj, args);
		};
	} else {
		return function (obj) {
			return obj[func].apply(obj, args);
		};
	}
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

