"use strict";

__karma__.loaded = function() {};

require("./bootstrap");

var testContext = require.context("./", true, /\.spec\.ts$/);
testContext.keys().map(testContext);

__karma__.start();
