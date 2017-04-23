// freshComponents.js
//
// =============================================================================
// This script provides functionality for our 3 sensor components and 2 power 
// components. Our three sensor components are: pH, temperature, and the
// nutrient density of the water (ppm). Our two power components control the
// grow lights and 
// =============================================================================

var db;
var output;

var temperatureComponent;
var ppmComponent;
var phComponent;
var lightsComponent;
var waterComponent;

var readings = [];

// Some of the sensors can take a while to poll so the following var is used in
// order to keep track of which ones have successfully been polled. This is
// useful when the time between polling sensors is very short, such as when a
// user would want to see live data instead of data that is only polled every
// few minutes. It uses a binary flag to keep track of what's been polled. A 1
// in a certain bits position indicates the sensor corresponding to that bit has
// been successfully polled while a 0 indicates that sensor has yet to respond.
// The bit in the 2^0 position represents temperature
// The bit in the 2^1 position represents nutrient density (ppm)
// The bit in the 2^2 position represents pH
//
// Example: readingFlag = 5 which is 101 in binary
//                           101
//                           ||| <-- temperature successfully polled
//                           ||
// pH successfully polled -->||
//                            |
//                            | <-- ppm sensor has not yet returned a value
//
// 1 = 001 = waiting for pH & ppm
// 2 = 010 = waiting for pH & temperature
// 3 = 011 = waiting for pH
// 4 = 100 = waiting for ppm & temperature
// 5 = 101 = waiting for ppm
// 6 = 110 = waiting for temperature
var readingFlag = 0;

module.exports = {
  loadComponents:  function(database, debug) {
    db = database;
    output = debug;

    temperatureComponent = new SensorComponent("temperature");
    ppmComponent         = new SensorComponent("ppm");
    phComponent          = new SensorComponent("ph");
    lightsComponent      = new PowerComponent("lights");
    waterComponent       = new PowerComponent("water");
  },

  pollSensors: function () {
    if (!readingFlag) {
      temperatureComponent.takeReading();
      // Our ppm and pH sensors rely on the same hardware so we must call them
      // synchronously. We will only poll the pH after we have already received
      // a response from the ppm sensor
      ppmComponent.takeReading();
    }
    else {
      if (readingFlag % 2 === 0) {
        output.d("ERROR: Still waiting for temperature sensor");
      }
      if (readingFlag === 1 || readingFlag === 4 || readingFlag === 5) {
        output.d('ERROR: Still waiting for ppm sensor');
      }
      if (readingFlag < 4) {
        output.d('ERROR: Still waiting for pH sensor');
      }
    }
  },

  cyclePower: function () {
    lightsComponent.fetchTimes();
    waterComponent.fetchTimes();
  },

  publishAll: function (res) {
    var config = publishConfig('*', res, publishAllCallback);
  },

  publishReadings: function(sensor, res) {
    var config = publishConfig(sensor, res, publishReadingCallback);
  },

  updateConfig: function(sensor, val1, val2) {
    var queryString = 'UPDATE Config SET ';
    if (sensor === 'water' || sensor === 'lights') {
      queryString += 'timeOn=' + val1 + ', timeOff=' + val2;
    }
    else {
      queryString += 'min=' + val1 + ', max=' + val2;
    }
    queryString += ' WHERE component="' + sensor + '";'

    console.log("Updating " + componentName);
    console.log("New min: " + min + "\nNew max: " + max);
    var updateQuery = connection.query(queryString, function(err, results) {});
  }
};


function publishReadingCallback(config, res, sensor) {
  var queryString = 'SELECT ' + sensor + ' as reading, pollTime FROM Readings ORDER BY pollTime DESC;';
  var query = db.query(queryString, function(err, results) {
    res.json({ 
      config: config, 
      readings: results 
    });
  });
}


function publishAllCallback(config, res) {
  var queryString = 'SELECT * FROM Readings WHERE pollTime=(SELECT MAX(pollTime) from Readings);';
  var query = db.query(queryString, function(err, results) {
    current = results[0];
    res.json({
      config: config, 
      temperature: current.temperature, 
      ph: current.ph,
      ppm: current.ppm, 
      switchTime: current.switchTime, 
      lights: lightsComponent.status, 
      water: waterComponent.status
      });
    });
}


function publishConfig(sensor, res, callback) {
  var queryString = 'SELECT * FROM Config';
  if (sensor !== '*') {
    queryString += ' WHERE component="' + sensor + '"';
  }
  queryString += ';';

  var query = db.query(queryString, function(err, results) {
    var config = {};
    
    for (var i = 0; i < results.length; i++) {
      switch(results[i]["component"]) {
        case "temperature":
          config.tempMin = results[i]["min"];
          config.tempMax = results[i]["max"];
          break;
        case "ph":
          config.phMin = results[i]["min"];
          config.phMax = results[i]["max"];
          break;
        case "ppm":
          config.ppmMin = results[i]["min"];
          config.ppmMax = results[i]["max"];
          break;
        case "water":
          config.waterOn = results[i]["timeOn"];
          config.waterOff = results[i]["timeOff"];
          break;
        case "lights":
          config.lightsOn = results[i]["timeOn"];
          config.lightsOff = results[i]["timeOff"];
          break;
      }
    }

    callback(config, res, sensor);
  });
}



function SensorComponent(componentName) {

  // Calls the respective script for each sensor 
  this.takeReading = function() {
    switch(componentName) {
      case "temperature":
        pollSensor('Components/pollTemp.py', ['-f'], function(result) { 
          storeReading(result, "temperature"); 
        });
        break;

      case "ppm":
        pollSensor('Components/pollAtlas.py', ['EC'], function(result) { 
          storeReading(result, "ppm"); 
          phComponent.takeReading();
        });
        break;

      case "ph":
        pollSensor('Components/pollAtlas.py', ['pH'], function(result) { 
          storeReading(result, "ph"); 
        });
        break;
    }
  }
}



