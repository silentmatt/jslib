// Math Functions

JSLIB.require("jslib");

// Return x*x
function square(x) { return x * x; }
Math.square = square;

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

/**
 * Calculates and returns the inverse hyperbolic cosine of a number in 2D
 * Cartesian space.
 *
 * @summary             inverse hyperbolic cosine
 * @param fX            a floating-point number greater than or equal to 1
 * @return              the inverse hyperbolic cosine of <code>fX</code>
 * @return              <code>NaN</code> if <code>fX < 1</code>
 */
Math.acosh = function(fX) {
	return Math.log(fX + Math.sqrt(Math.pow(fX, 2) - 1));
};


/**
 * Calculates and returns the inverse cotangent of a number in 2D Cartesian
 * space.
 *
 * @summary             inverse cotangent
 * @param fX            a floating-point number
 * @return              the inverse cotangent of <code>fX</code> in radians
 */
Math.acot = function(fX) {
	return Math.atan(1 / fX);
};


/**
 * Calculates and returns the inverse hyperbolic cotangent of a number in 2D
 * Cartesian space.
 *
 * @summary             inverse hyperbolic cotangent
 * @param fX            a floating-point number less than or equal to -1 or
 *                      greater than or equal to 1
 * @return              the inverse hyperbolic cotangent of <code>fX</code>
 * @return              <code>NaN</code> if <code>-1 < fX < 1</code>

 */
Math.acoth = function(fX) {
	return Math.log((fX + 1) / (fX - 1)) / 2;
};


/**
 * Calculates and returns the inverse cosecant of a number in 2D Cartesian
 * space.
 *
 * @summary             inverse cosecant
 * @param fX            a floating-point number less than or equal to -1 or
 *                      greater than or equal to 1
 * @return              the inverse cosecant of <code>fX</code> in radians
 * @return              <code>NaN</code> if <code>-1 < fX < 1</code>

 */
Math.acsc = function(fX) {
	return Math.asin(1 / fX);
};


/**
 * Calculates and returns the inverse hyperbolic cosecant of a number in 2D
 * Cartesian space.
 *
 * @summary             inverse hyperbolic cosecant
 * @param fX            a floating-point number
 * @return              the inverse hyperbolic cosecant of <code>fX</code>

 */
Math.acsch = function(fX) {
	return Math.log(Math.sqrt((1 / Math.pow(fX, 2)) + 1) + (1 / fX));
};


/**
 * Calculates if two numbers are approximately equal. Approximation defaults
 * to +/- 0.01 but can be optionally set using the <code>fEpsilon</code>
 * argument
 *
 * @summary             approximately equal
 * @param fX            a floating-point number
 * @param fY            a floating-point number
 * @param fEpsilon      accuracy of approximation (optional)
 * @return              true if <code>fX</code> and <code>fY</code> are
 *                      approximately equal; false otherwise
 */
Math.approx = function() {
	var fX, fY;
	var fEpsilon = 0.01;

	fX = arguments[0];
	fY = arguments[1];
	fEpsilon = arguments[2];
	return Math.abs(fX - fY) < fEpsilon;
};


/**
 * Calculates the polar angle (argument) of a pair of rectangular coordinates.
 *
 * @summary             polar angle (argument)
 * @param fX            a floating-point number
 * @param fY            a floating-point number
 * @return              the polar angle (argument)
 * @see                 <code>math.sign()</code>
 */
Math.arg = function(fX, fY) {
	return Math.atan2(fY, fX) + (Math.PI / 2) * Math.sign(fY) * (1 - Math.sign(fX));
};


/**
 * Calculates and returns the inverse secant of a number in 2D Cartesian
 * space.
 *
 * @summary             inverse secant
 * @param fX            a floating-point number less than or equal to -1 or
 *                      greater than or equal to 1
 * @return              the inverse secant of <code>fX</code> in radians
 * @return              <code>NaN</code> if <code>-1 < fX < 1</code>
 */
Math.asec = function(fX) {
	return Math.acos(1 / fX);
};


/**
 * Calculates and returns the inverse hyperbolic secant of a number in 2D
 * Cartesian space.
 *
 * @summary             inverse hyperbolic secant
 * @param fX            a floating-point number between 0 and 1 inclusive
 * @return              the inverse hyperbolic secant of <code>fX</code>
 * @return              <code>NaN</code> if <code>fX < 0</code> or
 *                      <code>fX > 1</code>
 */
Math.asech = function(fX) {
	return Math.log(Math.sqrt((1 / Math.pow(fX, 2)) - 1) + (1 / fX));
};


/**
 * Calculates and returns the inverse hyperbolic sine of a number in 2D
 * Cartesian space.
 *
 * @summary             inverse hyperbolic sine
 * @param fX            a floating-point number
 * @return              the inverse hyperbolic sine of <code>fX</code>
 */
Math.asinh = function(fX) {
	return Math.log(fX + Math.sqrt(Math.pow(fX, 2) + 1));
};


