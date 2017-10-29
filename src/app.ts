import * as express from 'express'
import * as pgPromise from 'pg-promise'
import { json } from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as expressSession from 'express-session'
import * as graphqlHTTP from 'express-graphql'
import { createApi } from './api'
import { createSchema } from './graphql'
import { AddAuthentication } from './auth/types'

const ensureLoggedIn: express.RequestHandler = (req, res, next) => {
    if (!req.user) {
        res.status(401).send('Unauthorized')
        return
    }
    next()
}

export const createApp = (
    db: pgPromise.IDatabase<any>,
    addLoginMiddlewares: AddAuthentication
) => {
    const internalApi = createApi(db)
    const app = express()
    app.use(cookieParser())
    app.use(json())
    app.use(
        expressSession({
            secret: process.env.FTW_SESSION_SECRET || 'notsafe',
            resave: true,
            saveUninitialized: true,
        })
    )
    addLoginMiddlewares(app)
    app.post('/logout', (req, res) => {
        req.logout()
        res.json({ success: true })
    })

    app.use(
        '/graphql',
        ensureLoggedIn,
        graphqlHTTP({
            schema: createSchema(internalApi),
            graphiql: true,
        })
    )

    const api = express.Router()
    api.use(ensureLoggedIn)
    api.get('/user', (req, res) => res.json(req.user))
    api.get('/food', async (req, res, next) =>
        internalApi
            .food(req.user)
            .then(res.json.bind(res))
            .catch(next)
    )

    api.post('/food', async (req, res, next) =>
        internalApi
            .applyFoodCommands(req.body.commands, req.user)
            .then(() => res.json({ success: true }))
            .catch(next)
    )

    app.use('/api/v1', api)

    return app
}
