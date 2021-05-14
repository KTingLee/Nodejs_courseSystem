import httpStatus from 'http-status'
import Model from '../models/user.model'

async function login(req, res, next) {

  const userId = req.body.userId
  const password = req.body.password
  const type = req.body.type

  const user = await Model.findOne({id: userId})
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({message: 'user not found'})
  }

  const valid = (user.initpassword) ? password === user.password : Model.comparePassword(password, user.password)
  if (!valid) {
    return res.status(httpStatus.UNAUTHORIZED).json({message: 'id or password is not correct'})
  }

  req.session.authenticated = true
  req.session.userId = user.id
  req.session.username = user.username
  req.session.role = user.role

  if (user.role === 'student') {
    req.session.grade = user.grade
    req.session.initpassword = user.initpassword
    return res.status(httpStatus.OK).json({status: 'ok', results: '/'})
  }

  // 利用傳統表單傳遞管理員帳密，可在後端重定向
  if (type === 'traditional') {
    return res.redirect('/show/admin')
  }
  
  // 利用 Ajax，無法於後端重定向，故將重定向網址傳給前端(有暴露風險)
  return res.status(httpStatus.OK).json({status: 'ok', results: '/show/admin'})
}

function logout(req, res, next) {
  delete req.session.authenticated
  delete req.session.userId
  delete req.session.username

  return res.redirect('/show/login')
}

async function changePWD(req, res, next) {
  const userId = req.session.userId
  const email = req.body.email
  const pwd1  = req.body.pwd1
  const pwd2  = req.body.pwd2

  if (pwd1 !== pwd2) return res.status(httpStatus.BAD_REQUEST).json({message: 'passwaord is not identical'})
  
  try {
    let user = await Model.findOne({id: userId})
    user.email = email ? email : ''
    if (pwd1) {
      user.initpassword = false
      user.password = pwd1 ? pwd1 : user.password
      user.markModified('password')
      req.session.initpassword = user.initpassword
    }
    
    await user.save()
    return res.status(httpStatus.OK).json({data: 'ok'})
  } catch(e) {
    next(e)
  }
}

async function forgetPWD(req, res, next) {
  const email  = req.body.email
  const userId = req.body.id

  let user = await Model.findOne({id: userId})
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({message: 'user not found'})
  }

  try {
    const password = Model.initPassword()
    if (email === user.email) {
      user.initpassword = true
      user.password = password
      await user.save()
    }
    return res.status(httpStatus.OK).json({data: 'ok', message: password})
  } catch(e) {
    next(e)
  }
}

module.exports = { login, logout, changePWD, forgetPWD, }
