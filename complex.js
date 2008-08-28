JSLIB.require("math", "string");

// complex constructor
// [new] complex()
// [new] complex(complex)
// [new] complex(real)
// [new] complex(real, imaginary)
// [new] complex({x: real, y: imaginary})
// [new] complex([real, imaginary])
function complex(re, im) {
	if (!(this && this instanceof complex)) {
		return new complex(re, im);
	}

	if (complex && re instanceof complex) {
		this.real = re.real;
		this.imag = re.imag;
	}
	else {
		var type = typeOf(re);

		if (type == "array") {
			[this.real, this.imag] = re;
		}
		else if (type == "object") {
			let {x: this.real, y: this.imag} = re;
		}
		else {
			if (isNaN(re)) this.real = NaN;
			else           this.real = +re || 0;
			if (isNaN(im)) this.imag = NaN;
			else           this.imag = +im || 0;
		}
	}
}

// Methods

complex.prototype = {
	toString: function(format) {
		return (format || "%(real)f%(imag)+fi").format(this);
	},

	toCoordinateString: function() {
		return this.toString("(%(real)f, %(imag)f)");
	},

	toPoint: function() {
		return point(this.real, this.imag);
	},

	add: function(b) {
		return new complex(this.real + real(b), this.imag + imag(b));
	},

	subtract: function(b) {
		return new complex(this.real - real(b), this.imag - imag(b));
	},

	multiply: function(other) {
		if (this.isNaN() || other.isNaN()) {
			return new complex(complex.NaN);
		}
		if (this.isInfinite() || other.isInfinite()) {
            return new complex(complex.Infinity);
        }
		// (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
		var a = this.real;
		var b = this.imag;
		var c = real(other);
		var d = imag(other);
		return new complex(a*c - b*d, a*d + b*c);
	},

	divide: function(b) {
		if (complex.isNaN(this) || complex.isNaN(b)) {
			return new complex(complex.NaN);
		}

		var c = real(b);
		var d = imag(b);
		if (c == 0.0 && d == 0.0) {
			return new complex(complex.NaN);
		}

		if (complex.isInfinite(b) && !complex.isInfinite(this)) {
			return new complex(0, 0);
		}

		if (Math.abs(c) < Math.abs(d)) {
			if (d == 0.0) {
				return new complex(this.real / c, this.imag / c);
			}
			var q = c / d;
			var denominator = c * q + d;
			return new complex((this.real * q + this.imag) / denominator,
				(this.imag * q - this.real) / denominator);
		} else {
			if (c == 0.0) {
				return new complex(this.imag / d, -this.real / c);
			}
			var q = d / c;
			var denominator = d * q + c;
			return new complex((this.imag * q + this.real) / denominator,
				(this.imag - this.real * q) / denominator);
		}
	},

	negate: function() {
		return new complex(-this.real, -this.imag);
	},

	conjugate: function() {
		if (complex.isNaN(this)) {
			return new complex(complex.NaN);
		}
		return new complex(this.real, -this.imag);
	},

	equals: function(other, tolerance) {
		if (this == other) {
			return true;
		}
		else if (other == null) {
			return false;
		}
		else if (!isFinite(this.real) || !isFinite(this.imag) || !isFinite(real(other)) || !isFinite(imag(other))) {
			var a = new complex(this);
			var b = new complex(other);
			if (!isFinite(a.real)) a.real = a.real > 0 ? 1 : -1;
			if (!isFinite(a.imag)) a.imag = a.imag > 0 ? 1 : -1;
			if (!isFinite(b.real)) b.real = b.real > 0 ? 1 : -1;
			if (!isFinite(b.imag)) b.imag = b.imag > 0 ? 1 : -1;
			return a.equals(b, tolerance);
		}
		else {
			if (complex.isNaN(other)) {
				return false;
			}
			else if (tolerance) {
				return Math.abs(this.real - real(other)) <= tolerance && Math.abs(this.imag - imag(other)) <= tolerance;
			}
			else {
				return this.real == real(other) && this.imag == imag(other);
			}
		}
    },

	sqrt1z: function() {
		return complex.sqrt1z(this);
    },

	isNaN: function() {
		return complex.isNaN(this);
	},

	isInfinite: function() {
		return complex.isInfinite(this);
	},

	isFinite: function() {
		return complex.isFinite(this);
	},

	abs: function() {
		return complex.abs(this);
	},

	acos: function() {
		return complex.acos(this);
	},

	asin: function() {
		return complex.asin(this);
	},

	atan: function() {
		return complex.atan(this);
	},

	cos: function() {
		return complex.cos(this);
	},

	cosh: function() {
		return complex.cosh(this);
	},

	exp: function() {
		return complex.exp(this);
	},

	log: function() {
		return complex.log(this);
	},

	pow: function(x) {
		return complex.pow(this, x);
	},

	sin: function() {
		return complex.sin(this);
	},

	sinh: function() {
		return complex.sinh(this);
	},

	sqrt: function() {
		return complex.sqrt(this);
	},

	tan: function() {
		return complex.tan(this);
	},

	tanh: function() {
		return complex.tanh(this);
	},

	sqrt1z: function() {
		return complex.sqrt1z(this);
	}
};


