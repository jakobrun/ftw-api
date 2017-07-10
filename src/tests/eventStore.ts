import { DomainEvent, EventStore } from '../events'
import { createEventStore } from '../eventStore'
import { expect } from 'chai'
import * as pgPromise from 'pg-promise'

const connecionOptions = {
    database: 'ftw_test'
}
const db = pgPromise()(connecionOptions)

const store: EventStore = createEventStore(db)

describe('event store', () => {
    beforeEach(() => {
        return db.none('delete from event')
    })
    it('should store events', async () => {
        const events1: DomainEvent<any>[] = [{
            type: 'a',
            id: '1',
            aggregateId: '1',
            data: {
                name: 'test'
            },
            datetime: new Date(),
            userid: 'user1'
        }, {
            type: 'b',
            id: '2',
            aggregateId: '1',
            data: {},
            datetime: new Date(),
            userid: 'user1'
        }]
        const events2: DomainEvent<any>[] = [{
            type: 'a',
            id: '3',
            aggregateId: '2',
            data: {
                name: 'test'
            },
            datetime: new Date(),
            userid: 'user3'
        }, {
            type: 'b',
            id: '4',
            aggregateId: '2',
            data: {
                foo: 'bar'
            },
            datetime: new Date(),
            userid: 'user2'
        }]

        await store.persist(events1)
        await store.persist(events2)

        const e1 = await store.findByAggregateId('1')
        const e2 = await store.findByAggregateId('2')

        expect(e1).to.eql(events1)
        expect(e2).to.eql(events2)

    })
})