import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param || err.path]: err.msg }));

  return next(new AppError(JSON.stringify(extractedErrors), 400));
};

export default validate;
