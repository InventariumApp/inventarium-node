#!/bin/bash

docker build -t cloud . && docker run -it -e GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/cloud_storage_service_account_key.json -p 80:3000 cloud
