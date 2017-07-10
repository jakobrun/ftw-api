import { DomainEvent, ApplyEvent } from './events'
export interface Food {
    id: string
    name: string
    active: boolean
}

export const nullState: Food = {
    id: '',
    name: '',
    active: false
}

export type ApplyCommand = (state: Food, commands: Command) => Promise<DomainEvent<any>[]>

export interface AddFoodCommand {
    type: 'addFood'
    id: string
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

export type Command = AddFoodCommand | RenameFoodCommand | DeleteFoodCommand

export const applyCommand: ApplyCommand = (state, command) => {
    switch (command.type) {
        case 'addFood':
            return Promise.resolve([{
                type: 'foodAdded',
                id: command.id,
                aggregateId: command.id,
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

export const applyEvent: ApplyEvent<Food> = (state, event) => {
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
