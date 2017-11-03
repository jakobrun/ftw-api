import * as pgPromise from 'pg-promise'
import { applyCommandsForAggregate } from './commands'
import { createEventStore } from './eventStore'
import {
    applyFoodCommand,
    applyFoodEvent,
    FoodCommand,
    IDayMenu,
    ISelectDinnerCommand,
    foodNullState,
    FindFoodById,
    createApplyFoodForDayCommand,
    applyDayMenuEvent,
    dayNullState,
    Food,
    User,
} from './model'
import { applyEvent as applyEventForFoodList } from './foodList'
import { applyEvent as applyDayMenuevent } from './dayMenuList'

export interface Api {
    food: (user: User) => Promise<Food[]>
    findFoodById: FindFoodById
    findDayMenyForPeriod: (
        from: string,
        to: string,
        user: User
    ) => Promise<IDayMenu[]>
    applyFoodCommands: (
        foodCommands: FoodCommand[],
        user: User
    ) => Promise<void>

    applyFoodForDayCommand: (
        command: ISelectDinnerCommand,
        user: User
    ) => Promise<void>
}
export const createApi = (db: pgPromise.IDatabase<any>): Api => {
    const eventStore = createEventStore(db)
    const findFoodById: FindFoodById = async id => {
        const events = await eventStore.findByAggregateId(id)
        return events.reduce(applyFoodEvent, foodNullState)
    }
    const applyFoodForDayCommand = createApplyFoodForDayCommand(findFoodById)
    return {
        food: async user => {
            const events = await eventStore.findAll(user.id, 'food')
            return events.reduce(applyEventForFoodList, [])
        },
        findFoodById,
        findDayMenyForPeriod: async (from, to, user) => {
            const events = await eventStore.findBetween(from, to, user.id)
            const initalState: IDayMenu[] = []
            const currentDate = new Date(from)
            const toDate = new Date(to)
            while (currentDate < toDate) {
                initalState.push({
                    date: currentDate.toISOString().substring(0, 10),
                })
                currentDate.setDate(currentDate.getDate() + 1)
            }
            const state = events.reduce(applyDayMenuevent, initalState)
            return state.sort((a, b) => {
                if (a.date > b.date) {
                    return -1
                } else if (a.date < b.date) {
                    return 1
                }
                return 0
            })
        },
        applyFoodForDayCommand: async (command, user) => {
            const aggreateId = command.date.toISOString().substring(0, 10)
            const events = await eventStore.findByAggregateId(aggreateId)
            const state = events.reduce(applyDayMenuEvent, dayNullState)
            const newEvents = await applyFoodForDayCommand(user, state, command)
            await eventStore.persist(newEvents)
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
