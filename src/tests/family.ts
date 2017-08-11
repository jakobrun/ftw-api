import { applyCommand, applyEvent, nullState, User } from '../family'

import { createAssertCommand } from './assertCommands'

const member = {
    id: '987',
    name: 'Tester'
}

const user: User = {
    member: member,
    family: {
        id: '32784',
        members: [member]
    }
}

const assertCommands = createAssertCommand({ applyCommand, applyEvent, nullState, user })

describe('family', () => {
    it('should add family', () => assertCommands({
        before: [],
        commands: [{
            type: 'addFamily',
            aggregateId: '1',
            memberId: '123',
            memberName: 'Tina'
        }],
        after: [{
            id: '1',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'familyAdded',
            data: {
                memberId: '123',
                memberName: 'Tina'
            }
        }]
    }))
    it('should throw error when adding member to none family', () => assertCommands({
        before: [],
        commands: [{
            type: 'addMemberToFamily',
            aggregateId: '1',
            memberId: '124',
            memberName: 'Jimmy Hendrix'
        }],
        after: [],
        errorMessage: 'Missing family'
    }))
    it('should add member', () => assertCommands({
        before: [{
            id: '1',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'familyAdded',
            data: {
                memberId: '123',
                memberName: 'Tina'
            }
        }],
        commands: [{
            type: 'addMemberToFamily',
            aggregateId: '1',
            memberId: '124',
            memberName: 'Jimmy Hendrix'
        }],
        after: [{
            id: '124',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'memberAddedToFamily',
            data: {
                memberId: '124',
                memberName: 'Jimmy Hendrix'
            }
        }]
    }))
    it('should remove member', () => assertCommands({
        before: [{
            id: '1',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'familyAdded',
            data: {
                memberId: '123',
                memberName: 'Tina'
            }
        }, {
            id: '2',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'memberAddedToFamily',
            data: {
                memberId: '124',
                memberName: 'Jimmy Hendrix'
            }
        }],
        commands: [{
            type: 'removeMemberFromFamily',
            id: '3',
            aggregateId: '1',
            memberId: '124'
        }],
        after: [{
            id: '3',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'memberRemovedFromFamily',
            data: {
                memberId: '124'
            }
        }]
    }))
    it('should throw member removeing none member', () => assertCommands({
        before: [{
            id: '1',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'familyAdded',
            data: {
                memberId: '123',
                memberName: 'Tina'
            }
        }],
        commands: [{
            type: 'removeMemberFromFamily',
            id: '2',
            aggregateId: '1',
            memberId: '124'
        }],
        after: [],
        errorMessage: 'Member missing'
    }))
    it('should throw member removeing same member twice', () => assertCommands({
        before: [{
            id: '1',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'familyAdded',
            data: {
                memberId: '123',
                memberName: 'Tina'
            }
        }],
        commands: [{
            type: 'removeMemberFromFamily',
            id: '2',
            aggregateId: '1',
            memberId: '123'
        }, {
            type: 'removeMemberFromFamily',
            id: '3',
            aggregateId: '1',
            memberId: '123'
        }],
        after: [{
            id: '2',
            aggregateId: '1',
            userid: '',
            datetime: new Date(),
            type: 'memberRemovedFromFamily',
            data: {
                memberId: '123'
            }
        }],
        errorMessage: 'Member missing'
    }))
})
