import { ApplyEvent } from './events'
import { IDayMenu } from './model'

export const applyEvent: ApplyEvent<IDayMenu[]> = (state, event) => {
    switch (event.type) {
        case 'dinnerSelected': {
            const dayMenu: IDayMenu = {
                date: event.aggregateId,
                dinner: event.data,
            }
            const index = state.findIndex(d => d.date === event.aggregateId)
            if (index !== -1) {
                return state.map((day, i) => (i === index ? dayMenu : day))
            }
            return [...state, dayMenu]
        }
    }
    return state
}
