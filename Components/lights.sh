#!/bin/bash
arg=$1

pin="17"
echo $pin > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio$pin/direction

if [[ $arg =~ [oO][nN] ]]; then
	echo 1 > /sys/class/gpio/gpio$pin/value
elif [[ $arg =~ [oO][fF][fF] ]]; then
	echo 0 > /sys/class/gpio/gpio$pin/value
else
	echo "Please specify whether you wish to turn lights on or off"
fi
