import httpStatus from 'http-status'
// import APIError from '../middlewares/errors/APIError'
import Model from '../models/user.model'

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


export default { get, load, }
