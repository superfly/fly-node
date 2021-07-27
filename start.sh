#!/bin/sh

DATABASE_URL=postgresql://postgres:postgres@localhost:5434/fly_node FLY_REGION=ams PRIMARY_REGION=iad yarn start
