#!/bin/bash

docker build -t docker-whale . && docker run -it -p 8080:3000 docker-whale
