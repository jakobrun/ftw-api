
export interface Event<T> {
    type: string
    id: string
    aggregateId: string
    data: T
    datetime: Date
    username: string
}

export interface Food {
    name: string
    active: boolean
}

export const nullState: Food = {
    name: '',
    active: false
}

export type ApplyCommand = (state: Food, commands: Command) => Promise<Event<any>[]>

export type ApplyEvents = (state: Food, events: Event<any>[]) => Food

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
                username: '',
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
                username: '',
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
                username: '',
                datetime: new Date(),
                data: {}
            }])        
    }
}

const applyEvent = (state: Food, event: Event<any>): Food => {
    switch (event.type) {
        case 'foodAdded':
            return {
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
export const applyEvents: ApplyEvents = (state, events) => events.reduce(applyEvent, state)