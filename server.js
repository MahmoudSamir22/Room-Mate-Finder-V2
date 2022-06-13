const path = require("path");

const express = require('express');
require('dotenv').config({path: './config.env'})
const cors = require ('cors')

const mountRoutes = require('./routes/index')
const globalError = require('./middleware/errorsMiddleware')
const dbConnection = require('./database/dbConnection')

dbConnection()

const app = express();

// Enable other domains to access your application
app.use(cors())
app.options('*', cors())

app.use(express.json({limit: '20kb'}));
app.use(express.static(path.join(__dirname, 'uploads')))

mountRoutes(app)

//Global error handling middleware
app.use(globalError);

app.listen(process.env.PORT, () => {
    console.log(`Application listening on port: ${process.env.PORT}`);
})