#! /usr/bin/python
import os
import glob
import time
import sys

os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')

base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28*')[0]
device_file = device_folder + '/w1_slave'

def read_temp_raw():
   f = open(device_file, 'r')
   lines = f.readlines()
   f.close()
   return lines

def read_temp():
   lines = read_temp_raw()
   while lines[0].strip()[-3:] != 'YES':
      time.sleep(0.2)
      lines = read_temp_raw()
   equals_pos = lines[1].find('t=')
   if equals_pos != -1:
      temp_string = lines[1][equals_pos+2:]
      temp_c = float(temp_string) / 1000.0
      if len(sys.argv) == 1:
         print "Please specify units with -c or -f"
         return
      if sys.argv[1] == '-c' or sys.argv[1] == '-C':
         print temp_c
      elif sys.argv[1] == '-f' or sys.argv[1] == '-F':
         temp_f = temp_c * 9.0 / 5.0 + 32.0
         print temp_f
    

sys.exit(read_temp())
