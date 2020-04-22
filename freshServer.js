// freshServer.js
//
// =============================================================================
// This script sets up our server as well as provides the api for other programs
// to call.
// =============================================================================

// BASE SETUP
// =============================================================================

// Call the local packages we need
var freshDebug      = require('./freshDebug.js')
var freshDatabase   = require('./freshDatabase');
var freshComponents = require('./freshComponents');

// Call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors       = require('cors');
var schedule   = require('node-schedule');
                      
// Configure app to use bodyParser
// This will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure app to use cors
// This will let the web app access the data
app.use(cors());

freshComponents.loadComponents(freshDatabase, freshDebug);

var port = process.env.PORT || 8080;        // set our port









// CONFIGURE
// =============================================================================
/*
function publishAll(res) {
   var query = connection.query("SELECT * FROM Readings WHERE pollTime=(SELECT MAX(pollTime) from Readings);", function(err, results) {
      current = results[0];
      res.json({ temperature: current.temperature, ph: current.ph, ppm: current.ppm, switchTime: current.switchTime, lights: lightsComponent.status, water: waterComponent.status});
   });
}
*/




// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Middleware to use for all requests
router.use(function(req, res, next) {
  next(); // Make sure we go to the next routes and don't stop here
});

// Temperature
router.get('/temperature', function(req, res) {
  freshComponents.publishReadings('temperature', res);
});
router.post('/temperature', function(req, res) {
   //temperatureComponent.updateConfig(req.body.val1, req.body.val2);
   console.log('huh?');
});

// ph
router.get('/ph', function(req, res) {
  freshComponents.publishReadings('ph', res);
});
router.post('/ph', function(req, res) {
   phComponent.updateConfig(req.body.val1, req.body.val2);
});

// PPM
router.get('/nutrients', function(req, res) {
   freshComponents.publishReadings('ppm', res);
});
router.post('/nutrients', function(req, res) {
   ppmComponent.updateConfig(req.body.val1, req.body.val2);
});

// Lights
router.get('/lights', function(req, res) {
  freshComponents.publishReadings('lights', res);
});
router.post('/lights', function(req, res) {
   lightsComponent.updateConfig(req.body.val1, req.body.val2);
});

// Water
router.get('/pumpTimer', function(req, res) {
  freshComponents.publishReadings('water', res);
});
router.post('/pumpTimer', function(req, res) {
   waterComponent.updateConfig(req.body.val1, req.body.val2);
});

// all
router.get('/all', function(req, res) {
  freshComponents.publishAll(res);
});

// all
router.get('/config', function(req, res) {
   publishConfig(res);
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);









// START THE SERVER
// =============================================================================
app.listen(port);


freshDebug.title();
freshDebug.line();
freshDebug.d('FreshBytes is listening on port ' + port);
freshDebug.line();
freshDebug.printStatusHeader();

















// CONTROL LOGIC BEGINS HERE
// =============================================================================

// How often to poll sensors in ms
var pollInterval = 300000; // Every 5 minutes
//var pollInterval = 10000;

freshComponents.cyclePower();
setInterval(function() {
  freshComponents.pollSensors();
}, pollInterval);




