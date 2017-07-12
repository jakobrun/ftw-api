import { DomainEvent } from '../events'
import { applyCommand, applyEvent } from '../model'
import { createAssertCommand } from './assertCommands'

const assertCommands = createAssertCommand({ applyCommand, applyEvent })

const emptyEventList: DomainEvent<any>[] = []

describe('ftw', () => {
    it('should add food', () => assertCommands({
        before: emptyEventList,
        commands: [{
            type: 'addFood',
            aggregateId: '1',
            name: 'Pasta'
        }],
        after: [{
            id: '1',
            aggregateId: '1',
            userid: '',
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
            userid: '',
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
            userid: '',
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
            userid: '',
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
            userid: '',
            datetime: new Date(),
            type: 'foodDeleted',
            data: {}
        }]
    }))

})