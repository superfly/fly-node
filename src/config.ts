import { URL } from 'url'
import { env } from 'process'

function inSecondaryRegion() {
  return env.FLY_REGION && env.PRIMARY_REGION && env.FLY_REGION !== env.PRIMARY_REGION 
}

export function regionalDatabaseUrl() {
  if (!env.DATABASE_URL) return 

  let url = new URL(env.DATABASE_URL)
  if (inSecondaryRegion()) {
    url.host = `${env.FLY_REGION}.${url.host}`
    url.port = "5433"
  }
  return url.toString()
}