// Static "Constants"
complex.I = new complex(0, 1);
complex.ONE = new complex(1, 0);
complex.ZERO = new complex(0, 0);
complex.PI = new complex(Math.PI, 0);
complex.NaN = new complex(NaN, NaN);
complex.Infinity = new complex(Infinity, Infinity);

// Static Methods

function real(x) {
	if (x && x.real != undefined) {
		return x.real;
	}
	else if (x && "x" in x) {
		return x.x;
	}
	else if (typeOf(x) == "array") {
		return x.length >= 1 ? x[0] : 0;
	}
	else {
		return +x;
	}
}

function imag(x) {
	if (x && x.imag != undefined) {
		return x.imag;
	}
	else if (x && "y" in x) {
		return x.y;
	}
	else if (typeOf(x) == "array") {
		return x.length >= 2 ? x[1] : 0;
	}
	else {
		return 0;
	}
}

function polar2complex(r, theta) {
	if (r < 0) {
		throw new IllegalArgumentException("Complex modulus must not be negative");
	}
	return new complex(r * Math.cos(theta), r * Math.sin(theta));
}

complex.isNaN = function(x) {
	return isNaN(real(x)) || isNaN(imag(x));
};

complex.isInfinite = function(x) {
	return !complex.isNaN(x) && (!isFinite(real(x)) || !isFinite(imag(x)));
};

complex.isFinite = function(x) {
	return !complex.isInfinite(x);
};

complex.abs = function(x) {
	if (complex.isNaN(x)) {
		return NaN;
	}

	if (complex.isInfinite(x)) {
		return Infinity;
	}

	if (Math.abs(real(x)) < Math.abs(imag(x))) {
		if (x.imag == 0.0) {
			return Math.abs(real(x));
		}
		var q = real(x) / imag(x);
		return (Math.abs(imag(x)) * Math.sqrt(1 + q*q));
	}
	else {
		if (real(x) == 0.0) {
			return Math.abs(imag(x));
		}
		var q = imag(x) / real(x);
		return (Math.abs(real(x)) * Math.sqrt(1 + q*q));
	}
};

complex.conjugate = function(x) {
	return (new complex(x)).conjugate();
};

complex.acos = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return complex.log(x.add(x.sqrt1z().multiply(complex.I))).multiply(complex.I.negate());
};

complex.asin = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return complex.log(x.sqrt1z().add(x.multiply(complex.I))).multiply(complex.I.negate());
};

complex.atan = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return complex.log(x.add(complex.I).divide(complex.I.subtract(x))).multiply(complex.I.divide(new complex(2.0, 0.0)));
};

complex.cos = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return new complex(Math.cos(real(x)) * Math.cosh(imag(x)),	-Math.sin(real(x)) * Math.sinh(imag(x)));
};

complex.cosh = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return new complex(Math.cosh(real(x)) * Math.cos(imag(x)), Math.sinh(real(x)) * Math.sin(imag(x)));
};

complex.exp = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	var expReal = Math.exp(real(x));
	return new complex(expReal *  Math.cos(imag(x)), expReal * Math.sin(imag(x)));
};

complex.log = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return new complex(Math.log(complex.abs(x)), Math.atan2(imag(x), real(x)));
};

complex.pow = function(x, y) {
	return complex.exp(complex.log(x).multiply(y));
};

complex.sin = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return new complex(Math.sin(real(x)) * Math.cosh(imag(x)), Math.cos(real(x)) * Math.sinh(imag(x)));
};

complex.sinh = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	return new complex(Math.sinh(real(x)) * Math.cos(imag(x)), Math.cosh(real(x)) * Math.sin(imag(x)));
};

complex.sqrt = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	if (real(x) == 0.0 && imag(x) == 0.0) {
		return new complex(0, 0);
	}

	var t = Math.sqrt((Math.abs(real(x)) + complex.abs(x)) / 2.0);
	if (real(x) >= 0.0) {
		return new complex(t, imag(x) / (2.0 * t));
	}
	else {
		return new complex(Math.abs(imag(x)) / (2.0 * t), Math.indicator(imag(x)) * t);
	}
};

complex.tan = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	var real2 = 2.0 * real(x);
	var imaginary2 = 2.0 * imag(x);
	var d = Math.cos(real2) + Math.cosh(imaginary2);

	return new complex(Math.sin(real2) / d, Math.sinh(imaginary2) / d);
};

complex.tanh = function(x) {
	if (complex.isNaN(x)) {
		return new complex(complex.NaN);
	}

	var real2 = 2.0 * real(x);
	var imaginary2 = 2.0 * imag(x);
	var d = Math.cosh(real2) + Math.cos(imaginary2);

	return new complex(Math.sinh(real2) / d, Math.sin(imaginary2) / d);
};

complex.sqrt1z = function(x) {
	return complex.sqrt((new complex(1.0, 0.0)).subtract(x.multiply(x)));
};
