const asyncHandler = require ('express-async-handler')
const multer  = require('multer')

const ApiError = require('../utils/apiError')
const Room = require('../models/roomModel')

exports.addRoom = asyncHandler(async (req, res) => {
    const room = await Room.create(req.body)
    await room.save()
    res.status(201).json({status: 'Success', data: room})
})

exports.getRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find()
    res.status(200).json({status: 'Success', result: rooms.length, data: rooms})
})

exports.getRoom = asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.id)
    if(!room){
        return next(new ApiError(`There is no room with this id: ${req.params.id}`, 404))
    }
    res.status(200).json({status: 'Success', data: room})
})

exports.updateRoom = asyncHandler(async (req, res, next) => {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {new: true})
    if(!room){
        return next(new ApiError(`There is no room with this id: ${req.params.id}`, 404))
    }
    res.status(200).json({status: 'Success', data: room})
})

exports.deleteRoom = asyncHandler(async (req, res , next) => {
    const room = await Room.findByIdAndDelete(req.params.id)
    if(!room){
        return next(new ApiError(`There is no room with this id: ${req.params.id}`, 404))
    }
    res.status(204).json()
})