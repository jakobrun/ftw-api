import { AddAuthentication } from './types'
import * as passport from 'passport'
import { Strategy } from 'passport-facebook'
passport.use(
    new Strategy(
        {
            clientID: process.env.FTW_FB_APP_ID || 'test',
            clientSecret: process.env.FTW_FB_APP_SECRET || 'test',
            callbackURL: 'https://ftw-app.herokuapp.com/login/facebook/return',
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        (_accessToken, _refreshToken, profile, cb) => {
            return cb(null, profile)
        }
    )
)
passport.serializeUser((user, cb) => {
    cb(null, user)
})

passport.deserializeUser((obj, cb) => {
    cb(null, obj)
})

export const addAuthentication: AddAuthentication = app => {
    app.use(passport.initialize())
    app.use(passport.session())

    app.get(
        '/login/facebook',
        passport.authenticate('facebook', {
            scope: ['email'],
        })
    )
    app.get(
        '/login/facebook/return',
        passport.authenticate('facebook', {
            failureRedirect: '/login',
            scope: ['email'],
        }),
        (req, res) => res.json(req.user)
    )
}
