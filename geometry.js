JSLIB.require("functional");

var Geometry2D = {
	// hypot -- sqrt(p*p+q*q), but overflows only if the result does.
	// From plan9 libc
	hypot: function(p, q) {
		var r, s, pfac;

		if (p < 0)
			p = -p;
		if (q < 0)
			q = -q;
		if (p < q) {
			r = p;
			p = q;
			q = r;
		}
		if (p == 0)
			return 0;
		pfac = p;
		r = q = q/p;
		p = 1;
		for (;;) {
			r *= r;
			s = r+4;
			if (s == 4)
				return p*pfac;
			r /= s;
			p += 2*r*p;
			q *= r;
			r = q/p;
		}
	},

	area: function(contour) {
		var n = contour.length;
		var A = 0;

		for(var p = n-1, q = 0; q < n; p = q++) {
			A += contour[p].x*contour[q].y - contour[q].x*contour[p].y;
		}
		return A * 0.5;
	},

	insideTriangle: function(A, B, C, P) {
		var ax = C.x - B.x;  var ay = C.y - B.y;
		var bx = A.x - C.x;  var by = A.y - C.y;
		var cx = B.x - A.x;  var cy = B.y - A.y;
		var apx= P.x - A.x;  var apy= P.y - A.y;
		var bpx= P.x - B.x;  var bpy= P.y - B.y;
		var cpx= P.x - C.x;  var cpy= P.y - C.y;

		var aCROSSbp = ax*bpy - ay*bpx;
		var cCROSSap = cx*apy - cy*apx;
		var bCROSScp = bx*cpy - by*cpx;

		return ((aCROSSbp >= 0) && (bCROSScp >= 0) && (cCROSSap >= 0));
	},

	snip: function(contour, u, v, w, n, V, epsilon) {
		var A = contour[V[u]];
		var Ax = A.x;
		var Ay = A.y;

		var B = contour[V[v]];
		var Bx = B.x;
		var By = B.y;

		var C = contour[V[w]];
		var Cx = C.x
		var Cy = C.y;

		if ( epsilon > (((Bx-Ax)*(Cy-Ay)) - ((By-Ay)*(Cx-Ax))) ) return false;

		for (var p=0; p < n; p++) {
			if( (p == u) || (p == v) || (p == w) ) continue;
			var P = contour[V[p]];
			if (Geometry2D.insideTriangle(A, B, C, P)) return false;
		}

		return true;
	},

	process: function(contour, result, epsilon) {
		// allocate and initialize list of Vertices in polygon
		var n = contour.length;
		if (n < 3) { print("fewer than 3 points"); return false; }

		var V = new Array(n);

		// we want a counter-clockwise polygon in V
		if (0 < Geometry2D.area(contour)) {
			for (var v = 0; v < n; v++) V[v] = v;
		}
		else {
			for (var v = 0; v < n; v++) V[v] = (n-1) - v;
		}

		var nv = n;

		// remove nv-2 Vertices, creating 1 triangle every time
		var count = 2 * nv; // error detection

		for(var m = 0, v = nv-1; nv > 2; ) {
			// if we loop, it is probably a non-simple polygon
			if (0 >= (count--)) {
				// Triangulate: ERROR - probable bad polygon!
				print("process: probable bad polygon! (non-simple polygon)");
				return false;
			}

			// three consecutive vertices in current polygon, <u,v,w>
			var w;
			var u = v; if (nv <= u) u = 0; // previous
			v = u + 1; if (nv <= v) v = 0; // new v
			w = v + 1; if (nv <= w) w = 0; // next

			if (Geometry2D.snip(contour,u,v,w,nv,V, epsilon)) {
				var a,b,c,s,t;

				// true names of the vertices
				a = V[u]; b = V[v]; c = V[w];

				// output Triangle
				result.push(contour[a]);
				result.push(contour[b]);
				result.push(contour[c]);

				m++;

				// remove v from remaining polygon
				for (s=v, t=v+1; t < nv; s++, t++)
					V[s] = V[t];
				nv--;

				// resest error detection counter
				count = 2 * nv;
			}
		}

		return true;
	}
};