/**
 * Calculates and returns the inverse hyperbolic tangent of a number in 2D
 * Cartesian space.
 *
 * @summary             inverse hyperbolic tangent
 * @param fX            a floating-point number between -1 and 1 inclusive
 * @return              the inverse hyperbolic tangent of <code>fX</code>
 * @return              <code>NaN</code> if <code>fX < -1</code> or
 *                      <code>fX > 1</code>
 */
Math.atanh = function(fX) {
	return Math.log((1 + fX) / (1 - fX)) / 2;
};


/**
 * Calculates and returns the hyperbolic cosine of a number in 2D Cartesian
 * space.
 *
 * @summary             hyperbolic cosine
 * @param fX            a floating-point number
 * @return              the hyperbolic cosine of <code>fX</code>
 */
Math.cosh = function(fX) {
	return (Math.exp(fX) + Math.exp(-fX)) / 2;
};


/**
 * Calculates and returns the cotangent of a number in 2D Cartesian space.
 *
 * @summary             cotangent
 * @param fX            a floating-point number
 * @return              the cotangent of <code>fX</code>
 */
Math.cot = function(fX) {
	return 1 / Math.tan(fX);
};


/**
 * Calculates and returns the hyperbolic cotangent of a number in 2D Cartesian
 * space.
 *
 * @summary             hyperbolic cotangent
 * @param fX            a floating-point number
 * @return              the hyperbolic cotangent of <code>fX</code>
 */
Math.coth = function(fX) {
	return (Math.exp(fX) + Math.exp(-fX)) / (Math.exp(fX) - Math.exp(-fX));
};


/**
 * Calculates and returns the coversine of a number in 2D Cartesian space.
 *
 * @summary             coversine
 * @param fX            a floating-point number
 * @return              the coversine of <code>fX</code>
 */
Math.cov = function(fX) {
	return 1 - Math.sin(fX);
};


/**
 * Calculates and returns the cosecant of a number in 2D Cartesian space.
 *
 * @summary             cosecant
 * @param fX            a floating-point number
 * @return              the cosecant of <code>fX</code>
 */
Math.csc = function(fX) {
	return 1 / Math.sin(fX);
};


/**
 * Calculates and returns the hyperbolic cosecant of a number in 2D Cartesian
 * space.
 *
 * @summary             hyperbolic cosecant
 * @param fX            a floating-point number
 * @return              the hyperbolic cosecant of <code>fX</code>
 */
Math.csch = function(fX) {
	return 2 / (Math.exp(fX) - Math.exp(-fX));
};

/**
 * Converts an angle in degrees into its equivalent in gradians.
 *
 * @summary             degree to gradian conversion
 * @interface           <code>Math.deg2grad(fDegrees)</code>
 * @param fDegrees      an angle in degrees
 * @return              the equivalent of <code>fDegrees</code> in gradians
 */
Math.deg2grad = function(fDegrees) {
	return (400 / 360) * fDegrees;
};


/**
 * Converts an angle in degrees into its equivalent in radians.
 *
 * @summary             degree to radian conversion
 * @param fDegrees      an angle in degrees
 * @return              the equivalent of <code>fDegrees</code> in radians
 */
Math.deg2rad = function(fDegrees) {
	return ((2 * Math.PI) / 360) * fDegrees;
};


/**
 * Calculates the exponent of 10. ie 10 to the power of <code>fX</code>
 *
 * @summary             exponent of 10
 * @param fX            a floating-point numbertype = format.charAt(Math.max(i-1, 0));
 * @return              10 raised to the power of <code>fX</code>
 */
Math.exp10 = function(fX) {
	return Math.pow(10, fX);
};


/**
 * Calculates and returns exp(x) - 1 for a number x.
 *
 * @summary             exp(x) - 1
 * @param fX            a floating-point number
 * @return              <code>Math.exp(fX) - 1</code> for <code>fX</code>
 */
Math.expm1 = function(fX) {
	return ((fX > -1.0e-6) && (fX < 1.0e-6)) ? fX + (Math.pow(fX, 2) / 2) : Math.exp(fX) - 1;
};


/**
 * Calculates and returns the exsecant of a number in 2D Cartesian space.
 *
 * @summary             exsecant
 * @param fX            a floating-point number
 * @return              the exsecant of <code>fX</code>
 */
Math.exsec = function(fX) {
	return (1 / Math.cos(fX)) - 1;
};


/**
 * Calculates and returns the xth term of the Fibonacci sequence.
 *
 * @summary             Fibonacci sequence
 * @param iX            an integer
 * @return              the Fibonacci number corresponding to the
 *                      <code>iX</code>th term of the Fibonacci sequence
 */
Math.fibonacci = function(iX) {
	var sqrt5 = Math.sqrt(5);
	return Math.round((Math.pow(1 + sqrt5, iX) - Math.pow(1 - sqrt5, iX)) / (Math.pow(2, iX) * sqrt5));
};


