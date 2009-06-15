// Array Functions

JSLIB.require("math");

Array.isNullOrEmpty = function(a) {
	return !a || a.length == 0;
};

Array.isArrayLike = function(o) {
	return typeOf(o) == 'array' || (o && typeof(o.length) == 'number');
};


// Flatten an array structure
Array.flatten = function (lst) {
	function _flattenArray(res, lst) {
		for (var i = 0; i < lst.length; i++) {
			var o = lst[i];
			if (o instanceof Array) {
				arguments.callee(res, o);
			} else {
				res.push(o);
			}
		}
		return res;
	}

	return _flattenArray([], lst);
};

Array.prototype.flatten = function() {
	return Array.flatten(this);
};

Array.zip = function() {
	throw new Error("Array.zip not implemented");
};

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
		var a = this; // XXX: [this[n], this[k]] = ... throws assertion error. Bug in rhino?
		[a[n], a[k]] = [this[k], this[n]];
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
	};
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

Array.compare = function(a, b, comparer) {
	var count = a.length;
	var rval = 0;
	if (count > b.length) {
		rval = 1;
		count = b.length;
	} else if (count < b.length) {
		rval = -1;
	}

	comparer = comparer || compare;
	for (var i = 0; i < count; i++) {
		var cmp = comparer(a[i], b[i]);
		if (cmp) {
			return cmp;
		}
	}
	return rval;
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

Array.prototype.uniq = function(comp) {
	if (this.length <= 1) return this.slice();
	comp = comp || function(a, b) { return a === b ? 0 : 1; };

	var last = this[0];
	var newArray = [last];
	var len = this.length;

	for (var i = 1; i < len; i++) {
		if (comp(this[i], last) != 0) {
			last = this[i];
			newArray.push(last);
		}
	}
	return newArray;
};

Array.uniq = function(a, comp) {
	return Array.prototype.uniq.call(a, comp);
};

function range(begin, end, skip) {
	if (arguments.length < 2) {
		end = begin;
		begin = 0;
	}
	skip = skip || 1;
	for (let i = begin; i < end; i += skip) {
		yield i;
	}
}

// Create a function that counts from n (default = 0)
function counter(n) {
	n = n || 0;
	return function() {
		return n++;
	};
}
