import { createApp } from '../app'
import * as request from 'supertest'
import { expect } from 'chai'
import { db } from './db'
const app = createApp(db)

describe('app', () => {

    beforeEach(() => db.none('delete from event'))

    it('should add food', () => request(app)
        .post('/api/v1/food')
        .send({
            commands: [{
                type: 'addFood',
                aggregateId: '1',
                name: 'Pasta'
            }, {
                type: 'addFood',
                aggregateId: '2',
                name: 'Pizza'
            }]
        })
        .expect(200)
        .then(res => request(app)
            .get('/api/v1/food')
            .expect(200)
        ).then(res => {
            expect(res.body).to.eql([{
                id: '1',
                name: 'Pasta',
                active: true
            }, {
                id: '2',
                name: 'Pizza',
                active: true
            }])
        })
    )
})
