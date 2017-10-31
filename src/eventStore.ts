import { EventStore, DomainEvent } from './events'
import * as pgPromise from 'pg-promise'

export type CreateEventStore = (db: pgPromise.IDatabase<any>) => EventStore

const toEvent = (row: any): DomainEvent<any> => ({
    id: row.eventid.trim(),
    type: row.type.trim(),
    aggregateId: row.aggregid.trim(),
    entityId: row.entityid.trim(),
    data: row.data,
    userid: row.userid.trim(),
    datetime: row.stored,
})
export const createEventStore: CreateEventStore = db => {
    return {
        persist: async (events: DomainEvent<any>[]) => {
            const cols = [
                'EVENTID',
                'TYPE',
                'AGGREGID',
                'ENTITYID',
                'DATA',
                'USERID',
                'STORED',
                'NR',
            ]
            const sql = `INSERT into event (${cols.join(',')})
                values ${events
                    .map(
                        (_, i) =>
                            '(' +
                            cols
                                .map((_, j) => '$' + (i * cols.length + j + 1))
                                .join(',') +
                            ')'
                    )
                    .join(',')}
            `
            const rows = events.map((e, i) => [
                e.id,
                e.type,
                e.aggregateId,
                e.entityId,
                e.data,
                e.userid,
                e.datetime,
                i,
            ])
            await db.none(sql, [].concat.apply([], rows))
        },
        findByAggregateId: async (aggregateId: string) => {
            const res = await db.manyOrNone(
                'select * from event where aggregid=$1 order by stored, nr',
                [aggregateId]
            )
            return res.map(toEvent)
        },
        findBetween: async (aggregateFrom, aggregateTo, userId) => {
            const res = await db.manyOrNone(
                'select * from event where aggregid between $1 and $2 and userid=$3 order by stored, nr',
                [aggregateFrom, aggregateTo, userId]
            )
            return res.map(toEvent)
        },
        findAll: async (userId, entityId) => {
            const res = await db.manyOrNone(
                'select * from event where userid=$1 and entityid=$2 order by stored, nr',
                [userId, entityId]
            )
            return res.map(toEvent)
        },
    }
}
