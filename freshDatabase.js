// freshDatabase.js
//
// =============================================================================
// This script connects to our db and allows our other files to query it
// =============================================================================

var mysql = require('mysql');

// Set up our mysql connection
var connection = mysql.createConnection({   
  host: 'localhost',
  user: 'root',
  password: 'password'
}); 


// Log any fatal errors connecting to db
var del = connection._protocol._delegateError;
connection._protocol._delegateError = function(err, sequence) {
  if (err.fatal) {
    // TODO: CHANGE THIS TO USE debug.js
    console.trace('fatal error: ' + err.message);
  }
  return del.call('fatal error: ' + err.message);
};

// Connect to our mysql db and switch to the actual db we want to use
connection.connect();
var db = connection.query('USE FreshBytes;', function(err, results) {});

module.exports = {
  query: function (queryString, callback) {
    connection.query(queryString, callback);
  }
};