// AffineTransform - Transformation Matrix

function AffineTransform2D(m00, m10, m01, m11, m02, m12) {
	var args = null;
	if (arguments.length == 1) {
		args = arguments.slice();
		if (args.length == 2) {
			args = [args[0][0], args[1][0], args[0][1], args[1][1], args[0][2], args[1][2]];
		}
	}
	else {
		args = [m00, m10, m01, m11, m02, m12];
	}

	this.m00 = args[0] || 0;
	this.m10 = args[1] || 0;
	this.m01 = args[2] || 0;
	this.m11 = args[3] || 0;
	this.m02 = args[4] || 0;
	this.m12 = args[5] || 0;
}

extend(AffineTransform2D, {
	rotate: function(theta, x, y) {
		var cos = Math.cos(theta);
		var sin = Math.sin(theta);
		return new AffineTransform2D(cos, sin, -sin, cos, (x - x*cos + y*sin), (y - x*sin - y*cos));
	},

	translate: function(dx, dy) {
		return new AffineTransform2D(1, 0, 0, 1, dx, dy);
	},

	scale: function(sx, sy) {
		return new AffineTransform2D(sx, 0, 0, sy, 0, 0);
	}
});

AffineTransform2D.prototype = {
	get: function(i, j) {
		switch (i) {
		case 0:
			switch (j) {
			case 0: return this.m00;
			case 1: return this.m01;
			case 2: return this.m02;
			}
		case 1:
			switch (j) {
			case 0: return this.m10;
			case 1: return this.m11;
			case 2: return this.m12;
			}
		case 2:
			switch (j) {
			case 0: return 0;
			case 1: return 0;
			case 2: return 1;
			}
		}
		return undefined;
	},

	transform: function(x, y) {
		if (arguments.length == 1) {
			x = p.x;
			y = p.y;
		}
		return new Point2D(
			this.m00*x + this.m01*y + this.m02,
			this.m10*x + this.m11*y + this.m12);
	},

	transformArray: function(a) {
		return a.map(this.transform.bind(this));
	},

	// [ m00  m01  m02 ]   [ n00  n01  n02 ]
	// [ m10  m11  m12 ] x [ n10  n11  n12 ]
	// [  0    0    1  ]   [  0    0    1  ]
	multiply: function(at) {
		var m00 = this.m00;
		var m01 = this.m01;
		var m02 = this.m02;
		var m10 = this.m10;
		var m11 = this.m11;
		var m12 = this.m12;

		var n00 = at.m00;
		var n01 = at.m01;
		var n02 = at.m02;
		var n10 = at.m10;
		var n11 = at.m11;
		var n12 = at.m12;

		return new AffineTransform2D([
			[(m00 * n00 + m01 * n10), (m00 * n01 + m01 * n11), (m00 * n02 + m01 * n12 + m02)],
			[(m10 * n00 + m11 * n10), (m10 * n01 + m11 * n11), (m10 * n02 + m11 * n12 + m12)]
		]);
	},

	preMultiply: function(at) {
		at.multiply(this);
	}
}


// Point2D - Point

function Point2D(x, y) {
	this.x = x;
	this.y = y;
}

