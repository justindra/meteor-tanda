// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by justindra-tanda.js.
import { name as packageName } from "meteor/justindra-tanda";

// Write your tests here!
// Here is an example.
Tinytest.add('justindra-tanda - example', function (test) {
  test.equal(packageName, "justindra-tanda");
});
