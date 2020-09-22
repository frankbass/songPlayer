#!/bin/bash

#to simplify git commands
#execute: ./add_push.sh

echo "message: "
read input
git add .
git commit -m "$input"
git push
