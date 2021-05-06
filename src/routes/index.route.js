import { Router } from 'express'
import httpStatus from 'http-status'

import authRoutes from './auth.route'
import userRoutes from './user.route'

const debug = require('debug')('app:route:index')

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', checkAuth, userRoutes)


function checkAuth (req, res, next) {
  if (!req.session || !req.session.authenticated) {
    return res.status(httpStatus.UNAUTHORIZED).json({message: `Authentication error`})
  } else {
    next()
  }
}

export default router