/**
 * Calculates and returns the floating-point remainder of one number divided
 * by another number.
 *
 * @summary             floating-point remainder
 * @param fDividend     a floating-point number
 * @param fDivisor      a floating-point number
 * @return              the floating-point remainder of <code>fDividend</code>
 *                      divided by <code>fDivisor</code>
 * @return              <code>NaN</code> if <code>fDivisor = 0</code>
 */
Math.fmod = function(fDividend, fDivisor) {
	return fDividend - (Math.floor(fDividend / fDivisor) * fDivisor);
};


/**
 * Calculates and returns the Gudermannian number of a number in 2D Cartesian
 * space using the Gudermannian function.
 *
 * @summary             Gudermannian function
 * @param fX            a floating-point number
 * @return              the Gudermannian number of <code>fX</code> in radians
 */
Math.gd = function(fX) {
	return (2 * Math.atan(Math.exp(fX))) - (Math.PI / 2);
};


/**
 * Converts an angle in gradians into its equivalent in degrees.
 *
 * @summary             gradian to degree conversion
 * @param fGradians     an angle in gradians
 * @return              the equivalent of <code>fGradians</code> in degrees
 */
Math.grad2deg = function(fGradians) {
	return (360 / 400) * fGradians;
};


/**
 * Converts an angle in gradians into its equivalent in radians.
 *
 * @summary             gradian to radian conversion
 * @param fGradians     an angle in gradians
 * @return              the equivalent of <code>fGradians</code> in radians
 */
Math.grad2rad = function(fGradians) {
	return ((2 * Math.PI) / 400) * fGradians;
};


/**
 * Calculates and returns the haversine of a number in 2D Cartesian space.
 *
 * @summary             haversine
 * @param fX            a floating-point number
 * @return              the haversine of <code>fX</code>
 */
Math.hav = function(fX) {
	return (1 - Math.cos(fX)) / 2;
};


/**
 * Calculates and returns the length of the hypotenuse of a right triangle
 * (side C) in 2D Cartesian space.
 *
 * @summary             hypotenuse
 * @param fLengthA      the length of side A of a right triangle
 * @param fLengthB      the length of side B of a right triangle
 * @return              the length of the hypotenuse of the right triangle
 *                      (side C)
 */
Math.hypot = function(fLengthA, fLengthB) {
	return Math.sqrt(Math.pow(fLengthA, 2) + Math.pow(fLengthB, 2));
};


/**
 * Determines if a number is even.
 *
 * @summary             is even?
 * @param fX            a floating-point number
 * @return              <code>true</code> if <code>fX</code> is even
 * @return              <code>false</code> if <code>fX</code> is odd
 */
Math.isEven = function(fX) {
	return (fX % 2) == 0;
};
Number.prototype.isEven = function() {
	return Math.isEven(this);
};


/**
 * Determines if a number is odd.
 *
 * @summary             is odd?
 * @param fX            a floating-point number
 * @return              <code>true</code> if <code>fX</code> is odd
 * @return              <code>false</code> if <code>fX</code> is even
 */
Math.isOdd = function(fX) {
	return (fX % 2) != 0;
};
Number.prototype.isOdd = function() {
	return Math.isOdd(this);
};

// Return true if x is positive
Math.isPositive = function(x) { return x > 0; };
Number.prototype.isPositive = function() {
	return Math.isPositive(this);
};

// Return true if x is negative
Math.isNegative = function(x) { return x < 0; };
Number.prototype.isNegative = function() {
	return Math.isNegative(this);
};

/**
 * Determines if a number is prime (a positive integer greater than 1 that has
 * no positive integer divisors other than 1 and itself).
 *
 * @summary             is prime?
 * @param iX            a positive integer greater than 1
 * @return              <code>true</code> if <code>iX</code> is prime
 * @return              <code>false</code> if <code>iX</code> is not prime
 */
Math.isPrime = function(n) {
	if (n <= 1) { return false; }
	else if (n < 4) { return true; } //2 and 3 are prime
	else if (n % 2 === 0) { return false; }
	else if (n < 9) { return true; }     //we have already excluded 4,6 and 8.
	else if (n % 3 === 0) { return false; }
	else {
		var r = Math.floor(Math.sqrt(n));
		var f = 5;
		while (f <= r) {
			if (((n % f) === 0) || ((n % (f+2)) === 0)) {
				return false;
			}
			f += 6;
		}
	}
	return true;
};



/**
 * Calculates and returns the base-10 logarithm of a number.
 *
 * @summary             base-10 logarithm
 * @param fX            a floating-point number greater than or equal to 0
 * @return              the base-10 logarithm of <code>fX</code>
 * @return              <code>NaN</code> if <code>fX < 0</code>
 */
Math.log10 = function(fX) {
	return Math.LOG10E * Math.log(fX);
};


