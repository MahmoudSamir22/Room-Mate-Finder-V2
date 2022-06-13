const asyncHandler = require ('express-async-handler')
const multer  = require('multer')

const Room = require('../models/roomModel')

exports.addRoom = asyncHandler(async (req, res) => {
    const room = await Room.create(req.body)
    res.status(201).json({data: room})
})