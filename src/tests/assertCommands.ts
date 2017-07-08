import { expect } from 'chai'
import { Event, Command, ApplyCommand, ApplyEvents, Food, nullState } from '../model'

export interface EventModel {
    applyCommand: ApplyCommand
    applyEvents: ApplyEvents
}
export interface AssertCommandParams {
    before: Event<any>[]
    commands: Command[]
    after: Event<any>[]
}

export type AssertCommand = (params: AssertCommandParams) => Promise<void>

const datetime = new Date()
const synchDatetime = (arr: Event<any>[]) => arr.map(e => {
    e.datetime = datetime
    return e
})
export const createAssertCommand = (model: EventModel): AssertCommand => {
    return async (params) => {
        const state = model.applyEvents(nullState, params.before)
        const newEvents: Event<any>[] = []
        await params.commands.reduce(async (statePromise, command) => {
            const evt = await model.applyCommand(await statePromise, command)
            evt.map(e => newEvents.push(e))
            return model.applyEvents(state, evt);
        }, Promise.resolve(state))
        expect(synchDatetime(newEvents)).to.eql(synchDatetime(params.after))
    }
}