// POWER COMPONENTS
// These control the pump that moves water from the tank to the top of system so
// that it can flow down across that plants' roots as well as the grow lights
// that supplement the natural light the plants receive
// =============================================================================

function PowerComponent(componentName) {
  var self = this;

  this.name = componentName;

  // Keeps track of whether the pump or lights are on or off
  this.status = "Off";

  // Keeps track of when the last time the water pump was turned on
  // We can infer the time it was last turned off based on the amount of time
  // specified to leave it on/ off in our db
  this.switchOnTime = 0;

  this.fetchTimes = function() {
    var timeOn;
    var timeOff;
    var queryString = 'SELECT * FROM Config WHERE component="' + self.name + '";';
    db.query(queryString, function(err, results) {
      if (self.name == "water") {
        self.cycleWater(results[0].timeOn, results[0].timeOff);
      }
      else {
        self.cycleLights(results[0].timeOn, results[0].timeOff);
      }
    });
  };

  this.turnOn = function() {
    var progOptions = ['On'];
    child = require('child_process').spawn('Components/' + self.name + ".sh", progOptions);

    child.on('exit', function() {
      self.status = "On";
      output.powerStatus(self.name, self.status);
    });
  }

  this.turnOff = function() {
    var progOptions = ['Off'];
    child = require('child_process').spawn('Components/' + self.name + ".sh", progOptions);

    child.on('exit', function() {
      self.status = "Off";
      output.powerStatus(self.name, self.status);
    });
  }

  // Turn the water on and off
  this.cycleWater = function (minutesOn, minutesOff) {
    var MINUTES_TO_MILLISECONDS = 60000;

    // Start with the water initially on
    self.switchOnTime = Date.now();
    self.turnOn();

    // If minutesOff is 0, just leave it running indefinitely
    if (minutesOff === 0) {
      return;
    }

    setInterval(function() {
      self.turnOff();
      setTimeout(function () {
        self.switchOnTime = Date.now();
        self.turnOn();
      }, minutesOff * MINUTES_TO_MILLISECONDS);
    }, (minutesOn + minutesOff) * MINUTES_TO_MILLISECONDS);
  }


  // Turn lights on and off
  this.cycleLights = function (timeOn, timeOff) {
    // Parse time on and off. They are just stored as ints in mysql
    var hourOn = Math.floor(timeOn / 100);
    var minutesOn = timeOn % 100;
    var hourOff = Math.floor(timeOff / 100);
    var minutesOff = timeOff % 100;


    // Check to see if the lights should currently be turned on or off
    var now = new Date();
    var cHour = now.getHours();
    var cMinutes = now.getMinutes();
    if (timeOn > timeOff) {
      if ((cHour > hourOn || cHour === hourOn && cMinutes >= minutesOn)
       || (cHour < hourOff || cHour === hourOff && cMinutes < minutesOff)) {
        self.turnOn();
      }
      else {
        self.turnOff();
      }
    }
    else if ((cHour > hourOn || cHour === hourOn && cMinutes >= minutesOn)
     && (cHour < hourOff || cHour === hourOff && cMinutes < minutesOff)) {
      self.turnOn();
    }
    else {
      self.turnOff();
    }
   

    // Check at the start of each minute if we should toggle the lights
    (function loop() {
      var now = new Date();

      if (lightsComponent.status === "On" && now.getHours() === hourOff
       && now.getMinutes() === minutesOff) {
        self.turnOff();
      }
      if (lightsComponent.status === "Off" && now.getHours() === hourOn
       && now.getMinutes() === minutesOn) {
        self.turnOn();
      }

      now = new Date();                  // allow for time passing
      var delay = 60000 - (now % 60000); // exact ms to next minute interval
      setTimeout(loop, delay);
    })();
  }
}








// POLL AND LOG SENSOR DATA
// =============================================================================

// TODO: Sometimes, the data is undefined. Fix it.
function pollSensor(progName, progOptions, callback) {
  var val = -1,
  child = require('child_process').spawn('./' + progName, progOptions);

  child.stdout.on('data', function (data) {
    val = parseFloat(data);
  });

  child.stderr.on('data', function (data) {
    //e("ERROR: ");
    //e(data);
  })

  child.on('exit', function() {
    return callback(val);
  });
}

function storeReading(reading, component) {
  if (reading) {
    readings[component] = reading;

    switch(component) {
      case 'temperature':
        readingFlag += 1;
        break;
      case 'ppm':
        readingFlag += 2;
        break;
      case 'ph':
        readingFlag += 4;
        break;
    }
  }
  else {
    console.log("WTF?");
  }

  if (readingFlag === 7) {
    output.printStatus(readings['temperature'], readings['ph'], readings['ppm'],
     waterComponent.status, lightsComponent.status);

    var callback = function(err, results) {};

    var queryString = 'INSERT INTO Readings (temperature, ph, ppm, switchTime, water, lights) VALUES (';
    queryString += readings['temperature'];
    queryString += ', ' + readings['ph'];
    queryString += ', ' + readings['ppm'];
    queryString += ', ' + waterComponent.switchOnTime;
    queryString += ', "' + waterComponent.status + '"';
    queryString += ', "' + lightsComponent.status + '"';
    queryString += ');';
      
    db.query(queryString, callback);

    readings = [];
    readingFlag = 0;
  }
}