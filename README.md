# FreshBytes Backend

The backend to run FreshBytes, a hydroponic and aquaponic monitoring and control system. The system runs on [this](https://github.com/jackbowen/FreshBytes-Hardware) and is interacted with through [this](https://github.com/jackbowen/FreshBytes-WebApp) app.

## Instructions

### Install

Navigate to the folder containing your download and run:

```
sudo ./install.sh
```

Enable the one-wire interface. This is what our temperature probe will use.
```
sudo raspi-config
```
Scroll down to interfacing options, select "P7 1-Wire Enable/Disable one-wire interface" and enable it.

### Running the software

```
node freshServer.js
```

