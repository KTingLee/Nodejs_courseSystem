import express from 'express'
import httpStatus from 'http-status'
import ctrl from '../controllers/show.controller'
import adminRoutes from './show.admin.route'
import userRoutes from './show.user.route'

const router = express.Router()

router.use('/admin', checkAdmin, adminRoutes)
router.use('/user', checkAuth, userRoutes)

router.route('/login')
  .get(ctrl.showLogin)

router.route('/forgetPWD')
  .get(ctrl.showUserForgetPWD)

function checkAdmin (req, res, next) {
  if (!req.session || !req.session.authenticated || req.session.role !== 'admin') {
    return res.status(httpStatus.UNAUTHORIZED).json({message: `Authentication error`})
  } else {
    next()
  }
}

function checkAuth (req, res, next) {
  if (!req.session || !req.session.authenticated) {
    return res.status(httpStatus.UNAUTHORIZED).json({message: `Authentication error`})
  } else {
    next()
  }
}

export default router
