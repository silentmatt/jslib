// Text Encoding/Decoding Functions

JSLIB.require("jslib");

// Decode a base64-encoded string
function base64_decode(s) {
	if ((s.length % 4) == 0) {
		if (typeof(atob) != "undefined") {
			return atob(s);
		}
		else {
			var nBits;
			var sDecoded = new Array(s.length / 4);
			var base64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			for (var i=0; i<s.length; i+=4) {
				nBits = (base64.indexOf(s.charAt(i)) & 0xff) << 18 |
				(base64.indexOf(s.charAt(i+1)) & 0xff) << 12 |
				(base64.indexOf(s.charAt(i+2)) & 0xff) << 6 |
				(base64.indexOf(s.charAt(i+3)) & 0xff);
				sDecoded[i] = String.fromCharCode((nBits & 0xff0000) >> 16, (nBits & 0xff00) >> 8, nBits & 0xff);
			}
			sDecoded[sDecoded.length-1] = sDecoded[sDecoded.length-1].substring(
				0, 3 - ((s.charCodeAt(i-2) == 61) ? 2: (s.charCodeAt(i-1) == 61 ? 1 : 0)));
			return sDecoded.join("");
		}
	}
	else {
		throw new Exception("String length must be divisible by 4.");
	}
}

// Base64-encode a string
function base64_encode(s) {
	if(typeof(btoa) != "undefined") {
		return btoa(s);
	}
	else {
		var base64 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
		              'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
		              '0','1','2','3','4','5','6','7','8','9','+','/'];
		var sbin;
		var pad = 0;
		var s = string(s);
		if ((s.length % 3) == 1) {
			s += String.fromCharCode(0);
			s += String.fromCharCode(0);
			pad = 2;
		}
		else if ((s.length % 3) == 2) {
			s += String.fromCharCode(0);
			pad = 1;
		}
		var rslt = new Array(s.length / 3);
		var ri = 0;
		for (var i=0; i<s.length; i+=3) {
			sbin = ((s.charCodeAt(i) & 0xff) << 16) | ((s.charCodeAt(i+1) & 0xff) << 8) | (s.charCodeAt(i+2) & 0xff);
			rslt[ri] = (base64[(sbin>>18) & 0x3f] + base64[(sbin>>12) & 0x3f] + base64[(sbin>>6) & 0x3f] + base64[sbin & 0x3f]);
			ri++;
		}
		if (pad > 0) {
			rslt[rslt.length - 1] = rslt[rslt.length - 1].substr(0, 4-pad) + ((pad==2) ? "==" : (pad==1) ? "=" : "");
		}
		return rslt.join("");
	}
}

// Decode a URI-encoded string
var uri_decode = decodeURIComponent;

// URI-encode a string
var uri_encode = encodeURIComponent;

// LZW-compress a string
function lzw_encode(s) {
	var dict = {};
	var data = (s + "").split("");
	var out = [];
	var currChar;
	var phrase = data[0];
	var code = 256;
	for (var i=1; i<data.length; i++) {
		currChar=data[i];
		if (dict[phrase + currChar] != null) {
			phrase += currChar;
		}
		else {
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			dict[phrase + currChar] = code;
			code++;
			phrase=currChar;
		}
	}
	out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	for (var i=0; i<out.length; i++) {
		out[i] = String.fromCharCode(out[i]);
	}
	return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
	var dict = {};
	var data = (s + "").split("");
	var currChar = data[0];
	var oldPhrase = currChar;
	var out = [currChar];
	var code = 256;
	var phrase;
	for (var i=1; i<data.length; i++) {
		var currCode = data[i].charCodeAt(0);
		if (currCode < 256) {
			phrase = data[i];
		}
		else {
			phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
		}
		out.push(phrase);
		currChar = phrase.charAt(0);
		dict[code] = oldPhrase + currChar;
		code++;
		oldPhrase = phrase;
	}
	return out.join("");
}

