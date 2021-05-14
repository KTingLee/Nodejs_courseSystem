import { Router } from 'express'
import httpStatus from 'http-status'

import authRoutes from './auth.route'
import userRoutes from './user.route'
import courseRoutes from './course.route'
import dataRoutes from './data.route'

const debug = require('debug')('app:route:index')

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', checkAdmin, userRoutes)
router.use('/courses', checkAdmin, courseRoutes)
router.use('/data', checkAuth, dataRoutes)


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
