import { URL } from 'url'
import { env } from 'process'

export function regionalDatabaseUrl() {
  if (!env.DATABASE_URL) return 

  let url = new URL(env.DATABASE_URL)
  url.host = `${env.FLY_REGION}.${url.host}`
  return url.toString()
}
