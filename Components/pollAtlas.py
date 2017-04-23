#! /usr/bin/python

import sys
import serial
import RPi.GPIO as GPIO
import re

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(23, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)

def pickSensor(sensorName):
   if sensorName == 'EC':
      GPIO.output(23, GPIO.LOW)
      GPIO.output(24, GPIO.LOW)
   elif sensorName == 'pH':
      GPIO.output(23, GPIO.LOW)
      GPIO.output(24, GPIO.HIGH)
   elif sensorName == 'DO':
      GPIO.output(23, GPIO.HIGH)
      GPIO.output(24, GPIO.LOW)
   else:
      print "Unsupported sensor: " + sensorName
      sys.exit()

usbport = '/dev/ttyAMA0'
ser = serial.Serial(usbport, 9600, timeout = 0)

line = ""

chosenSensor = sys.argv[1]
pickSensor(chosenSensor)

#clear the serial buffer
ser.write("\r")

#turn off the leds
ser.write("L,0\r")

#enable stream
ser.write("C,1\r")

while True:
   data = ser.read()
   if(data == "\r"):
      if line != '*OK' and line != '*ER':
         if chosenSensor == 'EC':
            line = line.split(",")[0]
         if re.match("[0-9]+\.[0-9]+", line):
            print line
            GPIO.cleanup()
            sys.exit()
      line = ""    
   else:
      line = line + data
