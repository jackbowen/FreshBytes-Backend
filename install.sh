#!/bin/sh

#apt-get update

echo "Checking for dependencies"
#install nodejs 
#curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
#sudo apt-get install -y nodejs

hash node 2>/dev/null || {
	echo "-> Installing node.";
       	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -;
	sudo apt-get install -y nodejs;
}

hash npm 2>/dev/null || {
	echo "-> Installing npm.";
	sudo apt-get install npm;
}

hash mysql 2>/dev/null || {
	echo "-> Installing mysql.";
	sudo apt-get install mysql-server;
}

#TODO: make the grep not print to the command line
grep dtoverlay=w1-gpio /boot/config.txt 2>/dev/null || {
	echo "-> Enabling one-wire interface.";
	echo "# Enable the one-wire interface" >> /boot/config.txt;
	echo "dtoverlay=w1-gpio" >> /boot/config.txt;
}

# TODO: make this in an if block
echo 17 > /sys/class/gpio/export
echo 27 > /sys/class/gpio/export

echo "Done."
