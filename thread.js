// Thread and timer functions

// Create a Java thread from a function
function thread(fn) {
	return new java.lang.Thread(new java.lang.Runnable({
		run: fn
	}));
}

// Get the current Thread
function currentThread() {
	return java.lang.Thread.currentThread();
}

// Stop the current thread for <time> milliseconds
function sleep(time) {
	return currentThread().sleep(time);
}

// Timer Functions

// From Simulated browser environment for Rhino
// By John Resig <http://ejohn.org/>
// Copyright 2007 John Resig, under the MIT License

(function() {
	var timers = [];

	// Run <fn> after <time> milliseconds
	this.setTimeout = function(fn, time) {
		var num;
		return num = setInterval(function() {
			fn();
			clearInterval(num);
		}, time);
	};

	// Run <fn> every <time> milliseconds
	this.setInterval = function(fn, time) {
		var num = timers.length;

		timers[num] = thread(function() {
			while (true) {
				sleep(time);
				fn();
			}
		});

		timers[num].start();

		return num;
	};

	// Prevent a function from being called
	// <num> is the return value from setTimeout or setInterval
	this.clearInterval = function(num) {
		if (timers[num]) {
			timers[num].stop();
			delete timers[num];
		}
	};
})();

