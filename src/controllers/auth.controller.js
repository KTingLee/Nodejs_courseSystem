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

  const valid = Model.comparePassword(password, user.password)
  if (!valid) {
    return res.status(httpStatus.UNAUTHORIZED).json({message: 'id or password is not correct'})
  }

  req.session.authenticated = true
  req.session.userId = user.id
  req.session.username = user.username

  // 利用傳統表單傳遞管理員帳密，可在後端重定向
  if (type === 'traditional') {
    return res.redirect('/admin')
  }
  
  // 利用 Ajax，無法於後端重定向，故將重定向網址傳給前端(有暴露風險)
  return res.status(httpStatus.OK).json({status: 'ok', results: '/admin'})
}

function logout(req, res, next) {
  delete req.session.authenticated
  delete req.session.userId
  delete req.session.username

  return res.redirect('api/show/login')
}

module.exports = { login, logout }
