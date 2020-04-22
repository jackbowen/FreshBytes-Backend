#! /usr/bin/python

import sys
import serial
import RPi.GPIO as GPIO
import re

def clearStream():
  ser.write(" ")
  while ser.in_waiting > 0:
    ser.read()
  ser.write("C,0\r")
  return

usbport = '/dev/ttyS0'
ser = serial.Serial(usbport, 9600, timeout = 0)

GPIO.setmode(GPIO.BCM)
if GPIO.gpio_function(23) == GPIO.OUT:
  GPIO.setwarnings(False)
GPIO.setup(23, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)

GPIO.output(23, GPIO.LOW)
GPIO.output(24, GPIO.LOW)
clearStream()

GPIO.output(23, GPIO.LOW)
GPIO.output(24, GPIO.HIGH)
clearStream()

GPIO.output(23, GPIO.HIGH)
GPIO.output(24, GPIO.LOW)
clearStream()

