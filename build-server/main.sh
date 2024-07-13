#!/bin/bash

export GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"
# export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
# export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"

if [ -z "$GIT_REPOSITORY_URL" ]; then
  echo "Error: GIT_REPOSITORY_URL is not set."
  exit 1
fi

git clone "$GIT_REPOSITORY_URL" /home/app/output

if [ $? -ne 0 ]; then
  echo "Error: Git clone failed."
  exit 1
fi

exec node script.js
