import * as express from 'express'
import * as pgPromise from 'pg-promise'
import { AddAuthentication } from './auth/types'
import { createEventStore } from './eventStore'
import { applyCommandsForAggregate } from './commands'
import {
    applyFoodCommand,
    applyFoodEvent,
    FoodCommand,
    foodNullState,
} from './model'
import { applyEvent as applyEventForFoodList } from './foodList'
import { json } from 'body-parser'

import * as cookieParser from 'cookie-parser'
import * as expressSession from 'express-session'

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
    const eventStore = createEventStore(db)
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

    const api = express.Router()
    api.use(ensureLoggedIn)
    api.get('/user', (req, res) => res.json(req.user))
    api.get('/food', async (req, res, next) => {
        try {
            const events = await eventStore.findAll(req.user.id, 'food')
            const foodList = events.reduce(applyEventForFoodList, [])
            res.json(foodList)
        } catch (ex) {
            next(ex)
        }
    })

    api.post('/food', async (req, res, next) => {
        try {
            const user = req.user
            const commands: FoodCommand[] = req.body.commands
            const aggreateIds = commands.reduce((arr: string[], command) => {
                if (!arr.some(id => id === command.aggregateId)) {
                    arr.push(command.aggregateId)
                }
                return arr
            }, [])
            await aggreateIds.reduce(async (promise, id) => {
                await promise
                return applyCommandsForAggregate(
                    {
                        applyCommand: applyFoodCommand,
                        applyEvent: applyFoodEvent,
                        user: user,
                        nullState: foodNullState,
                    },
                    eventStore,
                    id,
                    commands.filter(c => c.aggregateId === id)
                )
            }, Promise.resolve())
            res.json({ success: true })
        } catch (ex) {
            next(ex)
        }
    })

    app.use('/api/v1', api)

    return app
}
