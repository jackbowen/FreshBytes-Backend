#! /usr/bin/python

import serial

usbport = '/dev/ttyAMA0'
ser = serial.Serial(usbport, 9600)

#turn on the LEDs 
ser.write("L,1\r")
ser.write("C,1\r")

line = ""

ser.write("Cal,clear\r")
raw_input("Calibrate dry. Press enter to continue")
ser.write("Cal,dry\r")

raw_input("Calibrate low.")
ser.write("Cal,low,12880\r")

raw_input("Calibrate high.")
ser.write("Cal,high,80000\r") 

while True:
   data = ser.read()
   if(data == "\r"):
      print "Received: " + line
      line = ""
   else:
      line = line + data
