const { validationResult } = require("express-validator");

const {deleteImgsFromServer} = require('../utils/deleteImages')

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if(req.body.profileImg){
      deleteImgsFromServer(req.body, 'User')
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validatorMiddleware