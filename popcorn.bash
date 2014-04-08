#!/bin/bash

TMP="/home/demax/tmp"
TMPDIR="/tmp/Popcornify"
if [ -L "${TMPDIR}" ]; then
  rm "${TMPDIR}"
#  rm -r "${TMPDIR}"
fi
ln -s "$TMP" "${TMPDIR}"
./nw . 