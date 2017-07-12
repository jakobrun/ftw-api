import { createApp } from './app'
import * as pgPromise from 'pg-promise'

const connecionOptions = {
    database: 'ftw'
}
const db = pgPromise()(connecionOptions)

createApp(db).listen(3000)