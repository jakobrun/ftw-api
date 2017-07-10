import { DomainEvent } from '../events'
import { applyEvent } from '../foodList'
import { expect } from 'chai'

describe('food list', () => {
    it('should create list from events', () => {
        const events: DomainEvent<any>[] = [{
            type: 'foodAdded',
            id: '1',
            aggregateId: '1',
            data: {
                name: 'Fasta'
            },
            datetime: new Date(),
            userid: ''
        }, {
            type: 'foodAdded',
            id: '2',
            aggregateId: '2',
            data: {
                name: 'Pizza'
            },
            datetime: new Date(),
            userid: ''
        }, {
            type: 'foodAdded',
            id: '3',
            aggregateId: '3',
            data: {
                name: 'Meet balls'
            },
            datetime: new Date(),
            userid: ''
        }, {
            type: 'foodRenamed',
            id: '4',
            aggregateId: '1',
            data: {
                name: 'Pasta'
            },
            datetime: new Date(),
            userid: ''
        }, {
            type: 'foodDeleted',
            id: '5',
            aggregateId: '3',
            data: {},
            datetime: new Date(),
            userid: ''
        }]

        const foodList = events.reduce(applyEvent, [])
        expect(foodList).to.eql([{
            id: '1',
            name: 'Pasta',
            active: true
        }, {
            id: '2',
            name: 'Pizza',
            active: true
        }])
    })
})