Point2D.prototype = {
	clone: function() {
		return new Point2D(this.x, this.y);
	},

	toString: function() {
		return "(" + this.x + ", " + this.y + ")";
	},

	translate: function(dx, dy) {
		return new Point2D(this.x + dx, this.y + dy);
	},

	add: function(p) {
		return this.translate(p.x, p.y);
	},

	rotate: function(theta, p) {
		p = p || {x:0, y:0};
		return AffineTransform2D.rotate(theta, p.x || 0, p.y || 0).transform(this.x, this.y);
	},

	scale: function(sx, sy) {
		if (arguments.length == 1) sy = sx;
		return new Point2D(this.x * sx, this.y * sy);
	},

	negate: function() {
		return this.scale(-1);
	},

	crossProduct: function(p) {
		return this.scale(p.x, p.y);
	},

	transform: function(at) {
		return at.transform(this.x, this.y);
	},

	slope: function() {
		return this.y / this.x;
	},

	angle: function() {
		return Math.atan2(this.y, this.x);
	},

	distance: function(p) {
		if (!p) p = { x:0, y:0 };
		return Geometry.hypot(this.x - p.x, this.y - p.y);
	},

	onLine: function(line, tol) {
		return line.contains(this, tol);
	},

	inLine: function(line, tol) {
		return line.containsIn(this, tol);
	},

	plot: function(ctx, style) {
		ctx.save();
			ctx.translate(0, ctx.height);
			ctx.scale(1, -1);
			ctx.fillStyle = style || "black";

			ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3);
		ctx.restore();
	},

	plotSmall: function(ctx, style) {
		ctx.save();
			ctx.translate(0, ctx.height);
			ctx.scale(1, -1);
			ctx.fillStyle = style || "black";

			ctx.fillRect(this.x - 0.5, this.y - 0.5, 1, 1);
		ctx.restore();
	}
};


// Line2D - Line Segment

function Line2D(p0, p1) {
	if (arguments.length == 4) {
		this.p0 = new Point2D(p0, p1);
		this.p1 = new Point2D(arguments[2], arguments[3]);
	}
	else {
		this.p0 = p0;
		this.p1 = p1;
	}
}

extend(Line2D, {
	pointSlope: function(pt, slope, length) {
		length = length || 1;
		if (!isFinite(slope)) {
			return new Line2D(pt, new Point2D(pt.x, pt.y + length));
		}
		return new Line2D(pt, new Point2D(pt.x + 1, pt.y + slope)).extendTo(length);
	},

	slopeIntercept: function(m, b, length) {
		length = length || 1;
		if (!isFinite(b)) {
			return new Line2D(
				new Point2D(0, 0),
				new Point2D(0, length)
			);
		}
		return new Line2D(
			new Point2D(0, b),
			new Point2D(1, m + b)
		).extendTo(length);
	},

	yAxis: function() {
		return new Line2D(new Point2D(0, -Infinity), new Point2D(0, Infinity));
	},

	xAxis: function() {
		return new Line2D(new Point2D(-Infinity, 0), new Point2D(Infinity, 0));
	},

	getSides: function(slope, length) {
		if (isFinite(slope)) {
			var c = length;
			var m2 = slope * slope;
			var dx = c / Math.sqrt(1 + m2);
			var dy = dx * slope;
			return [dx, dy];
		}
		else {
			return [0, length];
		}
	}
});

