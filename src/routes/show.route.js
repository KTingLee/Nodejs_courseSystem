import express from 'express'
import httpStatus from 'http-status'
import ctrl from '../controllers/show.controller'
import adminRoutes from './show.admin.route'

const router = express.Router()

router.use('/admin', checkAdmin, adminRoutes)

router.route('/login')
  .get(ctrl.showLogin)

function checkAdmin (req, res, next) {
  if (!req.session || !req.session.authenticated || req.session.role !== 'admin') {
    return res.status(httpStatus.UNAUTHORIZED).json({message: `Authentication error`})
  } else {
    next()
  }
}

export default router
