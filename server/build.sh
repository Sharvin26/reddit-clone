#!/bin/bash

echo Version of API Server?
read VERSION

docker build -t reddit-clone/lireddit:$VERSION .