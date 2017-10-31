import { DomainEvent, EventStore } from '../events'
import { createEventStore } from '../eventStore'
import { expect } from 'chai'
import { db } from './db'
import { v4 as uuidv4 } from 'uuid'

const store: EventStore = createEventStore(db)

const createEvent = (event: Partial<DomainEvent<any>>) => ({
    type: 'a',
    id: uuidv4(),
    aggregateId: '1',
    entityId: 'foo',
    data: {
        name: 'test',
    },
    datetime: new Date(),
    userid: 'user1',
    ...event,
})

describe('event store', () => {
    beforeEach(() => db.none('delete from event'))

    it('should store events', async () => {
        const events1: DomainEvent<any>[] = [
            createEvent({
                type: 'a',
                aggregateId: '1',
            }),
            createEvent({
                type: 'b',
                aggregateId: '1',
            }),
        ]
        const events2: DomainEvent<any>[] = [
            createEvent({
                type: 'a',
                aggregateId: '2',
                userid: 'user3',
            }),
            createEvent({
                type: 'b',
                aggregateId: '2',
                userid: 'user2',
            }),
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

    it('should find between', async () => {
        const events1: DomainEvent<any>[] = [
            createEvent({
                aggregateId: '2017-03-29',
            }),
            createEvent({
                aggregateId: '2017-03-30',
            }),
            createEvent({
                aggregateId: '2017-03-31',
            }),
            createEvent({
                aggregateId: '2017-04-01',
            }),
            createEvent({
                aggregateId: '2017-04-02',
            }),
            createEvent({
                aggregateId: '2017-04-03',
            }),
        ]

        await store.persist(events1)

        const eventList = await store.findBetween(
            '2017-03-31',
            '2017-04-02',
            'user1'
        )

        expect(eventList.map(e => e.aggregateId)).to.eql([
            '2017-03-31',
            '2017-04-01',
            '2017-04-02',
        ])
    })
})
