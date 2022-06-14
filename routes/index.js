const roomRouter = require('./room.routes')
const userRouter = require('./user.routes')

const mountRoutes = (app) => {
    app.use('/api/v1/rooms', roomRouter)
    app.use('/api/v1/users', userRouter)
}

module.exports = mountRoutes
