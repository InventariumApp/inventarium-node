#!/bin/bash

docker build -t cloud . && docker run -it -e GOOGLE_APPLICATION_CREDENTIALS -p 8080:3000 cloud
