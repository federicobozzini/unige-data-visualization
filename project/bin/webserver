#!/usr/bin/env bash

docker rm -f dv-webserver
docker run --rm -d -v  $(pwd):/usr/share/nginx/html:ro --name dv-webserver -p 8923:80 nginx:alpine