import * as express from 'express'
import * as pgPromise from 'pg-promise'
import { createEventStore } from './eventStore'
import { applyCommandsForAggregate } from './commands'
import { User } from './family'
import {
    applyFoodCommand,
    applyFoodEvent,
    FoodCommand,
    foodNullState,
} from './model'
import { applyEvent as applyEventForFoodList } from './foodList'
import { json } from 'body-parser'

import * as passport from 'passport'
import { Strategy } from 'passport-facebook'
import * as cookieParser from 'cookie-parser'
import * as expressSession from 'express-session'

passport.use(
    new Strategy(
        {
            clientID: process.env.FTW_FB_APP_ID || 'test',
            clientSecret: process.env.FTW_FB_APP_SECRET || 'test',
            callbackURL: 'https://ftw-app.herokuapp.com/login/facebook/return',
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        function(accessToken, refreshToken, profile, cb) {
            return cb(null, profile)
        }
    )
)
passport.serializeUser(function(user, cb) {
    cb(null, user)
})

passport.deserializeUser(function(obj, cb) {
    cb(null, obj)
})

export const createApp = (db: pgPromise.IDatabase<any>) => {
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
    app.use(passport.initialize())
    app.use(passport.session())

    app.get('/login', (req, res) => {
        res.json({ login: 'facebook', url: '/login/facebook' })
    })

    app.get(
        '/login/facebook',
        passport.authenticate('facebook', {
            scope: ['email', 'user_relationships'],
        })
    )

    app.get(
        '/login/facebook/return',
        passport.authenticate('facebook', {
            failureRedirect: '/login',
            scope: ['email', 'user_relationships'],
        }),
        function(req, res) {
            console.log('user', req.user)
            res.json(req.user)
        }
    )

    app.get('/user', (req, res) => res.json(req.user))

    const api = express.Router()
    api.get('/food', async (req, res, next) => {
        try {
            const events = await eventStore.findAll()
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
