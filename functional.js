// Functional-programming Functions

JSLIB.require("array");

// Identity function
function identity(x) {
	return x;
}

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

