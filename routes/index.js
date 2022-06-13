const roomRouter = require('./room.routes')


const mountRoutes = (app) => {
    app.use('/api/v1/rooms', roomRouter)
    
}

module.exports = mountRoutes
