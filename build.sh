#!/bin/bash

echo "$(date) Begin build..."

echo "$(date) Transpiling JavaScript..."
flow-remove-types ./src/ -d ./lib/ --all --pretty &>/dev/null
echo "$(date) JavaScript Transpiled."

echo "$(date) Copying views..."
cp -r src/views lib/views &>/dev/null
echo "$(date) Views copied."

echo "$(date) Building static assets..."
cd landing
bundle exec jekyll build &>/dev/null
cd ..
echo "$(date) Static assets built."