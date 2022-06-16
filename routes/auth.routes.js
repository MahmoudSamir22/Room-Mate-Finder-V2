const router = require('express').Router()

const {login, signUp} = require('../controllers/authController')

router.post('/signup', signUp)

router.post('/login', login)

module.exports = router