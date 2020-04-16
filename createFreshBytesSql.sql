DROP DATABASE IF EXISTS FreshBytes;
CREATE DATABASE FreshBytes;
USE FreshBytes;

CREATE TABLE Config (
   id INT NOT NULL AUTO_INCREMENT,
   component VARCHAR(20),
   min FLOAT,
   max FLOAT,
   timeOn FLOAT,
   timeOff FLOAT,
   PRIMARY KEY (id)
);

INSERT INTO Config (component, min, max) VALUES ("temperature", 65, 80);
INSERT INTO Config (component, min, max) VALUES ("ph", 5.0, 7.0);
INSERT INTO Config (component, min, max) VALUES ("ppm", 1000, 2000);
INSERT INTO Config (component, timeOn, timeOff) VALUES ("water", 9, 3);
INSERT INTO Config (component, timeOn, timeOff) VALUES ("lights", 0800, 2300);

CREATE TABLE Readings (
   id INT NOT NULL AUTO_INCREMENT,
   temperature FLOAT, 
   ph FLOAT,
   ppm FLOAT,
   lights CHAR(3),
   water CHAR(3), 
   switchTime BIGINT,
   pollTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (id)
);
INSERT INTO Readings (temperature, ph, ppm, switchTime, lights, water) VALUES (72.5, 6.25, 1250, 0, "Off", "Off");

