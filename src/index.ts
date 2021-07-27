import { env } from 'process'
import { RequestHandler, ErrorRequestHandler, Response } from 'express'
export { regionalDatabaseUrl } from './config'

enum RequestReplayTypes {
  CapturedWrite = 'captured_write',
  HttpMethod = 'http_method',
  Threshold = 'threshold'
}

function inSecondaryRegion() {
  return env.FLY_REGION && env.PRIMARY_REGION && env.FLY_REGION !== env.PRIMARY_REGION 
}

function replayInPrimaryRegion(response: Response, state: RequestReplayTypes) {
  response.append('Fly-Replay', `region=${env.PRIMARY_REGION}; state=${state}`)
  response.status(409).send(`Replaying in ${env.PRIMARY_REGION}`)
}

export const requestHandler: RequestHandler = (req, res, next) => {
  const replayableHttpMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

  if (env.FLY_REGION) {
    res.append('Fly-Region', env.FLY_REGION)
  }

  if (inSecondaryRegion()) {

    if (replayableHttpMethods.includes(req.method)) {
      return replayInPrimaryRegion(res, RequestReplayTypes.HttpMethod)
    }

    if (req.cookies && req.cookies['fly-replay-threshold'] && parseInt(req.cookies['fly-replay-threshold']) - Date.now() > 0) {
      return replayInPrimaryRegion(res, RequestReplayTypes.Threshold)
    }
  }

  if (req.header('Fly-Replay-Src')) {
    let matches = req.header('Fly-Replay-Src')?.toString().matchAll(/(.*?)=(.*?)($|;)/g)
    if (matches && !Array.from(matches).some(match => match.toString() == 'threshold')) {
      let threshold = Date.now() + (60 * 5)
      res.cookie("fly-replay-threshold", threshold)
    }
  }


  next()
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  /* Prisma throws low-level errors as strings, and this is the only error we care about
     until we decide to support other database adapters
  */
  if (error.toString().includes('SqlState("25006")') && inSecondaryRegion()) {
    replayInPrimaryRegion(res, RequestReplayTypes.CapturedWrite)
  } else {
    next(error)
  }
}
