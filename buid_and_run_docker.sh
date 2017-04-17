#!/bin/bash

docker build -t cloud . && docker run -it -e GOOGLE_APPLICATION_CREDENTIALS -p 80:3000 cloud
