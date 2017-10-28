import { applyFoodCommand, applyFoodEvent, foodNullState } from '../model'
import { createAssertCommand } from './assertCommands'

const user = {
    id: 'test',
}

const assertCommands = createAssertCommand({
    applyCommand: applyFoodCommand,
    applyEvent: applyFoodEvent,
    nullState: foodNullState,
    user: user,
})

describe('ftw', () => {
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
                    id: '1',
                    aggregateId: '1',
                    userid: user.id,
                    datetime: new Date(),
                    entityId: 'food',
                    type: 'foodAdded',
                    data: {
                        name: 'Pasta',
                    },
                },
            ],
        }))
    it('should rename food', () =>
        assertCommands({
            before: [
                {
                    id: '1',
                    aggregateId: '1',
                    entityId: 'food',
                    userid: user.id,
                    datetime: new Date(),
                    type: 'foodAdded',
                    data: {
                        name: 'Pasta',
                    },
                },
            ],
            commands: [
                {
                    type: 'renameFood',
                    id: '2',
                    aggregateId: '1',
                    name: 'Pizza',
                },
            ],
            after: [
                {
                    id: '2',
                    aggregateId: '1',
                    userid: user.id,
                    entityId: 'food',
                    datetime: new Date(),
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
                    id: '1',
                    aggregateId: '1',
                    entityId: 'food',
                    userid: '',
                    datetime: new Date(),
                    type: 'foodAdded',
                    data: {
                        name: 'Pasta',
                    },
                },
            ],
            commands: [
                {
                    type: 'deleteFood',
                    id: '2',
                    aggregateId: '1',
                },
            ],
            after: [
                {
                    id: '2',
                    aggregateId: '1',
                    entityId: 'food',
                    userid: '',
                    datetime: new Date(),
                    type: 'foodDeleted',
                    data: {},
                },
            ],
        }))
})
