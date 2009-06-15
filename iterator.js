// Based on MochiKit.Logging

extend(Iterator, {
	baseIterator: {
		__iterator__: function() { return this; },
		next: function() { throw StopIteration; }
	},

    count: function (n) {
        if (!n) {
            n = 0;
        }
        return extend(object(Iterator.baseIterator), {
            toString: function () { return "count(" + n + ")"; },
            next: counter(n)
        });
    },

	arrayIterator: function(a, start, skip) {
		start = start || 0;
		skip = skip || 1;
		for (var i = start; i < a.length; i += skip) {
			yield a[i];
		}
	},

    cycle: function (p) {
        var lst = [];
        var iterator = Iterator(p);
        return extend(object(Iterator.baseIterator), {
            toString: function () { return "cycle(...)"; },
            next: function () {
                try {
                    var rval = iterator.next();
                    lst.push(rval);
                    return rval;
                } catch (e) {
                    if (e != StopIteration) {
                        throw e;
                    }
                    if (lst.length === 0) {
                        this.next = function () {
                            throw StopIteration;
                        };
                    } else {
                        var i = -1;
                        this.next = function () {
                            i = (i + 1) % lst.length;
                            return lst[i];
                        };
                    }
                    return this.next();
                }
            }
        });
    },

    repeat: function (elem, /* optional */n) {
        if (typeof(n) == 'undefined') {
            return extend(object(Iterator.baseIterator), {
                toString: function () {
                    return "repeat(" + elem + ")";
                },
                next: function () {
                    return elem;
                }
            });
        }
        return extend(object(Iterator.baseIterator), {
            toString: function () {
                return "repeat(" + elem + ", " + n + ")";
            },
            next: function () {
                if (n <= 0) {
                    throw StopIteration;
                }
                n -= 1;
                return elem;
            }
        });
    },

    next: function (iterator) {
        return iterator.next();
    },

    filter: function (pred, seq) {
        seq = Iterator(seq);
        if (pred === null) {
            pred = operator.truth;
        }
        return extend(object(Iterator.baseIterator), {
            toString: function () { return "filter(...)"; },
            next: function () {
                while (true) {
                    var rval = seq.next();
                    if (pred(rval)) {
                        return rval;
                    }
                }
                // mozilla warnings aren't too bright
                return undefined;
            }
        });
    },

    slice: function (seq/*, [start,] stop[, step] */) {
        seq = Iterator(seq);
        var start = 0;
        var stop = 0;
        var step = 1;
        var i = -1;
        if (arguments.length == 2) {
            stop = arguments[1];
        } else if (arguments.length == 3) {
            start = arguments[1];
            stop = arguments[2];
        } else {
            start = arguments[1];
            stop = arguments[2];
            step = arguments[3];
        }
        return extend(object(Iterator.baseIterator), {
            toString: function () {
                return "islice(" + ["...", start, stop, step].join(", ") + ")";
            },
            next: function () {
                var rval;
                while (i < start) {
                    rval = seq.next();
                    i++;
                }
                if (start >= stop) {
                    throw StopIteration;
                }
                start += step;
                return rval;
            }
        });
    },

    map: function (fun, seq) {
        seq = Iterator(seq);
        return extend(object(Iterator.baseIterator), {
            toString: function () { return "map(...)"; },
            next: function () {
                return fun(seq.next());
            }
        });
    },

    chain: function (p, q/*, ...*/) {
		var args = getVarArgs(arguments).map(Iterator);
		var i = 0;
		while (i < args.length) {
			try {
				yield args[i].next();
			}
			catch (e) {
				if (e === StopIteration) {
					i++;
				}
				else {
					throw e;
				}
			}
		}
		throw StopIteration;
    },

    _tee: function (ident, sync, iterable) {
        sync.pos[ident] = -1;
        return extend(object(Iterator.baseIterator), {
            toString: function () { return "tee(" + ident + ", ...)"; },
            next: function () {
                var rval;
                var i = sync.pos[ident];

                if (i == sync.max) {
                    rval = iterable.next();
                    sync.deque.push(rval);
                    sync.max += 1;
                    sync.pos[ident] += 1;
                } else {
                    rval = sync.deque[i - sync.min];
                    sync.pos[ident] += 1;
                    if (i == sync.min && sync.pos.min() != sync.min) {
                        sync.min += 1;
                        sync.deque.shift();
                    }
                }
                return rval;
            }
        });
    },

    tee: function (iterable, n/* = 2 */) {
        var rval = [];
        var sync = {
            "pos": [],
            "deque": [],
            "max": -1,
            "min": -1
        };
        if (arguments.length == 1 || typeof(n) == "undefined" || n === null) {
            n = 2;
        }
        iterable = Iterator(iterable);
        var _tee = Iterator._tee;
        for (var i = 0; i < n; i++) {
            rval.push(_tee(i, sync, iterable));
        }
        return rval;
    },

    reduce: function (fn, iterable, /* optional */initial) {
        var i = 0;
        var x = initial;
        iterable = Iterator(iterable);
        if (arguments.length < 3) {
            try {
                x = iterable.next();
            } catch (e) {
                if (e == StopIteration) {
                    e = new TypeError("reduce() of empty sequence with no initial value");
                }
                throw e;
            }
            i++;
        }
        try {
            while (true) {
                x = fn(x, iterable.next());
            }
        } catch (e) {
            if (e != StopIteration) {
                throw e;
            }
        }
        return x;
    }
});

