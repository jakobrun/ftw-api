import * as pgPromise from 'pg-promise'
import { applyCommandsForAggregate } from './commands'
import { createEventStore } from './eventStore'
import {
    applyFoodCommand,
    applyFoodEvent,
    FoodCommand,
    foodNullState,
    Food,
    User,
} from './model'
import { applyEvent as applyEventForFoodList } from './foodList'

export interface Api {
    food: (user: User) => Promise<Food[]>
    applyFoodCommands: (
        foodCommands: FoodCommand[],
        user: User
    ) => Promise<void>
}
export const createApi = (db: pgPromise.IDatabase<any>): Api => {
    const eventStore = createEventStore(db)
    return {
        food: async user => {
            const events = await eventStore.findAll(user.id, 'food')
            return events.reduce(applyEventForFoodList, [])
        },
        applyFoodCommands: async (commands, user) => {
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
        },
    }
}