/**
 * Calculates and returns the base-2 logarithm of a number.
 *
 * @summary             base-2 logarithm
 * @param fX            a floating-point number greater than or equal to 0
 * @return              the base-2 logarithm of <code>fX</code>
 * @return              <code>NaN</code> if <code>fX < 0</code>
 */
Math.log2 = function(fX) {
	return Math.LOG2E * Math.log(fX);
};


/**
 * Calculates and returns log(1 + x) for a number x.
 *
 * @summary             log(1 + x)
 * @param fX            a floating-point number greater than or equal to -1
 * @return              <code>Math.log(1 + fX)</code> for <code>fX</code>
 * @return              <code>NaN</code> if <code>fX < -1</code>
 */
Math.log1p = function(fX) {
	return ((fX > -1.0e-8) && (fX < 1.0e-8)) ? fX - (Math.pow(fX, 2) / 2) : Math.log(1 + fX);
};


/**
 * Determines if a number is valid according to the LUHN formula.
 *
 * @summary             LUHN formula
 * @param lX            a long integer greater than or equal to 10
 * @return              <code>true</code> if <code>lX</code> is valid
 * @return              <code>false</code> if <code>lX</code> is invalid
 */
Math.luhn = function(lX) {
	if (lX < 10) {
		return false;
	}

	var sX = lX.toString();
	var iModifiedXlength = sX.length - 1;
	var bDouble = false;
	var iSum = 0;

	for (var i = iModifiedXlength; i >= 0; i--) {
		var iTempNum = parseInt(sX.charAt(i));
		if (bDouble) {
			iTempNum *= 2;
			if (iTempNum > 9) {
				iTempNum -= 9;
			}
		}
		iSum += iTempNum;
		bDouble = !bDouble;
	}

	return (iSum % 10) == 0;
};


/**
 * Converts an angle in radians into its equivalent in degrees.
 *
 * @summary             radian to degree conversion
 * @param fRadians      an angle in radians
 * @return              the equivalent of <code>fRadians</code> in degrees
 */
Math.rad2deg = function(fRadians) {
	return (360 / (2 * Math.PI)) * fRadians;
};


/**
 * Converts an angle in radians into its equivalent in gradians.
 *
 * @summary             radian to gradian conversion
 * @param fRadians      an angle in radians
 * @return              the equivalent of <code>fRadians</code> in gradians
 */
Math.rad2grad = function(fRadians) {
	return (400 / (2 * Math.PI)) * fRadians;
};


/**
 * Calculates and returns the secant of a number in 2D Cartesian space.
 *
 * @summary             secant
 * @param fX            a floating-point number
 * @return              the secant of <code>fX</code>
 */
Math.sec = function(fX) {
	return 1 / Math.cos(fX);
};


/**
 * Calculates and returns the hyperbolic secant of a number in 2D Cartesian
 * space.
 *
 * @summary             hyperbolic secant
 * @param fX            a floating-point number
 * @return              the hyperbolic secant of <code>fX</code>
 */
Math.sech = function(fX) {
	return  2 / (Math.exp(fX) + Math.exp(-fX));
};


/**
 * Calculates and returns the sigmoid of a number in 2D Cartesian space using
 * the sigmoid function.
 *
 * @summary             sigmoid function
 * @param fX            a floating-point number
 * @return              the sigmoid of <code>fX</code>
 */
Math.sigmoid = function(fX) {
	return 1 / (1 + Math.exp(-fX));
};


/**
 * Calculates and returns the sign of a number.
 *
 * @summary             sign
 * @param fX            a floating-point number
 * @return              <code>0</code> if <code>fX == 0</code>
 * @return              <code>1</code> if <code>fX</code> is positive
 * @return              <code>-1</code> if <code>fX</code> is negative
 */
Math.sign = function(fX) {
	return (fX == 0) ? 0 : fX / Math.abs(fX);
};


/**
 * Calculates and returns the sign of a number.
 *
 * @summary             indicator
 * @param fX            a floating-point number
 * @return              <code>0</code> if <code>fX >= 0</code>
 * @return              <code>-1</code> if <code>fX</code> is negative
 * @return              <code>NaN</code> if <code>fX</code> is NaN
 */
Math.indicator = function(fX) {
	if (isNaN(fX)) {
		return NaN;
	}
	return (fX >= 0.0) ? 1.0 : -1.0;
};


/**
 * Calculates and returns the sinc of a number in 2D Cartesian space using the
 * sinc function.
 *
 * @summary             sinc function
 * @param fX            a floating-point number
 * @return              the sinc of <code>fX</code>
 */
Math.sinc = function(fX) {
	return (fX == 0) ? 1 : Math.sin(fX) / fX;
};


/**
 * Calculates and returns the hyperbolic sine of a number in 2D Cartesian
 * space.
 *
 * @summary             hyperbolic sine
 * @param fX            a floating-point number
 * @return              the hyperbolic sine of <code>fX</code>
 */
Math.sinh = function(fX) {
	return (Math.exp(fX) - Math.exp(-fX)) / 2;
};


