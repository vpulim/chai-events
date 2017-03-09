function plugin(chai, utils) {

  var Assertion = chai.Assertion;

  /**
   * Checks if a given entry is an event emitter.
   * Uses EventEmitter or EventTarget if available to quickly check `instanceof`.  Otherwise, checks that common methods
   * to event emitters are available.
   *
   * Gracefully handles custom implementations of event emitters even if EventEmitter or EventTarget are available,
   * checking methods if the emitter doesn't inherit from the global emitter.
  */
  function isEmitter() {
    // Easy check: if Node's EventEmitter or window.EventEmitter exist, check if this is an instance of it.
    if(typeof EventEmitter !== "undefined" && EventEmitter !== null && this._obj instanceof EventEmitter) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    // Easy check: if the browser's EventTarget exists, check if this is an instance of it.
    if(typeof EventTarget !== "undefined" && EventTarget !== null && this._obj instanceof EventTarget) {
      return this.assert(true, "", "expected #{this} to not be an EventTarget");
    }

    var obj = this._obj;

    // Check for Node.js style event emitters with "on", "emit", etc.
    var node = ["on", "emit"].every(function(method) {
      return typeof obj[method] === "function";
    });

    if(node) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    // Check for Browser-based event emitters with "addEventListener", etc.
    var browser = ["addEventListener", "dispatchEvent", "removeEventListener"].every(function(method) {
      return typeof obj[method] === "function";
    });

    if(browser) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    this.assert(false, "expected #{this} to be an EventEmitter", "");
  };

  Assertion.addProperty("emitter", isEmitter);
  Assertion.addProperty("target", isEmitter);

  Assertion.addMethod("emit", function(name, args) {
    new Assertion(this._obj).to.be.an.emitter;

    new Assertion(name).to.be.a("string");
    var obj = this._obj;
    var _this = this;
    var assert = function() {
      _this.assert.apply(_this, arguments);
    }
    var timeout = utils.flag(this, 'timeout') || 1500;

    if(utils.flag(this, 'negate')) {
      // Ensure that the event doesn't fire before timeout
      return new Promise(function(resolve, reject) {
        var done = false;
        obj.on(name, function() {
          if(done) { return; }
          done = true;
          assert(false, "expected #{this} to not emit "+name+".");
          resolve();
        });
        setTimeout(function() {
          if(done) { return; }
          done = true;
          resolve();
        }, timeout);
      });
    }
    else {
      // Ensure that the event fires
      return new Promise(function(resolve, reject) {
        var done = false;
        obj.on(name, function() {
          if(done) { return; }
          done = true;
          resolve();
        });
        setTimeout(function() {
          if(done) { return; }
          done = true;
          assert(false, "expected #{this} to emit "+name+".");
          resolve();
        }, timeout);
      });
    }
  });

}

if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
  module.exports = plugin;
}
else if (typeof define === "function" && define.amd) {
  define(function () {
    return plugin;
  });
}
else {
  // Other environment (usually <script> tag): plug in to global chai instance directly.
  chai.use(plugin);
}
