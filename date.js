// Based on MochiKit Date functions

JSLIB.require("jslib");

Date.isDateLike = function(o) {
	return typeOf(o) == "object" && typeof(o.getTime) == 'function';
};

Date.compare = function(a, b) {
	return compare(a.getTime(), b.getTime());
};

Date.isoDate = function (str) {
    str = str + "";
    if (typeof(str) != "string" || str.length === 0) {
        return null;
    }
    var iso = str.split('-');
    if (iso.length === 0) {
        return null;
    }
	var date = new Date(iso[0], iso[1] - 1, iso[2]);
	date.setFullYear(iso[0]);
	date.setMonth(iso[1] - 1);
	date.setDate(iso[2]);
    return date;
};

// TODO: Hide this
Date._isoRegexp = /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/;

Date.isoTimestamp = function (str) {
    str = str + "";
    if (typeof(str) != "string" || str.length === 0) {
        return null;
    }
    var res = str.match(MochiKit.DateTime._isoRegexp);
    if (typeof(res) == "undefined" || res === null) {
        return null;
    }
    var year, month, day, hour, min, sec, msec;
    year = parseInt(res[1], 10);
    if (typeof(res[2]) == "undefined" || res[2] === '') {
        return new Date(year);
    }
    month = parseInt(res[2], 10) - 1;
    day = parseInt(res[3], 10);
    if (typeof(res[4]) == "undefined" || res[4] === '') {
        return new Date(year, month, day);
    }
    hour = parseInt(res[4], 10);
    min = parseInt(res[5], 10);
    sec = (typeof(res[6]) != "undefined" && res[6] !== '') ? parseInt(res[6], 10) : 0;
    if (typeof(res[7]) != "undefined" && res[7] !== '') {
        msec = Math.round(1000.0 * parseFloat("0." + res[7]));
    } else {
        msec = 0;
    }
    if ((typeof(res[8]) == "undefined" || res[8] === '') && (typeof(res[9]) == "undefined" || res[9] === '')) {
        return new Date(year, month, day, hour, min, sec, msec);
    }
    var ofs;
    if (typeof(res[9]) != "undefined" && res[9] !== '') {
        ofs = parseInt(res[10], 10) * 3600000;
        if (typeof(res[11]) != "undefined" && res[11] !== '') {
            ofs += parseInt(res[11], 10) * 60000;
        }
        if (res[9] == "-") {
            ofs = -ofs;
        }
    } else {
        ofs = 0;
    }
    return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
};

Date.toISOTime = function (date, realISO/* = false */) {
    if (typeof(date) == "undefined" || date === null) {
        return null;
    }
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var lst = [
        ((realISO && (hh < 10)) ? "0" + hh : hh),
        ((mm < 10) ? "0" + mm : mm),
        ((ss < 10) ? "0" + ss : ss)
    ];
    return lst.join(":");
};

Date.toISOTimestamp = function (date, realISO/* = false*/) {
    if (typeof(date) == "undefined" || date === null) {
        return null;
    }
    var sep = realISO ? "T" : " ";
    var foot = realISO ? "Z" : "";
    if (realISO) {
        date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    }
    return Date.toISODate(date) + sep + Date.toISOTime(date, realISO) + foot;
};

Date.toISODate = function (date) {
    if (typeof(date) == "undefined" || date === null) {
        return null;
    }
    var _padTwo = Date._padTwo;
	var _padFour = Date._padFour;
    return [
        _padFour(date.getFullYear()),
        _padTwo(date.getMonth() + 1),
        _padTwo(date.getDate())
    ].join("-");
};

/** @id MochiKit.DateTime.americanDate */
Date.americanDate = function (d) {
    d = d + "";
    if (typeof(d) != "string" || d.length === 0) {
        return null;
    }
    var a = d.split('/');
    return new Date(a[2], a[0] - 1, a[1]);
};

// TODO: Factor this out
Date._padTwo = function (n) {
    return (n > 9) ? n : "0" + n;
};

// TODO: Factor this out
// FIXME: What about zero length? Shouldn't it be "0000"?
Date._padFour = function(n) {
	switch(n.toString().length) {
		case 1: return "000" + n; break;
		case 2: return "00" + n; break;
		case 3: return "0" + n; break;
		case 4:
		default:
			return n;
	}
	return n;
};

Date.toPaddedAmericanDate = function (d) {
    if (typeof(d) == "undefined" || d === null) {
        return null;
    }
    var _padTwo = Date._padTwo;
    return [
        _padTwo(d.getMonth() + 1),
        _padTwo(d.getDate()),
        d.getFullYear()
    ].join('/');
};

Date.toAmericanDate = function (d) {
    if (typeof(d) == "undefined" || d === null) {
        return null;
    }
    return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
};

