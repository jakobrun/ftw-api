import * as express from 'express'
import * as pgPromise from 'pg-promise'
import { createEventStore } from './eventStore'
import { applyCommand, applyEvent, Command, nullState } from './model'
import { applyEvent as applyEventForFoodList } from './foodList'
import { json } from 'body-parser'

import * as passport from 'passport'
import { Strategy } from 'passport-facebook'
import * as cookieParser from 'cookie-parser'
import * as expressSession from 'express-session'

passport.use(new Strategy({
    clientID: process.env.FTW_FB_APP_ID || '',
    clientSecret: process.env.FTW_FB_APP_SECRET || '',
    callbackURL: 'https://ftw-app.herokuapp.com/login/facebook/return'
},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }));
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

export const createApp = (db: pgPromise.IDatabase<any>) => {
    const eventStore = createEventStore(db)
    const app = express()
    app.use(cookieParser())
    app.use(json())
    app.use(expressSession({ secret: process.env.FTW_SESSION_SECRET || 'notsafe', resave: true, saveUninitialized: true }))
    app.use(passport.initialize())
    app.use(passport.session())

    app.get('/login', (req, res) => {
        res.json({ login: 'facebook', url: '/login/facebook' })
    })

    app.get('/login/facebook', passport.authenticate('facebook'))

    app.get('/login/facebook/return',
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        function (req, res) {
            console.log('user', req.user)
            res.json(req.user)
        })

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

    const applyCommandsForAggregate = async (aggreateId: string, commands: Command[]) => {
        const events = await eventStore.findByAggregateId(aggreateId)
        const initState = events.reduce(applyEvent, nullState)
        await commands.reduce(async (statePromise, command) => {
            const state = await statePromise
            const events = await applyCommand(state, command)
            const newState = events.reduce(applyEvent, state)
            await eventStore.persist(events)
            return newState
        }, Promise.resolve(initState))

    }

    api.post('/food', async (req, res, next) => {
        try {
            const commands: Command[] = req.body.commands
            const aggreateIds = commands.reduce((arr: string[], command) => {
                if (!arr.some(id => id === command.aggregateId)) {
                    arr.push(command.aggregateId)
                }
                return arr
            }, [])
            await aggreateIds.reduce(async (promise, id) => {
                await promise
                return applyCommandsForAggregate(id, commands.filter(c => c.aggregateId === id))
            }, Promise.resolve())
            res.json({ success: true })
        } catch (ex) {
            next(ex)
        }
    })

    app.use('/api/v1', api)

    return app
}