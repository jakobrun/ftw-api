export interface EventStore {
    findByAggregateId: (aggregateId: string) => Promise<DomainEvent<any>[]>
    findAll: (userId: string, entityId: string) => Promise<DomainEvent<any>[]>
    persist: (events: DomainEvent<any>[]) => Promise<void>
}

export interface DomainEvent<T> {
    type: string
    id: string
    aggregateId: string
    entityId: string
    data: T
    userid: string
    datetime: Date
}

export type ApplyEvent<T> = (state: T, event: DomainEvent<any>) => T
