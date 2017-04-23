#!/usr/bin/python

import subprocess
WLAN_check_flg = False


'''
This function checks if the WLAN is still up by pinging the router.
If there is no return, we'll reset the WLAN connection.
If the resetting of the WLAN does not work, we need to reset the Pi.
'''
def WLAN_check(WLAN_check_flg):
   ping_ret = subprocess.call(['ping -c -w 1 -q 192.168.1.1 |grep "1 received" > /dev/null 2> /dev/null'], shell=True)
   if ping_ret:
      print "if"
      # we lost the WLAN connection.
      # did we try to recover already?
      if WLAN_check_flg:
         WLAN_check_flg = False
         # we have a serious problem and need to reboot the Pi to recover the WLAN connection
         subprocess.call(['logger "WLAN Down, Pi is forcing a reboot"'], shell=True)
         WLAN_check_flg = False
         subprocess.call(['sudo reboot'], shell=True)
      else:
         #try to recover the connection by resetting the LAN
         subprocess.call(['logger "WLAN Down, Pi is resetting WLAN connection"'], shell=True)
         WLAN_check_flg = True
         subprocess.call(['sudo /sbin/ifdown wlan0 && sleep 10 && sudo /sbin/ifup --force wlan0'], shell=True)
   else:
      print "else"
      WLAN_check_flg = False

WLAN_check(WLAN_check_flg)
