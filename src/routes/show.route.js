import express from 'express'
import ctrl from '../controllers/show.controller'
import adminRoutes from './show.admin.route'

const router = express.Router()

router.use('/admin', adminRoutes)

router.route('/login')
  .get(ctrl.showLogin)

export default router
