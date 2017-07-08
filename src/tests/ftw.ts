import { applyCommand, applyEvents, Event } from '../model'
import { createAssertCommand } from './assertCommands'

const assertCommands = createAssertCommand({ applyCommand, applyEvents })

const emptyEventList: Event<any>[] = []

describe('ftw', () => {
    it('should add food', () => assertCommands({
        before: emptyEventList,
        commands: [{
            type: 'addFood',
            id: '1',
            name: 'Pasta'
        }],
        after: [{
            id: '1',
            aggregateId: '1',
            username: '',
            datetime: new Date(),
            type: 'foodAdded',
            data: {
                name: 'Pasta'
            }
        }]
    }))
    it('should rename food', () => assertCommands({
        before: [{
            id: '1',
            aggregateId: '1',
            username: '',
            datetime: new Date(),
            type: 'foodAdded',
            data: {
                name: 'Pasta'
            }
        }],
        commands: [{
            type: 'renameFood',
            id: '2',
            aggregateId: '1',
            name: 'Pizza'
        }],
        after: [{
            id: '2',
            aggregateId: '1',
            username: '',
            datetime: new Date(),
            type: 'foodRenamed',
            data: {
                name: 'Pizza'
            }
        }]
    }))

    it('should delete food', () => assertCommands({
        before: [{
            id: '1',
            aggregateId: '1',
            username: '',
            datetime: new Date(),
            type: 'foodAdded',
            data: {
                name: 'Pasta'
            }
        }],
        commands: [{
            type: 'deleteFood',
            id: '2',
            aggregateId: '1'
        }],
        after: [{
            id: '2',
            aggregateId: '1',
            username: '',
            datetime: new Date(),
            type: 'foodDeleted',
            data: {}
        }]
    }))

})