/*
  The functions toRoman and isRoman accept a second
  argument which should be 'A' for roman numerals with 
  ordinary ASCII characters and 'U' for roman numerals as
  Unicode strings. 'A' is the default.


  to_roman(n, type):
  Converts numbers to roman numerals. The
  argument should be an integer in [0, 3999] for ASCII and [0, 39999] for
  Unicode. Otherwise, an error is thrown.

  toRoman(n) == to_roman(n, 'A');
  toRoman(n, 'U');

  toRoman(42) == "XLIII"
  toRoman(0) == ""
  toRoman(-1)        // throws an error
  toRoman(4000, 'A') // throws an error
  toRoman(4000, 'U') == "\u2180\u2181"


  isRoman(r):
  Answers if the string argument is a roman numeral.

  isRoman("X") == true
  isRoman("LL") == false
*/
(function() {
	var _variants = {
		A: { // ascii variant (0-3999) IVXLCDM
			romans: [
				'M', 1000,
				'CM', 900, 'D', 500,
				'CD', 400, 'C', 100,
				'XC', 90,  'L', 50,
				'XL', 40,  'X', 10,
				'IX', 9,   'V', 5,
				'IV', 4,   'I', 1],
			range: [0, 3999],
			regex: /^(M?M?M?)(CM|CD|D?C?C?C?)?(XC|XL|L?X?X?X?)?(IX|IV|V?I?I?I?)?$/i
		},
		U: { // unicode variant (0-39999)
			romans: [
			'\u2182', 10000,
			'\u2180\u2182', 9000, '\u2181', 5000,
			'\u2180\u2181', 4000, '\u2180', 1000, 
			'\u216D\u2180', 900,  '\u216E', 500,
			'\u216D\u216E', 400,  '\u216D', 100,
			'\u2169\u216D', 90,   '\u216C', 50,
			'\u2169\u216C', 40,   '\u2169', 10,
			'\u2160\u2169', 9,    '\u2164', 5,
			'\u2160\u2164', 4,    '\u2160', 1],
			range: [0, 39999],
			//regex: /^(\u2182?\u2182?\u2182?)(\u2180\u2182|\u2180\u2181|\u2181?\u2180?\u2180?\u2180?)(\u216D\u2180|\u216D\u216E|\u216E?\u216D?\u216D?\u216D?)?(\u2169\u216D|\u2169\u216\u216D|\u216\u216D?\u2169?\u2169?\u2169?)?(\u2160\u2169|\u2160\u2164|\u2164?\u2160?\u2160?\u2160?)?$/i
			regex: /^(\u2182?\u2182?\u2182?)(\u2180\u2182|\u2180\u2181|\u2181?\u2180?\u2180?\u2180?)?(\u216D\u2180|\u216D\u216E|\u216E?\u216D?\u216D?\u216D?)?(\u2169\u216D|\u2169\u216C|\u216C?\u2169?\u2169?\u2169?)?(\u2160\u2169|\u2160\u2164|\u2164?\u2160?\u2160?\u2160?)?$/i
		}
	};

	Number.toRoman = function(n, v) {
		if (!v) v = 'A';
		var r_var = _variants[v];
		if (n != Math.round(n)) {
			throw new Error('argument n='+n+' should be an integer');
		}
		if (n < r_var.range[0] || n > r_var.range[1]) {
			throw new Error('argument n='+n+' should be in the range ('+r_var.range[0]+', '+r_var.range[1]+')');
		}
		return _to_roman(n, r_var);
	};

	Number.prototype.toRoman = function(v) {
		return Number.toRoman(this, v);
	};

	// this does not check the arguments
	function _to_roman(n, r_var) {
		var _romans = r_var.romans;
		var r = '';
		var i = 0;
		while (n > 0) {
			if (n >= _romans[i + 1]) {
				r += _romans[i];
				n -= _romans[i + 1];
			} else {
				i += 2;
			}
		}
		return r;
	}

	String.isRoman = function(r, v) {
		if (!v) v = 'A';
		var r_var = _variants[v];
		return r_var.regex.test(r);
	};

	String.prototype.isRoman = function(v) {
		return String.isRoman(this, v);
	};

	function _from_roman_a(res) {
		var n = 0;

		if (res[1]) switch (res[1]) {
		case "M":   n += 1000; break;
		case "MM":  n += 2000; break;
		case "MMM": n += 3000; break;
		case "":               break;
		default: throw new Error("Unexpected res[1]: '" + res[1] + "'");
		}

		if (res[2]) switch (res[2]) {
		case "C":    n += 100; break;
		case "CC":   n += 200; break;
		case "CCC":  n += 300; break;
		case "CD":   n += 400; break;
		case "D":    n += 500; break;
		case "DC":   n += 600; break;
		case "DCC":  n += 700; break;
		case "DCCC": n += 800; break;
		case "CM":   n += 900; break;
		case "":               break;
		default: throw new Error("Unexpeced res[2]: '" + res[2] + "'");
		}

		if (res[3]) switch (res[3]) {
		case "X":    n += 10; break;
		case "XX":   n += 20; break;
		case "XXX":  n += 30; break;
		case "XL":   n += 40; break;
		case "L":    n += 50; break;
		case "LX":   n += 60; break;
		case "LXX":  n += 70; break;
		case "LXXX": n += 80; break;
		case "XC":   n += 90; break;
		case "":              break;
		default: throw new Error("Unexpeced res[3]: '" + res[3] + "'");
		}

		if (res[4]) switch (res[4]) {
		case "I":    n += 1; break;
		case "II":   n += 2; break;
		case "III":  n += 3; break;
		case "IV":   n += 4; break;
		case "V":    n += 5; break;
		case "VI":   n += 6; break;
		case "VII":  n += 7; break;
		case "VIII": n += 8; break;
		case "IX":   n += 9; break;
		case "":             break;
		default: throw new Error("Unexpeced res[4]: '" + res[4] + "'");
		}

		return n;
	}

	function _from_roman_u(res) {
		var n = 0;

		if (res[1]) switch (res[1]) {
		case "\u2182":             n += 10000; break;
		case "\u2182\u2182":       n += 20000; break;
		case "\u2182\u2182\u2182": n += 30000; break;
		case "":                               break;
		default: throw new Error("Unexpected res[1]: '" + res[1] + "'");
		}

		if (res[2]) switch (res[2]) {
		case "\u2180":                   n += 1000; break;
		case "\u2180\u2180":             n += 2000; break;
		case "\u2180\u2180\u2180":       n += 3000; break;
		case "\u2180\u2181":             n += 4000; break;
		case "\u2181":                   n += 5000; break;
		case "\u2181\u2180":             n += 6000; break;
		case "\u2181\u2180\u2180":       n += 7000; break;
		case "\u2181\u2180\u2180\u2180": n += 8000; break;
		case "\u2180\u2182":             n += 9000; break;
		case "":                                    break;
		default: throw new Error("Unexpeced res[2]: '" + res[2] + "'");
		}

		if (res[3]) switch (res[3]) {
		case "\u216D":                   n += 100; break;
		case "\u216D\u216D":             n += 200; break;
		case "\u216D\u216D\u216D":       n += 300; break;
		case "\u216D\u216E":             n += 400; break;
		case "\u216E":                   n += 500; break;
		case "\u216E\u216D":             n += 600; break;
		case "\u216E\u216D\u216D":       n += 700; break;
		case "\u216E\u216D\u216D\u216D": n += 800; break;
		case "\u216D\u2180":             n += 900; break;
		case "":                                   break;
		default: throw new Error("Unexpeced res[3]: '" + res[3] + "'");
		}

		if (res[4]) switch (res[4]) {
		case "\u2169":                   n += 10; break;
		case "\u2169\u2169":             n += 20; break;
		case "\u2169\u2169\u2169":       n += 30; break;
		case "\u2169\u216C":             n += 40; break;
		case "\u216C":                   n += 50; break;
		case "\u216C\u2169":             n += 60; break;
		case "\u216C\u2169\u2169":       n += 70; break;
		case "\u216C\u2169\u2169\u2169": n += 80; break;
		case "\u2169\u216D":             n += 90; break;
		case "":                                  break;
		default: throw new Error("Unexpeced res[4]: '" + res[4] + "'");
		}

		if (res[5]) switch (res[5]) {
		case "\u2160":                   n += 1; break;
		case "\u2160\u2160":             n += 2; break;
		case "\u2160\u2160\u2160":       n += 3; break;
		case "\u2160\u2164":             n += 4; break;
		case "\u2164":                   n += 5; break;
		case "\u2164\u2160":             n += 6; break;
		case "\u2164\u2160\u2160":       n += 7; break;
		case "\u2164\u2160\u2160\u2160": n += 8; break;
		case "\u2160\u2169":             n += 9; break;
		case "":                                 break;
		default: throw new Error("Unexpeced res[5]: '" + res[5] + "'");
		}

		return n;
	}

	Number.fromRoman = function(r, v) {
		if (!v) v = 'A';
		var r_var = _variants[v];

		if (r === "") {
			return 0;
		}

		if (!String.isRoman(r, v)) {
			return NaN;
		}

		var res = r_var.regex.exec(r.toUpperCase());

		if (v == 'A') {
			return _from_roman_a(res);
		}
		else if (v == 'U') {
			return _from_roman_u(res);
		}
		else {
			throw new Error("Unexpected Error in fromRoman");
		}
	};

	function testRoman() {
		function doTest(limit, type) {
			print("Testing toRoman(i, '" + type + "')");
			for (var i = 0; i < limit; i++) {
				try {
					var r = Number.toRoman(i, type);
					var n = Number.fromRoman(r, type);
				}
				catch (e) {
					print("Number.toRoman(" + i + ", '" + type + "') == '" + r + "'");
					print("Number.fromRoman('" + r + "', '" + type + "') == " + n);
					throw e;
				}
				if (n !== i || Math.random() < 0.001) {
					print("Number.toRoman(" + i + ", '" + type + "') == '" + r + "'");
					print("Number.fromRoman('" + r + "', '" + type + "') == " + n);
					if (n !== i) {
						throw new Error("Number.fromRoman(Number.toRoman(" + i + ", '" + type + "'), '" + type + "') == " + n + " (expected " + i + ")");
					}
				}
			}
			print("Done.");
		}

		doTest( 3999, 'A');
		doTest(39999, 'U');
	}
})();

