#!/bin/bash

# We move temporally the bash script because if lk cli detects the file it will believe we are in a NodeJS project
mv package.json package.json.tmp

lk agent deploy
mv package.json.tmp package.json
