import {
    applyFoodCommand,
    applyFoodEvent,
    foodNullState,
    createApplyFoodForDayCommand,
    applyDayMenuEvent,
    dayNullState,
    Food,
} from '../model'
import { createAssertCommand } from './assertCommands'

const user = {
    id: 'test',
}

describe('food', () => {
    const assertCommands = createAssertCommand({
        applyCommand: applyFoodCommand,
        applyEvent: applyFoodEvent,
        nullState: foodNullState,
        user: user,
    })
    it('should add food', () =>
        assertCommands({
            before: [],
            commands: [
                {
                    type: 'addFood',
                    aggregateId: '1',
                    name: 'Pasta',
                },
            ],
            after: [
                {
                    aggregateId: '1',
                    userid: user.id,
                    entityId: 'food',
                    type: 'foodAdded',
                    data: {
                        name: 'Pasta',
                    },
                },
            ],
        }))
    it('should throw error if name is empty', () =>
        assertCommands({
            before: [],
            commands: [
                {
                    type: 'addFood',
                    aggregateId: '1',
                    name: '',
                },
            ],
            after: [],
            errorMessage: 'Name is required',
        }))
    it('should rename food', () =>
        assertCommands({
            before: [
                {
                    aggregateId: '1',
                    entityId: 'food',
                    userid: user.id,
                    type: 'foodAdded',
                    data: {
                        name: 'Pasta',
                    },
                },
            ],
            commands: [
                {
                    type: 'renameFood',
                    aggregateId: '1',
                    name: 'Pizza',
                },
            ],
            after: [
                {
                    aggregateId: '1',
                    userid: user.id,
                    entityId: 'food',
                    type: 'foodRenamed',
                    data: {
                        name: 'Pizza',
                    },
                },
            ],
        }))

    it('should delete food', () =>
        assertCommands({
            before: [
                {
                    aggregateId: '1',
                    entityId: 'food',
                    userid: user.id,
                    type: 'foodAdded',
                    data: {
                        name: 'Pasta',
                    },
                },
            ],
            commands: [
                {
                    type: 'deleteFood',
                    aggregateId: '1',
                },
            ],
            after: [
                {
                    aggregateId: '1',
                    entityId: 'food',
                    userid: user.id,
                    type: 'foodDeleted',
                    data: {},
                },
            ],
        }))
})

describe('food for day', () => {
    const foodList: Food[] = [
        {
            id: 'pasta',
            name: 'Pasta',
            active: true,
        },
    ]
    const findFood = (id: string) => {
        const food = foodList.find(f => f.id === id) || foodNullState
        return Promise.resolve(food)
    }
    const assertCommands = createAssertCommand({
        applyCommand: createApplyFoodForDayCommand(findFood),
        applyEvent: applyDayMenuEvent,
        nullState: dayNullState,
        user: user,
    })
    it('should select dinner°', () =>
        assertCommands({
            before: [],
            commands: [
                {
                    type: 'selectDinner',
                    foodId: 'pasta',
                    date: new Date('2017-10-29'),
                },
            ],
            after: [
                {
                    aggregateId: '2017-10-29',
                    entityId: 'dayMenu',
                    userid: user.id,
                    type: 'dinnerSelected',
                    data: {
                        id: 'pasta',
                        name: 'Pasta',
                    },
                },
            ],
        }))

    it('should throw error if food does not exist', () =>
        assertCommands({
            before: [],
            commands: [
                {
                    type: 'selectDinner',
                    foodId: 'bla',
                    date: new Date('2017-10-29'),
                },
            ],
            after: [],
            errorMessage: 'food not found',
        }))
})
