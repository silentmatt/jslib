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
	var stop = [];

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
		var num = timers.length + 1;

		timers[num - 1] = thread(function() {
			while (!stop[num - 1]) {
				sleep(time);
				fn();
			}
			timers[num - 1].stop();
			delete stop[num - 1];
			delete timers[num - 1];
		});

		timers[num - 1].start();

		return num;
	};

	// Prevent a function from being called
	// <num> is the return value from setTimeout or setInterval
	this.clearInterval = function(num) {
		if (timers[num - 1]) {
			stop[num - 1] = true;
		}
	};
})();

