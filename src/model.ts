import { User } from './family'
import { DomainEvent, ApplyEvent } from './events'
export interface Food {
    id: string
    name: string
    active: boolean
}

export const foodNullState: Food = {
    id: '',
    name: '',
    active: false
}

export type ApplyCommand = (user: User, state: Food, commands: FoodCommand) => Promise<DomainEvent<any>[]>

export interface AddFoodCommand {
    type: 'addFood'
    aggregateId: string
    name: string
}

export interface RenameFoodCommand {
    type: 'renameFood'
    id: string
    aggregateId: string
    name: string
}

export interface DeleteFoodCommand {
    type: 'deleteFood'
    id: string
    aggregateId: string
}

export type FoodCommand = AddFoodCommand | RenameFoodCommand | DeleteFoodCommand

export const applyFoodCommand: ApplyCommand = (user, state, command) => {
    switch (command.type) {
        case 'addFood':
            return Promise.resolve([{
                type: 'foodAdded',
                id: command.aggregateId,
                aggregateId: command.aggregateId,
                userid: '',
                datetime: new Date(),
                data: {
                    name: command.name
                }
            }])
        case 'renameFood':
            return Promise.resolve([{
                type: 'foodRenamed',
                id: command.id,
                aggregateId: command.aggregateId,
                userid: '',
                datetime: new Date(),
                data: {
                    name: command.name
                }
            }])
        case 'deleteFood':
            return Promise.resolve([{
                type: 'foodDeleted',
                id: command.id,
                aggregateId: command.aggregateId,
                userid: '',
                datetime: new Date(),
                data: {}
            }])        
    }
}

export const applyFoodEvent: ApplyEvent<Food> = (state, event) => {
    switch (event.type) {
        case 'foodAdded':
            return {
                id: event.aggregateId,
                name: event.data.name,
                active: true
            }
        case 'foodRenamed':
            return {
                ...state,
                name: event.data.name
            }
        case 'foodDeleted':
            return {
                ...state,
                active: false
            }
        default: throw new Error('unknown event: ' + event.type)
    }
}
