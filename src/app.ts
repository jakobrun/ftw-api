import * as express from 'express'
import * as pgPromise from 'pg-promise'
import { createEventStore } from './eventStore'
import { applyCommand, applyEvent, Command, nullState } from './model'
import { applyEvent as applyEventForFoodList } from './foodList'
import { json } from 'body-parser'

export const createApp = (db: pgPromise.IDatabase<any>) => {
    const eventStore = createEventStore(db)
    const app = express()
    app.use(json())

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
                if(!arr.some(id => id === command.aggregateId)) {
                    arr.push(command.aggregateId)
                }
                return arr
            }, [])
            await aggreateIds.reduce(async (promise, id) => {
                await promise
                return applyCommandsForAggregate(id, commands.filter( c => c.aggregateId === id))
            }, Promise.resolve())
            res.json({ success: true })
        } catch (ex) {
            next(ex)
        }
    })

    app.use('/api/v1', api)

    return app
}