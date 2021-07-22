import { env } from 'process'
import { RequestHandler, Response } from 'express'

function inSecondaryRegion() {
  return env.FLY_REGION && env.PRIMARY_REGION && env.FLY_REGION !== env.PRIMARY_REGION 
}

const replayInPrimaryRegion = (response: Response, http_method: String) => {
  response.append('Fly-Replay', `region=${env.PRIMARY_REGION}; state=${http_method}`)
  response.status(409).send(`Replaying in ${env.PRIMARY_REGION}`)
}

export const requestHandler: RequestHandler = (req, res, next) => {
  const replayableHttpMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

  if (env.FLY_REGION) {
    res.append('Fly-Region', env.FLY_REGION)
  }

  if (inSecondaryRegion() && replayableHttpMethods.includes(req.method)) {
    return replayInPrimaryRegion(res, "http_method")
  }

  next()
}