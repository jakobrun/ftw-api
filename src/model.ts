
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
    name: string
}

export interface DeleteFoodCommand {
    type: 'deleteFood'
    id: string
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
        case 'renameFood': throw new Error('not implement')
        case 'deleteFood': throw new Error('not implement')
    }
}

const applyEvent = (state: Food, event: Event<any>): Food => {
    switch (event.type) {
        case 'foodAdded':
            
            return {
                name: event.data.name
            }
        default: throw new Error('unknown event: ' + event.type)
    }
}
export const applyEvents: ApplyEvents = (state, events) => events.reduce(applyEvent, state)