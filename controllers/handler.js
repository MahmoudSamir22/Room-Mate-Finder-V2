const asyncHandler = require("express-async-handler");

const {deleteImgsFromServer} = require('../utils/deleteImages')
const ApiFeatures = require("../utils/apiFeatures");


exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    const countDocuments = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(), req.query)
      .sort()
      .limitFields()
      .paginate(countDocuments)
      .filtering()
      .search();
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res.status(200).json({
      paginationResult,
      result: documents.length,
      data: documents,
    });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(`There is no document with this id: ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ status: "Success", data: document });
  });

exports.deleteOne = (Model, modelName = "") =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new ApiError(`There is no document with this id: ${req.params.id}`, 404)
      );
    }
    deleteImgsFromServer(document, modelName)
    res.status(204).json();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new ApiError(`There is no document with this id: ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ status: "Success", data: document });
  });
