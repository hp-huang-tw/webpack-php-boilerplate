#!/bin/bash
ERRORSTRING="Error. Please make sure you've indicated correct parameters (dev or beta or real)"

if [ $# -eq 0 ]
    then
        echo $ERRORSTRING;
    	exit 0
fi

# clean dist
rm -r dist/

# build template, js, css
if [ $1 == "dev" ]
    then
        npm run $1-build;
        # copy images to dist
        cp -r src/images/ dist/images
        npm run $1-server;
else
    npm run $1-build;
    # copy images to dist
    cp -r src/images/ dist/images
fi