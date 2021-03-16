#!/bin/bash -e
   FILE=/dist/index.html
   if [ -e "$FILE" ]; then
   rm -rfv /dist/*.*
   fi
