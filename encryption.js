// Encryption Functions

// Encrypt/decrypt a string <s> using basic XOR encryption with <key>
function xor_encrypt(s, key) {
	var e = new Array(s.length);
	var l = key.length;
	for (var i=0; i<s.length; i++) {
		e[i] = String.fromCharCode(s.charCodeAt(i) ^ key.charCodeAt(i % l));
	}
	return e.join("");
};
var xor_decrypt = xor_encrypt;

// Encrypt/decrypt a string <s> using RC-4 encryption with <key>
function rc4_encrypt(s, key) {
	var sbox = new Array(256);
	for(var i=0; i<256; i++) {
		sbox[i] = i;
	}
	var j = 0;
	for (var i=0; i<256; i++) {
		j = (j + sbox[i] + key.charCodeAt(i % key.length)) % 256;
		var tmp = sbox[i];
		sbox[i] = sbox[j];
		sbox[j] = tmp;
	}
	var i = 256;
	var j = 256;
	var rslt = new Array(s.length);
	for (var k=0; k<s.length; k++) {
		i = (i+1) % 256;
		j = (j+sbox[i]) % 256;
		var tmp = sbox[i];
		sbox[i] = sbox[j];
		sbox[j] = tmp;
		t = (sbox[i]+sbox[j]) % 256;
		rslt[k] = String.fromCharCode(s.charCodeAt(k) ^ sbox[t]);
	}
	return rslt.join("");
};
var rc4_decrypt = rc4_encrypt;

