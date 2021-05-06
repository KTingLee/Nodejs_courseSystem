import debug from 'debug'
import httpStatus from 'http-status'
// import APIError from '../middlewares/errors/APIError'
import Model from '../models/user.model'

async function add (req, res, next) {
  const user = await Model.findOne({id: req.body.id})
  if (user) {
    return res.status(httpStatus.BAD_REQUEST).json({message: 'user already exist'})
  }

  try {
    await Model.create(req.body)
    return res.status(httpStatus.OK).json({data: 'ok'})
  } catch (e) {
    next(e)
  }
}

function get (req, res, next) {
  const obj = req.obj
  const user = {
    id: obj.id,
    username: obj.username,
    email: obj.email
  }
  return res.status(httpStatus.OK).json(user)
}

async function load (req, res, next, id) {
  try {
    const obj = await Model.findOne({id: id})
    if (!obj) {
      return res.status(httpStatus.NOT_FOUND).json({message: 'user id not exist'})
      // throw new APIError({status: httpStatus.NOT_FOUND, message: 'user id not exist'})
    }
    req.obj = obj
    next()
    return null
  } catch (e) {
    next(e)
  }
}

async function list (req, res, next) {
  const users = await Model.find({})
  return res.status(httpStatus.OK).json(users)
}

export default { get, load, add, list, }