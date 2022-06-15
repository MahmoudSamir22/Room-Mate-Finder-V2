const roomRouter = require('./room.routes')
const userRouter = require('./user.routes')
const authRouter = require('./auth.routes')


const mountRoutes = (app) => {
    app.use('/api/v1/rooms', roomRouter)
    app.use('/api/v1/users', userRouter)
    app.use('/api/v1/auth', authRouter)
}

module.exports = mountRoutes
