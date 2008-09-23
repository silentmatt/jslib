JSLIB.require("string");

function Color(r, g, b, a) {
	if (!(this instanceof Color)) {
		return new Color(r, g, b, a);
	}

	this.r = Color.clip(r || 0);
	this.g = Color.clip(g || 0);
	this.b = Color.clip(b || 0);
	this.a = Color.clip(a === undefined ? 255 : a);
}

Color.clip = function(n) {
	return Math.min(Math.max(0, Math.round(n)), 255);
};

Color.mod = function(x, n) {
	return ((x % n) + n) % n;
};

Color.prototype.toString = function() {
	var a = this.a;
	this.a = this.a / 255;
	var s = "rgba(%(r)d, %(g)d, %(b)d, %(a)d)".format(this);
	this.a = a;
	return s;
};

Color.prototype.getRGB = function() {
	return [this.r, this.g, this.b, this.a];
};

Color.rgbToHue = function(r, g, b) {
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);

	if (max == min) {
		return 0;
	}
	if (r == max) {
		return Color.mod(60 * (g - b) / (max - min), 360);
	}
	if (g == max) {
		return 60 * ((b - r) / (max - min)) + 120;
	}
	if (b == max) {
		return 60 * ((r - g) / (max - min)) + 240;
	}
	throw new Error("Unexpected error in Color.rgbToHue");
};

Color.prototype.getHSL = function() {
	var max = Math.max(this.r, this.g, this.b);
	var min = Math.min(this.r, this.g, this.b);

	var h = Color.rgbToHue(this.r / 255, this.g / 255, this.b / 255);
	var l = ((max + min) / 255) / 2;
	var s;
	if (max == min) {
		s = 0;
	}
	else if (l <= 0.5) {
		s = ((max - min) / 255) / (    2*l);
	}
	else if (l > 0.5) {
		s = ((max - min) / 255) / (2 - 2*l);
	}

	return [h, s, l, this.a / 255];
};

Color.prototype.getHSB = Color.prototype.getHSL;

Color.prototype.getHSV = function() {
	var max = Math.max(this.r, this.g, this.b);
	var min = Math.min(this.r, this.g, this.b);

	var h = Color.rgbToHue(this.r / 255, this.g / 255, this.b / 255);
	if (max == 0) {
		s = 0;
	}
	else {
		s = 1 - (min / max);
	}

	return [h, s, max / 255, this.a / 255];
};

function rgba(r, g, b, a) {
	return new Color(r, g, b, a);
}

function rgb(r, g, b, a) {
	if (a === undefined) a = 255;
	return new Color(r, g, b, a);
}

function rgbf(r, g, b, a) {
	if (a === undefined) a = 1;
	return new Color(r * 255, g * 255, b * 255, a * 255);
}

function rgbaf(r, g, b, a) {
	return new Color(r * 255, g * 255, b * 255, a * 255);
}

function hsla(h, s, l, a) {
	function normalizeAngle(x) {
		return Color.mod(x, 360);
	}

	function hueToRGB(m1, m2, h) {
		if (h < 0) h = h + 1;
		if (h > 1) h = h - 1;
		if (h * 6 < 1) return m1 + (m2-m1) * h * 6.0;
		if (h * 2 < 1) return m2;
		if (h * 3 < 2) return m1 + (m2-m1) * ((2.0/3.0) - h) * 6.0;
		return m1;
	}

	h = normalizeAngle(h) / 360;

	var m2 = 0;
	if (l <= 0.5)
		m2 = l * (s+1);
	else
		m2 = l + s - l*s;
	var m1 = l*2 - m2;
	var r = hueToRGB(m1, m2, h+1.0/3.0);
	var g = hueToRGB(m1, m2, h);
	var b = hueToRGB(m1, m2, h-1.0/3.0);
	return new Color(r * 255, g * 255, b * 255, a * 255);
}

function hsl(h, s, l, a) {
	if (a === undefined) a = 1;
	return hsla(h, s, l, a);
}

var hsba = hsla;
var hsb = hsl;

function hsva(h, s, v, a) {
	var h_60 = h / 60;
	var hi = Color.mod(Math.floor(h_60), 6);
	var f = h_60 - Math.floor(h_60);
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);

	switch (hi) {
	case 0:
		return rgba(v, t, p, a);
	case 1:
		return rgba(q, v, p, a);
	case 2:
		return rgba(p, v, t, a);
	case 3:
		return rgba(p, q, v, a);
	case 4:
		return rgba(t, p, v, a);
	case 5:
		return rgba(v, p, q, a);
	default:
		throw new Error("Invalid h in hsva: '" + h + "'");
	}
}

function hsv(h, s, v, a) {
	if (a === undefined) a = 1;
	return hsva(h, s, v, a);
}

function gray(v, a) {
	if (a === undefined) a = 255;
	return new Color(v, v, v, a);
}

function grayf(v, a) {
	if (a === undefined) a = 1;
	return new Color(v * 255, v * 255, v * 255, a * 255);
}

