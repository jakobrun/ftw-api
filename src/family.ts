import { DomainEvent, ApplyEvent } from './events'

export interface User {
    name: string
    id: string
}

export interface Family {
    id: string
    members: User[]
}

export const nullState: Family = {
    id: '',
    members: []
}

export interface AddFamilyCommand {
    type: 'addFamily'
    aggregateId: string
    memberId: string
    memberName: string
}


export interface AddMemberToFamilyCommand {
    type: 'addMemberToFamily'
    aggregateId: string
    memberId: string
    memberName: string
}

export interface RemoveMemberFromFamilyCommand {
    type: 'removeMemberFromFamily'
    id: string
    aggregateId: string
    memberId: string
}

export type Command = AddFamilyCommand | AddMemberToFamilyCommand | RemoveMemberFromFamilyCommand

export type ApplyFamilyCommand = (state: Family, commands: Command) => Promise<DomainEvent<any>[]>

export const applyCommand: ApplyFamilyCommand = (state, command) => {
    switch (command.type) {
        case 'addFamily':
            return Promise.resolve([{
                id: command.aggregateId,
                aggregateId: command.aggregateId,
                userid: '',
                datetime: new Date(),
                type: 'familyAdded',
                data: {
                    memberId: command.memberId,
                    memberName: command.memberName
                }
            }])
        case 'addMemberToFamily':
            if(state.id !== command.aggregateId) {
                return Promise.reject(new Error('Missing family'))
            }
            return Promise.resolve([{
                id: command.memberId,
                aggregateId: command.aggregateId,
                userid: '',
                datetime: new Date(),
                type: 'memberAddedToFamily',
                data: {
                    memberId: command.memberId,
                    memberName: command.memberName
                }
            }])
        case 'removeMemberFromFamily':
            if(!state.members.some(m => m.id === command.memberId)) {
                return Promise.reject(new Error('Member missing'))
            }
            return Promise.resolve([{
                id: command.id,
                aggregateId: command.aggregateId,
                userid: '',
                datetime: new Date(),
                type: 'memberRemovedFromFamily',
                data: {
                    memberId: command.memberId
                }
            }])
    }
}

export const applyEvent: ApplyEvent<Family> = (state, event) => {
    switch (event.type) {
        case 'familyAdded':
            return {
                id: event.aggregateId,
                members: [{
                    id: event.data.memberId,
                    name: event.data.memberName
                }]
            }
        case 'memberAddedToFamily':
            return {
                ...state,
                members: [...state.members, {
                    id: event.data.memberId,
                    name: event.data.memberName
                }]
            }
        case 'memberRemovedFromFamily':
            return {
                ...state,
                members: state.members.filter(m => m.id !== event.data.memberId)
            }
    }
    return state
}
