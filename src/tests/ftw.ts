import { applyCommand, applyEvents, Event } from '../model'
import { createAssertCommand } from './assertCommands'

const assertCommands = createAssertCommand({applyCommand, applyEvents})

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
})