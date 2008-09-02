// Based on MochiKit.Logging

if (typeof Logging == "undefined") Logging = {};

Logging.LogMessage = function (num, level, info) {
    this.num = num;
    this.level = level;
    this.info = info;
    this.timestamp = new Date();
};

Logging.LogMessage.prototype = {
    toString: function () {
        return 'LogMessage(' + [this.num, this.level, this.info].map(methodCaller("toString")).join(', ') + ')';
    },
};

extend(Logging, {
    logLevelAtLeast: function (minLevel) {
        var self = Logging;
        if (typeof(minLevel) == 'string') {
            minLevel = self.LogLevel[minLevel];
        }
        return function (msg) {
            var msgLevel = msg.level;
            if (typeof(msgLevel) == 'string') {
                msgLevel = self.LogLevel[msgLevel];
            }
            return msgLevel >= minLevel;
        };
    },

    compareLogMessage: function (a, b) {
        return Array.compare([a.level, a.info], [b.level, b.info]);
    },

    alertListener: function (msg) {
        alert(
            "num: " + msg.num +
            "\nlevel: " +  msg.level +
            "\ninfo: " + msg.info.join(" ")
        );
    }

});

Logging.Logger = function (/* optional */maxSize) {
    this.counter = 0;
    if (typeof(maxSize) == 'undefined' || maxSize === null) {
        maxSize = -1;
    }
    this.maxSize = maxSize;
    this._messages = [];
    this.listeners = {};
    this.useNativeConsole = false;
};

Logging.Logger.prototype = {
    clear: function () {
        this._messages.splice(0, this._messages.length);
    },

    logToConsole: function (msg) {
        eprint(msg);
    },

    dispatchListeners: function (msg) {
        for (var k in this.listeners) {
            var pair = this.listeners[k];
            if (pair.ident != k || (pair[0] && !pair[0](msg))) {
                continue;
            }
            pair[1](msg);
        }
    },

    addListener: function (ident, filter, listener) {
        if (typeof(filter) == 'string') {
            filter = Logging.logLevelAtLeast(filter);
        }
        var entry = [filter, listener];
        entry.ident = ident;
        this.listeners[ident] = entry;
    },

    removeListener: function (ident) {
        delete this.listeners[ident];
    },

    baseLog: function (level, message/*, ...*/) {
        var msg = new Logging.LogMessage(
            this.counter,
            level,
            array(arguments, 1)
        );
        this._messages.push(msg);
        this.dispatchListeners(msg);
        if (this.useNativeConsole) {
            this.logToConsole(msg.level + ": " + msg.info.join(" "));
        }
        this.counter += 1;
        while (this.maxSize >= 0 && this._messages.length > this.maxSize) {
            this._messages.shift();
        }
    },

    getMessages: function (howMany) {
        var firstMsg = 0;
        if (!(typeof(howMany) == 'undefined' || howMany === null)) {
            firstMsg = Math.max(0, this._messages.length - howMany);
        }
        return this._messages.slice(firstMsg);
    },

    getMessageText: function (howMany) {
        if (typeof(howMany) == 'undefined' || howMany === null) {
            howMany = 30;
        }
        var messages = this.getMessages(howMany);
        if (messages.length) {
            var lst = messages.map(function (m) {
                return '\n  [' + m.num + '] ' + m.level + ': ' + m.info.join(' ');
            });
            lst.unshift('LAST ' + messages.length + ' MESSAGES:');
            return lst.join('');
        }
        return '';
    },
};

(function () {
    Logging.LogLevel = {
        ERROR: 40,
        FATAL: 50,
        WARNING: 30,
        INFO: 20,
        DEBUG: 10
    };

    var Logger = Logging.Logger;
    var baseLog = Logger.prototype.baseLog;
    extend(Logging.Logger.prototype, {
        debug: Function.partial(baseLog, 'DEBUG'),
        log: Function.partial(baseLog, 'INFO'),
        error: Function.partial(baseLog, 'ERROR'),
        fatal: Function.partial(baseLog, 'FATAL'),
        warning: Function.partial(baseLog, 'WARNING')
    });

    // indirectly find logger so it can be replaced
    var self = Logging;
    var connectLog = function (name) {
        return function () {
            self.logger[name].apply(self.logger, arguments);
        };
    };

	Logging.logger = new Logger();
    Logging.log = connectLog('log');
    Logging.logError = connectLog('error');
    Logging.logDebug = connectLog('debug');
    Logging.logFatal = connectLog('fatal');
    Logging.logWarning = connectLog('warning');
    Logging.logger.useNativeConsole = true;
})();

