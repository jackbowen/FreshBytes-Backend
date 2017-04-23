#!/bin/sh
# NOT WORKING YET. JUST A PLACEHOLDER
LIST_OF_APPS="node mysql"

aptitude update
aptitude install -y $LIST_OF_APPS
