import { AddAuthentication } from './types'

export const john = {
    id: 'john',
    displayName: 'John',
}
export const lisa = {
    id: 'lisa',
    displayName: 'Lisa',
}

let currentUser = john

export const setUser = (user: any) => {
    currentUser = user
}
export const addAuthentication: AddAuthentication = app => {
    app.use((req, _, next) => {
        req.user = currentUser
        next()
    })
}