/**
 * Calculates and returns the square of a number.
 *
 * @summary             square
 * @param fX            a floating-point number
 * @return              the square of <code>fX</code>
 */
Math.sq = function(fX) {
	return Math.pow(fX, 2);
};


/**
 * Calculates and returns the tanc of a number in 2D Cartesian space using the
 * tanc function.
 *
 * @summary             tanc function
 * @param fX            a floating-point number
 * @return              the tanc of <code>fX</code>
 */
Math.tanc = function(fX) {
	return (fX == 0) ? 1 : Math.tan(fX) / fX;
};


/**
 * Calculates and returns the hyperbolic tangent of a number in 2D Cartesian
 * space.
 *
 * @summary             hyperbolic tangent
 * @param fX            a floating-point number
 * @return              the hyperbolic tangent of <code>fX</code>
 */
Math.tanh = function(fX) {
	return (Math.exp(fX) - Math.exp(-fX)) / (Math.exp(fX) + Math.exp(-fX));
};


/**
 * Calculates and returns the versine of a number in 2D Cartesian space.
 *
 * @summary             versine
 * @param fX            a floating-point number
 * @return              the versine of <code>fX</code>
 */
Math.vers = function(fX) {
	return 1 - Math.cos(fX);
};



function point(px, py) {
	return { x:px, y:py };
}

function normalizeArguments(format, args) {
	var points = [];
	var ai = 0;

	for (var i=0; i<format.length; i++) {
		type = format.charAt(i);
		argi = args[ai];

		if (type == '*' && i == (format.length - 1)) {
			if (ai >= args.length) {
				// We already got all the arguments
				break;
			}
			--i;
			type = format.charAt(Math.max(i, 0));
		}

		switch (type) {
		/*
		case "a":
			i++;
			while (type == "a" && i < format.length) {
				type += format.charAt(i++));
			}
			type = type.substring(1);
			if (type !== "") {
				type += "*";
			}
			points.push(normalizeArguments(type, argi));

			break;
		*/
		case "p":
		case "2":
			// [x, y] or [x, (implied 0)]
			if (typeOf(argi) == "array") {
				if (argi.length >= 2) {
					points.push({ x: argi[0], y: argi[1] });
				}
				else if (argi.length == 1) {
					points.push({ x: argi[0], y: 0 });
				}
			}
			// {x, y}
			else if (typeOf(argi) == "object") {
				points.push(argi);
			}
			// ... x, y, ...
			else {
				if (ai + 1 < args.length) {
					points.push({ x: args[ai], y: args[ai + 1] });
					ai++;
				}
				else {
					points.push({ x: args[ai], y: 0 });
				}
			}
			break;
		case "x":
			// [x, y] or [x, (implied 0)]
			if (typeOf(argi) == "array") {
				points.push(argi[0]);
			}
			// {x, y}
			else if (typeOf(argi) == "object") {
				points.push(argi.x);
			}
			// ..., x, ...
			else {
				points.push(argi);
			}
			break;
		case "y":
			// [x, y] or [x, (implied 0)]
			if (typeOf(argi) == "array") {
				if (argi.length >= 2) {
					points.push(argi[1]);
				}
				else if (argi.length == 1) {
					points.push(0);
				}
			}
			// {x, y}
			else if (typeOf(argi) == "object") {
				points.push(argi.y);
			}
			// ..., y, ...
			else {
				points.push(argi);
			}
			break;
		case "b":
			points.push(!!args[ai]);
			break;
		case "n":
		default:
			points.push(args[ai]);
			break;
		}

		ai++;
	}

	while (ai < args.length) {
		points.push(args[ai++]);
	}

	return points;
}

// Get the {x, y} coordinates of the point on the circle that is closest to the specified point
// If allowInside is true, when the point can be anywhere inside the circle
// Point arguments can be passed as individual x and y parameters, [x,y] arrays, or {x, y} objects
function closestCirclePoint(/* point, center, radius, allowInside */) {
	var points = normalizeArguments("ppnb", arguments);
	var px = points[0].x;
	var py = points[0].y;
	var x = points[1].x;
	var y = points[1].y;
	var radius = points[2];
	var allowInside = points[3];

	function distsq(x, y, x0, y0) {
		x -= x0;
		y -= y0;
		return x*x + y*y;
	}

	if (!allowInside || distsq(px, py, x, y) > (radius * radius)) {
		angle = Math.atan2(py - y, px - x);
		return {
			x: Math.cos(angle) * radius + x,
			y: Math.sin(angle) * radius + y
		};
	}
	else {
		return {x: px, y: py};
	}
}


function lineVerticalIntercept(/* px, lpt, angle */) {
	var points = normalizeArguments("xpn", arguments);
	var px = points[0];
	var x = points[1].x;
	var y = points[1].y;
	var angle = points[2];

	if ((angle = Math.fmod(angle, 2 * Math.PI)) < 0) {
		angle += Math.PI;
	}
	var tg = Math.tan(-angle);
	return {x: px, y: (px - x) * tg + y};
}


