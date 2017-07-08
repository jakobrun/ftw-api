import * as express from 'express'
const app = express()

const api = express.Router()
api.get('/foodlist', (_req: any, res: express.Response) => {
    res.json([{
        name: 'Tortilla',
        description: ''
    }, {
        name: 'Pasta',
        description: ''
    }])
})

app.use('/api/v1', api)

app.listen(3000)