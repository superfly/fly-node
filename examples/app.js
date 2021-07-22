import { env } from 'process'
import express from 'express'
const app = express()
const port = 3500
import { requestHandler } from '../dist/index.js'

app.use(requestHandler)

app.get('/', (req, res) => {
  const content = 'Come and Fly with me!<form method="POST"><input type="submit"></input></form>'
  res.send(content)
})

app.post('/', (req, res) => {
  const content = `Posted in region ${env.FLY_REGION}`;
  res.send(content);
})

app.listen(port, () => {
  console.log(`Flying on http://localhost:${port}`)
})