function lineHorizontalIntercept(/* py, lpt, angle */) {
	var points = normalizeArguments("ypn", arguments);
	var py = points[0];
	var x = points[1].x;
	var y = points[1].y;
	var angle = points[2];

	if ((angle = Math.fmod(angle, 2 * Math.PI)) < 0) {
		angle += Math.PI;
	}
	var tg = Math.tan(-angle);
	return {x: (py - y) / tg + x, y: py};
}


// Returns the intersection point between a line and an imaginary line that passes in the point and is perpendicular to the same line.
// Arguments:
//		pt - the Point
//		lstart and lend - the Beginning and ending points of a line segment
function pointLineIntersection(pt, lstart, lend) {
	var points = normalizeArguments("ppp", arguments);
	var x = points[0].x;
	var y = points[0].y;
	var x0 = points[1].x;
	var y0 = points[1].y;
	var x1 = points[2].x;
	var y1 = points[2].x;

	if(!(x1 - x0)) {
		return {x: x0, y: y};
	}
	else if(!(y1 - y0)) {
		return {x: x, y: y0};
	}

	var left,
	tg = -1 / ((y1 - y0) / (x1 - x0));

	return {
		x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1),
		y: tg * left - tg * x + y
	};
}


// Calculate a bezier curve
function Bezier(/* p0, p1, c0, c1 */) {
	var o = this;
	var points = normalizeArguments("pppp", arguments);
	var p0 = points[0];
	var p1 = points[1];
	var c0 = points[2];
	var c1 = points[3];

	o.x0 = p0.x, o.y0 = p0.y, o.x1 = p1.x, o.y1 = p1.y, o.cx0 = c0.x, o.cy0 = c0.y, o.cx1 = c1.x, o.cy1 = c1.y;
}
with({$: Bezier, o: Bezier.prototype}) {
	// Returns the coordinates of a point given its "position" on the curve.
	// t is in [0, 1] and specifies the position of the point (example: 0 = beginning, 0.5 = middle, 1 = end)
	o.getCoordinates = function(t) {
		var i = 1 - t,
			x = t * t,
			y = i * i,
			a = x * t,
			b = 3 * x * i,
			c = 3 * t * y,
			d = y * i,
			o = this;
		return {
			x: a * o.x0 + b * o.cx0 + c * o.cx1 + d * o.x1,
			y: a * o.y0 + b * o.cy0 + c * o.cy1 + d * o.y1
		};
	};

	// Draws the curve.
	// c will be called for each point that needs to be drawn. It receives as its first argument the coordinates of the point, the second argument is the current position, which varies from 0 (0%) up to 1 (100%)
	o.plot = function(c) {
		var r,
		x = (x = this.x0 - this.x1) * x,
		y = (y = this.y0 - this.y1) * y,
		l = Math.max(40, Math.ceil(Math.sqrt(x + y))),
		i = l + 1;
		while (c(this.getCoordinates(r = --i / l), r), i) {
			// do nothing
		}
	};
}


function lineLength(p1, p2) {
	var points = normalizeArguments("pp", arguments);
	var dx = points[0].x - points[1].x;
	var dy = points[0].y - points[1].y;

	return Math.sqrt(dx*dx + dy*dy);
}

var distance = lineLength;

// Distance from a point to a line or segment.
// overLine specifies if the distance should respect the limits of the segment (overLine == true) or if it should consider the segment
// as an infinite line (overLine == false), if false returns the distance from the point to the line, otherwise the distance from the
// point to the segment
function pointLineDistance(p, lstart, lend, overLine) {
	var points = normalizeArguments("pppb", arguments);
	var x = points[0].x;
	var y = points[0].y;
	var x0 = points[1].x;
	var y0 = points[1].y;
	var x1 = points[2].x;
	var y1 = points[2].y;
	var o = points[3];
	if(o && !(o = function(x, y, x0, y0, x1, y1) {
		if(!(x1 - x0)) return {x: x0, y: y};
		else if(!(y1 - y0)) return {x: x, y: y0};
		var left, tg = -1 / ((y1 - y0) / (x1 - x0));
		return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
	}(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))) {
		var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
		return l1 > l2 ? l2 : l1;
	}
	else {
		var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
		return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
	}
}


