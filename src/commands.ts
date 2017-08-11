import { DomainEvent, ApplyEvent, EventStore } from './events'
export type ApplyCommand<S, C> = (user: any, state: S, command: C) => Promise<DomainEvent<any>[]>

export interface EventModel<S, C> {
    applyCommand: ApplyCommand<S, C>
    applyEvent: ApplyEvent<any>
    user: any
    nullState: S
}


export const applyCommandsForAggregate = async <S, C>(model: EventModel<S, C>, eventStore: EventStore, aggreateId: string, commands: C[]) => {
        const events = await eventStore.findByAggregateId(aggreateId)
        const initState = events.reduce(model.applyEvent, model.nullState)
        await commands.reduce(async (statePromise, command) => {
            const state = await statePromise
            const events = await model.applyCommand(model.user, state, command)
            const newState = events.reduce(model.applyEvent, state)
            await eventStore.persist(events)
            return newState
        }, Promise.resolve(initState))

    }
