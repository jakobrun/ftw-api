import { DomainEvent, EventStore } from '../events'
import { createEventStore } from '../eventStore'
import { expect } from 'chai'
import { db } from './db'

const store: EventStore = createEventStore(db)

describe('event store', () => {
    beforeEach(() => db.none('delete from event'))

    it('should store events', async () => {
        const events1: DomainEvent<any>[] = [
            {
                type: 'a',
                id: '1',
                aggregateId: '1',
                entityId: 'foo',
                data: {
                    name: 'test',
                },
                datetime: new Date(),
                userid: 'user1',
            },
            {
                type: 'b',
                id: '2',
                entityId: 'foo',
                aggregateId: '1',
                data: {},
                datetime: new Date(),
                userid: 'user1',
            },
        ]
        const events2: DomainEvent<any>[] = [
            {
                type: 'a',
                id: '3',
                aggregateId: '2',
                entityId: 'foo',
                data: {
                    name: 'test',
                },
                datetime: new Date(),
                userid: 'user3',
            },
            {
                type: 'b',
                id: '4',
                aggregateId: '2',
                entityId: 'foo',
                data: {
                    foo: 'bar',
                },
                datetime: new Date(),
                userid: 'user2',
            },
        ]

        await store.persist(events1)
        await store.persist(events2)

        const e1 = await store.findByAggregateId('1')
        const e2 = await store.findByAggregateId('2')

        expect(e1).to.eql(events1)
        expect(e2).to.eql(events2)
    })

    it('should return empty array if no events found', async () => {
        const e = await store.findByAggregateId('1')
        expect(e).to.eql([])
    })
})
