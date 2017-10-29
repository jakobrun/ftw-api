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
                    userid: '',
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
                    userid: '',
                    type: 'foodDeleted',
                    data: {},
                },
            ],
        }))
})
