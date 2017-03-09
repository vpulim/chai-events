"use strict";
const chai = require("chai");
const should = chai.should();

chai.use(require("../chai-events"));

const EventEmitter = require("events");

describe("x.should.emit", function() {

  let emitter = null;
  beforeEach(function() {
    emitter = new EventEmitter();
  });

  it("should fail if given non-event-emitters", function() {
    (function() {
      ({x: 1}).should.emit("test");
    }).should.fail;
  });

  it("should listen for immediately emitted events", function(done) {
    emitter.should.emit("test").then(done);
    emitter.emit("test", true);
  });

  it("should fail if the event isn't sent", function() {
    (function() {
      emitter.should.emit("test");
    }).should.fail;
  });

  it("should handle events that should not fire", function(done) {
    emitter.should.not.emit("test").then(done);
  });

  it("should fail if given a fired event", function(done) {
    (function() {
      emitter.should.not.emit("test");
    }).should.fail;
    setTimeout(function() {
      emitter.emit("test");
      done()
    }, 200);
  });

});
