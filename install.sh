#!/bin/sh

#apt-get update

echo "Checking for dependencies"

nodePath=/usr/local/lib/node
if [ -d "$nodePath" ]; then #TODO: employ a more robust way of checking than this
	echo "-> Node already installed."
else
	echo "-> Installing node.";
	mkdir /usr/local/lib/node
	wget https://nodejs.org/dist/v10.20.1/node-v10.20.1-linux-armv6l.tar.xz
	tar -xJf node-v10.20.1-linux-armv6l.tar.xz -C /usr/local/lib/node
	echo export NODEJS_HOME=/usr/local/lib/node/node-v10.20.1-linux-armv6l >> ~/.profile
	echo export PATH=$NODEJS_HOME/bin:$PATH >> ~/.profile
	. ~/.profile
	rm node-v10.20.1-linux-armv6l.tar.xz
fi

echo "Installing node dependencies."
npm install #TODO: make this work with sudo

hash mysql 2>/dev/null || {
	echo "-> Installing mysql.";
	sudo apt install mariadb;
	#TODO: write prompt informing them to leave password blank
	#TODO: write prompt informing them to remove anon users
	#TODO: write prompt informing them to allow remote access
	#TODO: write prompt informing them to remove test db
	#TODO: write prompt informing them to reload priv tables
	sudo mysql_secure_installation;
}

echo "Attempting to initialize the MySQL database for FreshBytes. This must be done the first time FreshBytes is installed but will wipe any data FreshBytes has gathered if you have a previous install."
while true; do
	read -p "Do you wish to initialize database? [Y/n]: " yn
case $yn in
		[Yy]* ) echo "-> Initializing databases."; mysql -u root < createFreshBytesSql.sql; break;;
		[Nn]* ) echo "-> Skipping database initialization."; break;;
		*) echo "Please answer yes or no.";;
	esac
done

#TODO: make the grep not print to the command line
grep dtoverlay=w1-gpio /boot/config.txt 2>/dev/null || {
	echo "-> Enabling one-wire interface for temperature probe.";
	echo "# Enable the one-wire interface" >> /boot/config.txt;
	echo "dtoverlay=w1-gpio" >> /boot/config.txt;
}

grep core_freq=250 /boot/config.txt 2>/dev/null || {
	echo "-> Enabling UART serial for pH and EC probes.";
	echo "# Enable UART for Atlas Scientific probes (pH and EC)" >> /boot/config.txt;
	echo "core_freq=250" >> /boot/config.txt;
	echo "enable_uart=1" >> /boot/config.txt;
}

tempPath=/sys/class/gpio/gpio17
if [ -d "$tempPath" ]; then
	echo "-> GPIO 17 already set to export."
else
	echo "-> Setting GPIO 17 to export."
	echo 17 > /sys/class/gpio/export
fi

otherTempPath=/sys/class/gpio/gpio27
if [ -d "$otherTempPath" ]; then
	echo "-> GPIO 27 already set to export."
else
	echo "-> Setting GPIO 27 to export."
	echo 27 > /sys/class/gpio/export
fi

echo "Adding start up scripts"
if [ -e /etc/init.d/FreshBytesInit ]; then
	echo "-> FreshBytesInit file already exists."
else
	echo "-> Creating FreshBytesInit file."
	echo "#! /bin/sh" > /etc/init.d/FreshBytesInit
	echo "Setting up Atlas probes" >> /etc/init.d/FreshBytesInit
	echo "~/FreshBytes-Backend/Components/setupAtlas.py" >> /etc/init.d/FreshBytesInit
	#TODO: make the file run node ~/FreshBytes-Backend/FreshServer.js
	sudo chmod 755 /etc/init.d/FreshBytesInit
	update-rc.d FreshBytesInit defaults
fi

echo "Done."
