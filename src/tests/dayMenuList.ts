import { DomainEvent } from '../events'
import { applyEvent } from '../dayMenuList'
import { expect } from 'chai'

describe('food list', () => {
    const pasta = {
        id: '1',
        name: 'Pasta',
    }
    const pizza = {
        id: '2',
        name: 'Pizza',
    }
    const soup = {
        id: '3',
        name: 'Soup',
    }
    const events: DomainEvent<any>[] = [
        {
            type: 'dinnerSelected',
            id: '1',
            entityId: 'dayMenu',
            aggregateId: '2017-10-30',
            data: pasta,
            datetime: new Date(),
            userid: '',
        },
        {
            type: 'dinnerSelected',
            id: '2',
            entityId: 'dayMenu',
            aggregateId: '2017-10-29',
            data: pizza,
            datetime: new Date(),
            userid: '',
        },
        {
            type: 'dinnerSelected',
            id: '3',
            entityId: 'dayMenu',
            aggregateId: '2017-10-30',
            data: soup,
            datetime: new Date(),
            userid: '',
        },
    ]

    const expectedResult = [
        {
            date: '2017-10-30',
            dinner: soup,
        },
        {
            date: '2017-10-29',
            dinner: pizza,
        },
    ]
    it('should create day menu list', () => {
        const dayList = events.reduce(applyEvent, [])
        expect(dayList).to.eql(expectedResult)
    })
    it('should update day menu list', () => {
        const dayList = events.reduce(applyEvent, [
            { date: '2017-10-30' },
            { date: '2017-10-29' },
            { date: '2017-10-28' },
        ])
        expect(dayList).to.eql([...expectedResult, { date: '2017-10-28' }])
    })
})
