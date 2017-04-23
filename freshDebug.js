// debug.js
//
// =============================================================================
// Provides output 
// =============================================================================

// Used to indicate how much output we would like
var debugFlag = 1;  

module.exports = {
  d: function(str) {
    debug(str);
  },

  // Draws a horizontal line to make the output more readable
  line: function() {
    debug("=====================================================");
  },

  // Writes the title in some ASCII typography
  title: function() {
    debug('  _____              _     ____        _            ');
    debug(' |  ___| __ ___  ___| |__ | __ ) _   _| |_ ___  ___ ');
    debug(' | |_ | \'__/ _ \\/ __| \'_ \\|  _ \\| | | | __/ _ \\/ __| ');
    debug(' |  _|| | |  __/\\__ \\ | | | |_) | |_| | ||  __/\\__ \\ ');
    debug(' |_|  |_|  \\___||___/_| |_|____/ \\__, |\\__\\___||___/ '); 
    debug('                                 |___/              ');
  },

  printStatusHeader: function() {
    statusLine();
    statusHeader();
    statusLine();
  },
  printStatus: function(temperature, ph, ppm, water, lights) {
    var statusStr = '|';
    statusStr += spaceBackpad((Math.round(temperature*100)/100).toString(), 14) + ' |';
    statusStr += spaceBackpad((Math.round(ph*100)/100).toString(), 5) + ' |';
    statusStr += spaceBackpad((Math.round(ppm*100)/100).toString(), 6) + ' |';
    statusStr += spaceBackpad(water, 6) + ' |';
    statusStr += spaceBackpad(lights, 7) + ' |';

    debug(statusStr);
  },

  powerStatus: function(name, status) {
    statusLine();
    debug(name.charAt(0).toUpperCase() + name.slice(1) + ' turned ' + status.toLowerCase() + '.');
    statusLine();
    statusHeader();
    statusLine();
  }
};

function debug(str) {
  if (debugFlag) {
    console.log(str);
  }
}

function spaceBackpad(str, length) {
  while (str.length < length) {
    str = ' ' + str;
  }
  return str;
}

function statusHeader() {
  debug('|  Temperature  |  pH  |  PPM  | Water | Lights |');
}

function statusLine() {
  debug('+---------------+------+-------+-------+--------+');
}
