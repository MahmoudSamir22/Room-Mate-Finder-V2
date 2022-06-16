const multer  = require('multer')
const ApiError = require('../utils/apiError')

const multerOptions = () => {
    const multerStorage = multer.memoryStorage()
    const multerFilter = (req, file, cb) => {
        if(file.mimetype.startsWith("image")){
            cb(null, true)
        }else {
            cb(new ApiError('Images only supported', 400), false)
        }
    }
    const upload = multer({storage: multerStorage, fileFilter: multerFilter})
    return upload
}

exports.uploadSingleImage = (fieldName) =>  multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrOfFields) => multerOptions().array(arrOfFields, 10)