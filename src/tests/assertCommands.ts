import { expect } from 'chai'
import { EventModel } from '../commands'
import { DomainEvent, ApplyEvent } from '../events'

export interface AssertCommandParams<C> {
    before: DomainEvent<any>[]
    commands: C[]
    after: DomainEvent<any>[]
    errorMessage?: string
}

export type AssertCommand<C> = (params: AssertCommandParams<C>) => Promise<void>

const datetime = new Date()
const synchDatetime = (arr: DomainEvent<any>[]) => arr.map(e => {
    e.datetime = datetime
    return e
})
export const createAssertCommand = <S, C>(model: EventModel<S, C>): AssertCommand<C> => {
    return async (params) => {
        const state = params.before.reduce(model.applyEvent, model.nullState)
        const newEvents: DomainEvent<any>[] = []
        let errorMessage
        try {
            await params.commands.reduce(async (statePromise, command) => {
                const currentState = await statePromise
                const evt = await model.applyCommand(model.user, currentState, command)
                evt.map(e => newEvents.push(e))
                return evt.reduce(model.applyEvent, currentState)
            }, Promise.resolve(state))
        } catch (err) {
            errorMessage = err.message
        }
        expect(synchDatetime(newEvents)).to.eql(synchDatetime(params.after))
        expect(params.errorMessage).to.eq(errorMessage)
    }
}