function closestPolyLinePoint(/* px, py, x0, y0, x1, y1, etc */) {
	var lines = [];
	var args = normalizeArguments("p*", arguments);
	var px = args[0].x;
	var py = args[0].y;

	while (args.length > 2) {
		var p1 = args.pop();
		var p0 = args.pop();
		lines.push({
			y1: p1.y, x1: p1.x,
			y0: p0.y, x0: p0.x
		});
	}
	/*var args = [].slice.call(arguments, 0);

	while (args.length > 4) {
		lines.push({
			y1: args.pop(), x1: args.pop(),
			y0: args.pop(), x0: args.pop()
		});
	}*/

	if(!lines.length)
		return {x: px, y: py};

	var l,
		i = lines.length - 1,
		o = lines[i],
		lower = {i: i, l: pointLineDistance(px, py, o.x0, o.y0, o.x1, o.y1, 1)};
	while (i--) {
		if (lower.l > (l = pointLineDistance(px, py, (o = lines[i]).x0, o.y0, o.x1, o.y1, 1))) {
			lower = {i: i, l: l};
		}
	}

	if (py < Math.min((o = lines[lower.i]).y0, o.y1)) {
		py = Math.min(o.y0, o.y1);
	}
	else {
		if (py > Math.max(o.y0, o.y1)) {
			py = Math.max(o.y0, o.y1);
		}
	}
	if (px < Math.min(o.x0, o.x1)) {
		px = Math.min(o.x0, o.x1);
	}
	else {
		if (px > Math.max(o.x0, o.x1)) {
			px = Math.max(o.x0, o.x1);
		}
	}
	Math.abs(o.x0 - o.x1) < Math.abs(o.y0 - o.y1) ?
		px = (py * (o.x0 - o.x1) - o.x0 * o.y1 + o.y0 * o.x1) / (o.y0 - o.y1)
		: py = (px * (o.y0 - o.y1) - o.y0 * o.x1 + o.x0 * o.y1) / (o.x0 - o.x1);
	return {x: px, y: py};
}

function linePoint(lstart, lend, percent) {
	var args = normalizeArguments("ppn", arguments);
	lstart = args[0];
	lend = args[1];
	var lineWidth = lend.x - lstart.x;
	var lineHeight = lend.y - lstart.y;

	return point(
		lstart.x + percent * lineWidth,
		lstart.y + percent * lineHeight
	);
}


