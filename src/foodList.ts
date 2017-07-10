import { ApplyEvent } from './events'
import { Food } from './model'

export const applyEvent: ApplyEvent<Food[]> = (state, event) => {
    switch (event.type) {
        case 'foodAdded':
            return [...state, {
                id: event.aggregateId,
                name: event.data.name,
                active: true
            }]
        case 'foodRenamed':
            return state.map(f => {
                if(f.id === event.aggregateId) {
                    return {
                        ...f,
                        name: event.data.name
                    }
                }
                return f
            })
        case 'foodDeleted':
            return state.filter(f => f.id !== event.aggregateId)
    }
    return state
}