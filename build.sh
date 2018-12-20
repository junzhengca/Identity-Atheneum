#!/bin/bash

echo "$(date) Begin build..."

echo "$(date) Transpiling JavaScript..."
npm run flow:build >/dev/null
echo "$(date) JavaScript Transpiled."

echo "$(date) Copying views..."
if [ -d "lib/Views" ]; then
    echo "lib/Views already exists, removing..."
    rm -rf lib/Views
fi
cp -r src/Views lib/Views &>/dev/null
echo "$(date) Views copied."

echo "$(date) Building static assets..."
cd landing
bundle exec jekyll build &>/dev/null
cd ..
echo "$(date) Static assets built."