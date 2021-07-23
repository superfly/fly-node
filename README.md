This package contains Express-compatible middleware and helpers for deploying Node.js apps on [Fly.io](https://fly.io). 

## Requirements

You should have [setup a postgres cluster](https://fly.io/docs/getting-started/multi-region-databases/) on Fly. Then:

* ensure that your Postgresql and application regions match up
* ensure that no backup regions are assigned to your application
* attach the Postgres cluster to your application with `fly postgres attach`

Finally, set the `PRIMARY_REGION` environment variable in your app `fly.toml` to match the primary database region.

## Installation

`yarn add fly-node`

## Configuration

Insert the request handler middleware as high as possible in the stack, before your controllers, and the error handler after them.

```
import express from "express"
import { requestHandler, errorHandler } from "@fly/node"

const app = express()

app.use(requestHandler)

app.get("/", function rootHandler(req, res) {
  res.end("Root!");
});

app.use(errorHandler)

````

## TODO

* Mention that Express users with async route handlers will need to wrap them to correctly capture exceptions