Line2D.prototype = {
	clone: function() {
		return new Line2D(this.p0, this.p1);
	},

	toString: function() {
		return this.p0 + " -> " + this.p1;
	},

	translate: function(d) {
		if (arguments.length == 1) {
			return new Line2D(this.p0.translate(d.x, d.y), this.p1.translate(d.x, d.y));
		}
		else {
			return this.translate(new Point2D(arguments[0], arguments[1]));
		}
	},

	rotate: function(theta, p) {
		return new Line2D(this.p0.rotate(theta, p), this.p1.rotate(theta, p));
	},

	scale: function(sx, sy) {
		return new Line2D(this.p0.scale(sx, sy), this.p1.scale(sx, sy));
	},

	transform: function(at) {
		return new Line2D(at.transform(this.p0), at.transform(this.p1));
	},

	dx: function() {
		return this.p1.x - this.p0.x;
	},

	dy: function() {
		return this.p1.y - this.p0.y;
	},

	boundingBox: function() {
		var p0x = this.p0.x;
		var p1x = this.p1.x;
		var p0y = this.p0.y;
		var p1y = this.p1.y;

		var maxX = Math.max(p0x, p1x);
		var maxY = Math.max(p0y, p1y);
		var minX = Math.min(p0x, p1x);
		var minY = Math.min(p0y, p1y);

		return new Polygon2D([
			new Point2D(minX, maxY), new Point2D(maxX, maxY),
			new Point2D(maxX, minY), new Point2D(minX, minY)
		], true);
	},

	slope: function() {
		return this.dy() / this.dx();
	},

	angle: function() {
		return Math.atan2(this.dy(), this.dx());
	},

	isParallelTo: function(l2, tol) {
		var m1 = this.slope();
		var m2 = l2.slope();
		if (!isFinite(m1) && !isFinite(m2)) {
			m1 = Math.abs(m1);
			m2 = Math.abs(m2);
		}

		if (tol) {
			return Math.abs(m1 - m2) < tol;
		}
		return m1 == m2;
	},

	isPerpendicularTo: function(l2, tol) {
		var m1 = this.slope();
		var m2 = -(1 / l2.slope());
		if (!isFinite(m1) && !isFinite(m2)) {
			m1 = Math.abs(m1);
			m2 = Math.abs(m2);
		}

		if (tol) {
			return Math.abs(m1 - m2) < tol;
		}
		return m1 == m2;
	},

	contains: function(p, tol) {
		var dy = p.y - this.getY(p.x);
		if (tol) {
			return Math.abs(dy) < tol;
		}
		return dy == 0;
	},

	containsIn: function(p, tol) {
		tol = tol || 0;
		var px = p.x;
		var py = p.y;
		var minx = Math.min(this.p0.x, this.p1.x);
		var miny = Math.min(this.p0.y, this.p1.y);
		var maxx = Math.max(this.p0.x, this.p1.x);
		var maxy = Math.max(this.p0.y, this.p1.y);

		if (px < (minx - tol)) { return false; }
		if (py < (miny - tol)) { return false; }
		if (px > (maxx + tol)) { return false; }
		if (py > (maxy + tol)) { return false; }

		return this.contains(p, tol);
	},

	intercept: function() {
		// y-intercept = (0, y0)
		// y - y0 = m(x - x0) => y0 = y - mx
		return this.p0.y - (this.slope() * this.p0.x);
	},

	equation: function() {
		if (this.p0.x == this.p1.x) {
			return "x = " + this.p0.x;
		}
		else if (this.p0.y == this.p1.y) {
			return "y = " + this.p0.y;
		}

		var m = this.slope();
		var b = this.intercept();

		function add(x) {
			if (x) {
				return ((x < 0) ? " - " : " + ") + Math.abs(x);
			}
			else return "";
		}

		return "y = " + ((m != 1) ? m : "") + "x" + add(b);
	},

	getFunction: function() {
		var m = this.slope();
		var b = this.intercept();
		return function(x) { return m * x + b; };
	},

	getY: function(x) {
		return this.slope() * x + this.intercept();
	},

	length: function() {
		return Geometry2D.hypot(this.dy(), this.dx());
	},

	extend: function(dlength) {
		let [dx, dy] = Line2D.getSides(this.slope(), dlength);
		return new Line2D(this.p0, new Point2D(this.p1.x + dx, this.p1.y + dy));
	},

	prepend: function(dlength) {
		let [dx, dy] = Line2D.getSides(this.slope(), dlength);
		return new Line2D(new Point2D(this.p0.x - dx, this.p0.y - dy), this.p1);
	},

	extendTo: function(length) {
		let [dx, dy] = Line2D.getSides(this.slope(), length);
		return new Line2D(this.p0, new Point2D(this.p0.x + dx, this.p0.y + dy));
	},

	prependTo: function(length) {
		let [dx, dy] = Line2D.getSides(this.slope(), length);
		return new Line2D(new Point2D(this.p1.x - dx, this.p1.y - dy), this.p1);
	},

	intersection: function(line2) {
		var m1 = this.slope();
		var m2 = line2.slope();

		if (!isFinite(m1)) {
			return new Point2D(this.p0.x, line2.getY(this.p0.x));
		}
		if (!isFinite(m2)) {
			return new Point2D(line2.p0.x, this.getY(line2.p0.x));
		}

		var b1 = this.intercept();
		var b2 = line2.intercept();

		var x = (b2 - b1) / (m1 - m2);
		var y = m1 * x + b1;

		return new Point2D(x, y);
	},

	intersectsSegment: function(line2, tol) {
		var i = this.intersection(line2);
		if (isFinite(i.x) && isFinite(i.y)) {
			return this.containsIn(i, tol) && line2.containsIn(i, tol);
		}
		else {
			// Slopes were the same, but they could be colinear
			return this.containsIn(line2.p0, tol) ||
			       this.containsIn(line2.p1, tol) ||
			       line2.containsIn(this.p0, tol) ||
			       line2.containsIn(this.p1, tol);
		}
	},

	inverse: function() {
		var p0 = new Point2D(this.p0.y, this.p0.x);
		var p1 = new Point2D(this.p1.y, this.p1.x);
		return new Line2D(p0, p1);
	},

	midPoint: function() {
		return new Point2D(0.5*this.p0.x + 0.5*this.p1.x, 0.5*this.p0.y + 0.5*this.p1.y);
	},

	plot: function(ctx, style) {
		ctx.save();
			ctx.translate(0, ctx.height);
			ctx.scale(1, -1);
			ctx.strokeStyle = style || "black";

			ctx.beginPath();
				ctx.moveTo(this.p0.x, this.p0.y);
				ctx.lineTo(this.p1.x, this.p1.y);
			ctx.stroke();
		ctx.restore();
	}
};

