#! /usr/bin/python

import serial, sys

usbport = '/dev/ttyAMA0'
ser = serial.Serial(usbport, 9600)

#turn on the LEDs 
ser.write("L,1\r")
ser.write("C,1\r")

line = ""

while True:
   data = ser.read()
   if(data == "\r"):
      print "Received: " + line
#      ec = line.split(",")[0]
#      if ec != "*OK":
#         print ec
#         sys.exit(ec)
      line = ""
   else:
      line = line + data