// Checks whether the point is inside the polygon.
// The polygon is represented as an array of points
function isPointInPoly(pt, poly) {
	var args = normalizeArguments("p", arguments);
	pt = args[0];
	poly = normalizeArguments("p*", args[1]);

	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		if (((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) &&
		    (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
			c = !c;
		}
	return c;
}


// greatest common divisor of the numbers in the array
Math.gcd = function(o) {
	if(!o.length)
		return 0;
	for(var r, a, i = o.length - 1, b = o[i]; i;) {
		for(a = o[--i]; r = a % b; a = b, b = r) {
			// do nothing
		}
	}
	return b;
};


// least common multiple of the numbers in the array
Math.lcm = function(o) {
	for(var i, j, n, d, r = 1; (n = o.pop()) != undefined;) {
		while(n > 1){
			if(n % 2){
				for (i = 3, j = Math.floor(Math.sqrt(n)); i <= j && n % i; i += 2) {
					// do nothing
				}
				d = i <= j ? i : n;
			}
			else {
				d = 2;
			}
			for(n /= d, r *= d, i = o.length; i; !(o[--i] % d) && (o[i] /= d) == 1 && o.splice(i, 1)) {
				// do nothing
			}
		}
	}
	return r;
};


// Expands a number in exponential form to decimal form.
// "-13.441*10^5".expandExponential() ===  "1344100"
// "1.12300e-1".expandExponential() === "0.112300";
// String(100000000000000000000000000000000000).expandExponential() === "100000000000000000000000000000000000";
String.prototype.expandExponential = function() {
	var s = this.replace(/\s*[*xX]\s*10\s*(\^|\*\*)\s*/, "e");

	return s.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function(x, s, n, f, c) {
		var l = +c < 0, i = n.length + +c;
		x = (l ? n : f).length;
		c = ((c = Math.abs(c)) >= x ? c - x + l : 0);
		var z = (new Array(c + 1)).join("0"), r = n + f;
		return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
	});
};

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


Math.fact = function(n) {
	var r;
	if (n==0 | n==1) { return 1; }
	if (n<0) { return Math.fact(n+1) / (n+1); }
	if (n>1) { return n*Math.fact(n-1); }
	if (n<0.5) {
		r = n;
	}
	else {
		r = 1 - n;
	}
	r = 1 / (1 + r*( 0.577215664819072 + r*(-0.655878067489187 + r*(-0.042002698827786 + r*(0.166538990722800 + r*(-0.042197630554869 + r*(-0.009634403818022 + r*(0.007285315490429 + r*(-0.001331461501875 ) ) ) ) ) ) ) ) );
	if ( n > 0.5 ) {
		r = n*(1-n)*Math.PI / (r*Sin(Math.PI*n));
	}
	return r;
};

Math.gamma = function(n) {
	return Math.fact(n-1);
};

Math.chiSq = function(x, n) {
    if (x > 1000 || n > 1000) {
		var q = Math.norm((Math.pow(x / n, 1 / 3) + 2 / (9*n) - 1) / Math.sqrt(2 / (9*n))) / 2;
		return (x > n) ? q : 1-q;
	}
    var p = Math.exp(-0.5 * x);
	if ((n % 2) == 1) {
		p = p * Math.sqrt(2*x / Math.PI);
	}
    var k = n;
	while (k >= 2) {
		p = p*x / k;
		k = k-2;
	}
    var t = p;
	var a = n;
	while (t > 1e-15 * p) {
		a = a + 2;
		t = t*x / a;
		p = p + t;
	}
    return 1 - p;
};

Math.norm = function(z) {
	var q = z*z;
    if (Math.abs(z) > 7) {
		return (1 - 1/q + 3/(q*q)) * Math.exp(-q / 2) / (Math.abs(z) * Math.sqrt(Math.PI/2));
	}
	else {
		return Math.chiSq(q, 1);
	}
};

Math.gauss = function(z) {
	return ( (z < 0) ? ( (z<-10) ? 0 : Math.chiSq(z*z, 1) / 2 ) : ( (z > 10) ? 1 : 1 - Math.chiSq(z*z, 1) / 2 ) );
};

Math.erf = function(z) {
	return ( (z < 0) ? (2 * Math.gauss(Math.SQRT2 * z) - 1) : (1 - 2 * Math.gauss(-Math.SQRT2 * z)) );
};

Math.studT = function(t,n) {
    t = Math.abs(t);
	var w = t / Math.sqrt(n);
	var th = Math.atan(w);
    if (n == 1) {
		return 1 - th / (Math.PI/2);
	}
    var sth = Math.sin(th);
	var cth = Math.cos(th);
    if((n % 2) == 1) {
		return 1 - (th + sth * cth * Math.statCom(cth*cth, 2, n-3, -1)) / (Math.PI/2);
	}
	else {
		return 1 - sth * Math.statCom(cth*cth, 1, n-3, -1);
	}
};

Math.fishF = function(f, n1, n2) {
	var x = n2 / (n1 * f + n2);

    if ((n1 % 2) == 0) {
		return Math.statCom(1-x, n2, n1 + n2 - 4, n2 - 2) * Math.pow(x, n2/2);
	}
    if((n2 % 2) == 0) {
		return 1 - Math.statCom(x, n1, n1 + n2 - 4, n1 - 2) * Math.pow(1-x, n1/2);
	}
    var th = Math.atan(Math.sqrt(n1 * f / n2));
	var a = th / (Math.PI/2);
	var sth = Math.sin(th);
	var cth = Math.cos(th);
    if (n2 > 1) {
		a = a + sth * cth * Math.statCom(cth*cth, 2, n2-3, -1) / (Math.PI/2);
	}
    if (n1 == 1) {
		return 1 - a;
	}
    var c = 4 * Math.statCom(sth*sth, n2+1, n1 + n2 - 4, n2-2) * sth * Math.pow(cth, n2) / Math.PI;
    if (n2 == 1) {
		return 1 - a + c/2;
	}
    var k=2;
	while (k <= (n2-1) / 2) {
		c = c * k / (k - .5);
		k = k + 1;
	}
    return 1 - a + c;
};

Math.statCom = function(q,i,j,b) {
    var zz = 1;
	var z = zz;
	var k = i;
	while (k <= j) {
		zz = zz * q * k / (k - b);
		z = z + zz;
		k = k + 2;
	}
    return z;
};

Math.anorm = function(p) {
	var v = 0.5;
	var dv = 0.5;
	var z = 0;
    while (dv > 1e-15) {
		z = 1/v - 1;
		dv = dv/2;
		if (Math.norm(z) > p) {
			v = v - dv;
		}
		else {
			v = v + dv;
		}
	}
    return z;
};

Math.agauss = function(p) {
	if (p > 0.5) {
		return Math.sqrt(Math.achiSq(2 * (1-p),1 ));
	}
	else {
		return -Math.sqrt(Math.achiSq(2 * p, 1));
	}
};

Math.aerf = function(p) {
	return Math.agauss(p/2 + 0.5) / Math.sqrt(2);
};

Math.achiSq = function(p,n) {
	var v = 0.5;
	var dv = 0.5;
	var x = 0;
    while (dv > 1e-15) {
		x = 1/v - 1;
		dv = dv / 2;
		if (Math.chiSq(x,n) > p) {
			v = v - dv;
		}
		else {
			v = v + dv;
		}
	}
    return x;
};

Math.astudT = function(p,n) {
	var v = 0.5;
	var dv = 0.5;
	var t = 0;
    while (dv > 1e-15) {
		t = 1/v - 1;
		dv = dv / 2;
		if (Math.studT(t, n) > p) {
			v = v - dv;
		}
		else {
			v = v + dv;
		}
	}
    return t;
};

Math.afishF = function(p, n1, n2) {
	var v = 0.5;
	var dv = 0.5;
	var f = 0;
    while (dv > 1e-15) {
		f = 1/v - 1;
		dv = dv / 2;
		if (Math.fishF(f, n1, n2) > p) {
			v = v - dv;
		}
		else {
			v = v + dv;
		}
	}
    return f;
};
