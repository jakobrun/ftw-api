import { DomainEvent, ApplyEvent } from './events'
import { v4 as uuid } from 'uuid'
export interface Food {
    id: string
    name: string
    active: boolean
}

export const foodNullState: Food = {
    id: '',
    name: '',
    active: false,
}
export type FindFoodById = (id: string) => Promise<Food>

export interface User {
    id: string
}

export interface AddFoodCommand {
    type: 'addFood'
    aggregateId: string
    name: string
}

export interface RenameFoodCommand {
    type: 'renameFood'
    aggregateId: string
    name: string
}

export interface DeleteFoodCommand {
    type: 'deleteFood'
    aggregateId: string
}

export type FoodCommand = AddFoodCommand | RenameFoodCommand | DeleteFoodCommand

export type ApplyFoodCommand = (
    user: User,
    state: Food,
    command: FoodCommand
) => Promise<DomainEvent<any>[]>

export const applyFoodCommand: ApplyFoodCommand = (user, _state, command) => {
    switch (command.type) {
        case 'addFood':
            return Promise.resolve([
                {
                    type: 'foodAdded',
                    id: uuid(),
                    entityId: 'food',
                    aggregateId: command.aggregateId,
                    userid: user.id,
                    datetime: new Date(),
                    data: {
                        name: command.name,
                    },
                },
            ])
        case 'renameFood':
            return Promise.resolve([
                {
                    type: 'foodRenamed',
                    id: uuid(),
                    aggregateId: command.aggregateId,
                    entityId: 'food',
                    userid: user.id,
                    datetime: new Date(),
                    data: {
                        name: command.name,
                    },
                },
            ])
        case 'deleteFood':
            return Promise.resolve([
                {
                    type: 'foodDeleted',
                    id: uuid(),
                    aggregateId: command.aggregateId,
                    entityId: 'food',
                    userid: user.id,
                    datetime: new Date(),
                    data: {},
                },
            ])
    }
}

export const applyFoodEvent: ApplyEvent<Food> = (state, event) => {
    switch (event.type) {
        case 'foodAdded':
            return {
                id: event.aggregateId,
                name: event.data.name,
                active: true,
            }
        case 'foodRenamed':
            return {
                ...state,
                name: event.data.name,
            }
        case 'foodDeleted':
            return {
                ...state,
                active: false,
            }
        default:
            throw new Error('unknown event: ' + event.type)
    }
}

export interface IFoodForDay {
    id: string
    name: string
}

export interface IDay {
    date: Date
    food?: IFoodForDay
}

export const dayNullState: IDay = {
    date: new Date('1900-01-01'),
}

export interface ISelectFoodForDayCommand {
    type: 'selectFoodForDay'
    foodId: string
    date: Date
}

export type ApplyFoodForDayCommand = (
    user: User,
    state: IDay,
    command: ISelectFoodForDayCommand
) => Promise<DomainEvent<any>[]>

export const createApplyFoodForDayCommand = (
    findFood: FindFoodById
): ApplyFoodForDayCommand => async (user, _state, command) => {
    const food = await findFood(command.foodId)
    if (!food.active) {
        throw new Error('food not found')
    }
    return [
        {
            type: 'foodSelectedForDay',
            id: uuid(),
            aggregateId: command.date.toISOString().substring(0, 10),
            entityId: 'foodForDay',
            userid: user.id,
            datetime: new Date(),
            data: {
                foodId: food.id,
                foodName: food.name,
            },
        },
    ]
}

export const applyFoodForDayEvent: ApplyEvent<IDay> = (_state, event) => {
    switch (event.type) {
        case 'foodSelectedForDay':
            return {
                date: new Date(event.aggregateId),
                food: {
                    id: event.data.foodId,
                    name: event.data.foodName,
                },
            }
        default:
            throw new Error('unknown event: ' + event.type)
    }
}
