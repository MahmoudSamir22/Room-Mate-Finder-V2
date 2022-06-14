const asyncHandler = require ('express-async-handler')

const User = require('../models/userModel')

exports.addUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body)
    await user.save()
    res.status(201).json({data: user})
})

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
    res.status(200).json({status: 'Success', result: users.length, data: users})
})

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ApiError(`There is no user with this id: ${req.params.id}`, 404))
    }
    res.status(200).json({status: 'Success', data: user})
})

exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
    if(!user){
        return next(new ApiError(`There is no user with this id: ${req.params.id}`, 404))
    }
    res.status(200).json({status: 'Success', data: user})
})

exports.deleteUser = asyncHandler(async (req, res , next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user){
        return next(new ApiError(`There is no user with this id: ${req.params.id}`, 404))
    }
    res.status(204).json()
})