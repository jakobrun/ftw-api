import { expect } from 'chai'
import { DomainEvent, ApplyEvent } from '../events'
import { Command, ApplyCommand, Food, nullState } from '../model'

export interface EventModel {
    applyCommand: ApplyCommand
    applyEvent: ApplyEvent<Food>
}
export interface AssertCommandParams {
    before: DomainEvent<any>[]
    commands: Command[]
    after: DomainEvent<any>[]
}

export type AssertCommand = (params: AssertCommandParams) => Promise<void>

const datetime = new Date()
const synchDatetime = (arr: DomainEvent<any>[]) => arr.map(e => {
    e.datetime = datetime
    return e
})
export const createAssertCommand = (model: EventModel): AssertCommand => {
    return async (params) => {
        const state = params.before.reduce(model.applyEvent, nullState)
        const newEvents: DomainEvent<any>[] = []
        await params.commands.reduce(async (statePromise, command) => {
            const evt = await model.applyCommand(await statePromise, command)
            evt.map(e => newEvents.push(e))
            return evt.reduce(model.applyEvent, state)
        }, Promise.resolve(state))
        expect(synchDatetime(newEvents)).to.eql(synchDatetime(params.after))
    }
}