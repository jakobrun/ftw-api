import { createApp } from './app'
import { addAuthentication } from './auth/facebook'
import { addAuthentication as addDevAuth } from './auth/dev'
import * as pgPromise from 'pg-promise'

const db = pgPromise()(
    process.env.DATABASE_URL || process.env.FTW_DATABASE_URL || ''
)

const addAuth = process.env.FTW_FB_APP_ID ? addAuthentication : addDevAuth

createApp(db, addAuth).listen(process.env.PORT || 3000)
