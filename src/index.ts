import { createApp } from './app'
import * as pgPromise from 'pg-promise'

const db = pgPromise()(process.env.DATABASE_URL || process.env.FTW_DATABASE_URL || '')

createApp(db).listen(3000)