function LineIntersection(line0, line1) {
	this.line0 = line0;
	this.line1 = line1;
}

LineIntersection.prototype = new Point2D();

LineIntersection.prototype.getPoint = function() {
	return this.line0.intersection(this.line1);
};
LineIntersection.prototype.__defineGetter__("x", function() {
	return this.getPoint().x;
});
LineIntersection.prototype.__defineGetter__("y", function() {
	return this.getPoint().y;
});


// Polygon2D - Polygon

function Polygon2D(pts, noCopy) {
	if (pts.length < 3) {
		throw new Error("Polygon2D requires at least 3 points");
	}

	this.points = noCopy ? pts : pts.slice(0);
}

Polygon2D.prototype = {
	clone: function() {
		return new Polygon2D(this.points);
	},

	toString: function() {
		return "Polygon2D(" + this.points + ")";
	},

	size: function() {
		return this.points.length;
	},

	translate: function(dx, dy) {
		var at = AffineTransform2D.translate(dx, dy);
		return new Polygon2D(at.transformAll(this.points), true);
	},

	rotate: function(theta, p) {
		p = p || {x:0, y:0};
		var at = AffineTransform2D.rotate(theta, p.x || 0, p.y || 0);
		return new Polygon2D(at.transformAll(this.points), true);
	},

	scale: function(sx, sy) {
		if (arguments.length == 1) sy = sx;
		var at = AffineTransform2D.scale(sx, sy);
		return new Polygon2D(at.transformAll(this.points), true);
	},

	negate: function() {
		return this.scale(-1);
	},

	transform: function(at) {
		return new Polygon2D(at.transformAll(this.points));
	},

	push: function(p) {
		this.points.push(p);
	},

	pop: function() {
		if (this.points.length < 4) return undefined;
		return this.points.pop();
	},

	shift: function() {
		if (this.points.length < 4) return undefined;
		return this.points.shift();
	},

	unshift: function(p) {
		return this.points.unshift(p);
	},

	sides: function() {
		var sides = new Array(this.points.length);
		var last = this.points[0];
		var points = this.points;
		for (var i = 0; i < points.length - 1; i++) {
			var current = points[i + 1];
			sides[i] = new Line2D(last, current);
			last = current;
		}
		sides[points.length - 1] = new Line2D(last, points[0]);

		return sides;
	},

	evaluateCrossings: function(x, y, epsilon) {
		var x1;
		var y1;
		var crossings = 0;
		var points = this.points;
		var npoints = points.length;

		var x0 = points[0].x - x;
		var y0 = points[0].y - y;
		for (var i = 1; i < npoints; i++) {
			x1 = points[i].x - x;
			y1 = points[i].y - y;

			if (y0 == 0.0)
				y0 -= epsilon;
			if (y1 == 0.0)
				y1 -= epsilon;
			if (y0 * y1 < 0) {
				if (new Line2D(x0, y0, x1, y1).intersectsSegment(new Line2D(epsilon, 0.0, Infinity, 0.0), epsilon)) {
				//if (Line2D.linesIntersect(x0, y0, x1, y1, epsilon, 0.0, Infinity, 0.0)) {
					++crossings;
				}
			}

			x0 = points[i].x - x;
			y0 = points[i].y - y;
		}

		// end segment
		x1 = points[0].x - x;
		y1 = points[0].y - y;
		if (y0 == 0.0)
			y0 -= epsilon;
		if (y1 == 0.0)
			y1 -= epsilon;
		if (y0 * y1 < 0) {
			if (new Line2D(x0, y0, x1, y1).intersectsSegment(new Line2D(epsilon, 0.0, Infinity, 0.0), epsilon)) {
			// if (Line2D.linesIntersect(x0, y0, x1, y1, epsilon, 0.0, distance, 0.0)) {
				++crossings;
			}
		}

		return crossings;
	},

	contains: function(p, tol) {
		return (this.evaluateCrossings(p.x, p.y, tol) % 2) != 0;
	},

	plot: function(ctx, style, fill) {
		var points = this.points;
		ctx.save();
			ctx.translate(0, ctx.height);
			ctx.scale(1, -1);
			if (fill) {
				ctx.fillStyle = style || "black"
			}
			else {
				ctx.strokeStyle = style || "black";
			}

			ctx.beginPath();
				ctx.moveTo(points[0].x, points[0].y);
				for (var i = 1; i < points.length; i++) {
					ctx.lineTo(points[i].x, points[i].y);
				}
				ctx.closePath();
			if (fill) {
				ctx.fill();
			}
			else {
				ctx.stroke();
			}
		ctx.restore();

		for (var i = 0; i < points.length; i++) {
			points[i].plot(ctx, style);
		}
	},

	boundingBox: function() {
		var points = this.points;
		var xp = points.map(function(p) { return p.x; });
		var yp = points.map(function(p) { return p.y; });
		var maxX = xp.max();
		var maxY = yp.max();
		var minX = xp.min();
		var minY = yp.min();

		return new Polygon2D([
			new Point2D(minX, maxY), new Point2D(maxX, maxY),
			new Point2D(maxX, minY), new Point2D(minX, minY)
		], true);
	},

	randomFill: function(ctx, style, sparcity, xSparcity) {
		sparcity = Math.abs(sparcity || 1);
		xSparcity = Math.abs(xSparcity || 1);
		ctx.save();
			style = style || "black"

			var points = this.points;
			var xp = points.map(function(p) { return p.x; });
			var yp = points.map(function(p) { return p.y; });
			var maxX = xp.max() + 10;
			var maxY = yp.max() + 10;
			var minX = xp.min() - 10;
			var minY = yp.min() - 10;

			new Polygon2D([
				new Point2D(minX, maxY), new Point2D(maxX, maxY),
				new Point2D(maxX, minY), new Point2D(minX, minY)
			], true).plot(ctx, style, false);

			for (var x = minX; x <= maxX; x += Math.random() * xSparcity) {
				for (var y = minY; y <= maxY; y += Math.random() * sparcity) {
					var p = new Point2D(x, y);
					if (this.contains(p, 0.1e-4)) {
						p.plotSmall(ctx, style);
					}
				}
			}

		ctx.restore();
	},

	calculateArea: function() {
		return Geometry2D.area(this.points);
	},

	estimateArea: function() {
		var points = this.points;
		var xp = points.map(function(p) { return p.x; });
		var yp = points.map(function(p) { return p.y; });
		var maxX = xp.max() + 1;
		var maxY = yp.max() + 1;
		var minX = xp.min() - 1;
		var minY = yp.min() - 1;
		var area = 0;

		for (var x = minX; x <= maxX; x++) {
			for (var y = minY; y <= maxY; y++) {
				var p = new Point2D(x, y);
				if (this.contains(p, 0.5)) {
					area++;
					if (Math.random() < 0.25) p.plotSmall(w.image.context, "gray");
				}
			}
		}

		return area;
	}
};

