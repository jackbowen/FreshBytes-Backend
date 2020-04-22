#! /usr/bin/python

import sys
import serial
import RPi.GPIO as GPIO
import re

GPIO.setmode(GPIO.BCM)
if GPIO.gpio_function(23) == GPIO.OUT:
  GPIO.setwarnings(False)
GPIO.setup(23, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)

def pickSensor(sensorName):
   if sensorName == 'DO':
      GPIO.output(23, GPIO.LOW)
      GPIO.output(24, GPIO.LOW)
   elif sensorName == 'pH':
      GPIO.output(23, GPIO.LOW)
      GPIO.output(24, GPIO.HIGH)
   elif sensorName == 'EC':
      GPIO.output(23, GPIO.HIGH)
      GPIO.output(24, GPIO.LOW)
   else:
      print "Unsupported sensor: " + sensorName
      sys.exit()

usbport = '/dev/ttyS0'
ser = serial.Serial(usbport, 9600, timeout = 0)

line = ""

chosenSensor = sys.argv[1]
pickSensor(chosenSensor)

#clear the serial buffer
ser.write("\r")

#turn on the leds
ser.write("L,1\r")

#take a reading
while True:
   ser.write("R\r")
   while ser.in_waiting > 0:
      data = ser.read()
      if(data == "\r"):
         #print line
         if line != '*OK' and line != '*ER':
            if chosenSensor == 'EC':
               line = line.split(",")[0]

            if re.match("[0-9]+\.*[0-9]*", line):
               print line
               GPIO.cleanup()
               sys.exit()
         line = ""    
      else:
         line = line + data
