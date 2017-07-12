import * as pgPromise from 'pg-promise'

const connecionOptions = {
    database: 'ftw_test'
}
export const db = pgPromise()(connecionOptions)
