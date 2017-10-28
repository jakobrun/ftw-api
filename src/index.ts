import { createApp } from './app'
import { addAuthentication } from './auth/facebook'
import * as pgPromise from 'pg-promise'

const db = pgPromise()(
    process.env.DATABASE_URL || process.env.FTW_DATABASE_URL || ''
)

createApp(db, addAuthentication).listen(process.env.PORT || 3000)
