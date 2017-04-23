#! /usr/bin/python

import sys
import serial
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)

GPIO.setup(23, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)

def pickSensor(sensorName):
    if sensorName == 'pH':
        GPIO.output(23, GPIO.HIGH)
        GPIO.output(24, GPIO.LOW)
    elif sensorName == 'EC':
        # EC
        GPIO.output(23, GPIO.LOW)
        GPIO.output(24, GPIO.LOW)
    else:
        print("Wtf is " + sensorName + "?")

usbport = '/dev/ttyAMA0'
ser = serial.Serial(usbport, 9600, timeout = 0)

line = ""

pickSensor(sys.argv[1])

#clear the serial buffer
ser.write("\r")

#turn on the leds
ser.write("L,1\r")

#enable stream
ser.write("C,1\r")

while True:
    data = ser.read()
    if(data == "\r"):
        if line != '*OK' and line != '*ER':
            print line
        line = ""    
    else:
        line = line + data
