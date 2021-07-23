import { env } from "process"
import * as express from "express"
import { Request, Response, NextFunction, RequestHandler } from 'express'
import { requestHandler, errorHandler } from "../src"

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const app = express()
const port = 3500

app.set('view engine', 'pug')
app.set('views', './examples/views')

app.use(requestHandler)

// Hack to enable error handling in async handlers
// https://medium.com/@benlugavere/using-promises-with-express-8c986c10fae
const asyncWrap = (routeHandler: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
	Promise
		.resolve(routeHandler(req, res, next))
		.catch(err => next(err))


const root = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()
  res.render('index', { users })  
}

const post = async (req: Request, res: Response) => {
  const random = Math.round(Math.random() * 100)
  await prisma.user.create({
    data: {
      email: `someemail${random}@example.com`,
      name: `Fer${random}`
    }
  })
  const content = `Posted in region ${env.FLY_REGION}`
  res.send(content);
}

app.get("/", asyncWrap(root))
app.post("/", asyncWrap(post))

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Flying on http://localhost:${port}`)
})
