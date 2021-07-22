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

Insert the middleware as high as possible in the stack, before your controllers.

```
import express from "express"
import * as Fly from "@fly/node"

const app = express()

app.use(Fly.requestHandler)

app.get("/", function rootHandler(req, res) {
  res.end("Root!");
});

````

