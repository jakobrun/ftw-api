import { Food, Event } from './model'
export type ApplyEvent = (state: Food[], event:Event<any>) => Food[]

export const applyEvent: ApplyEvent = (state, event) => {
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