import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/login')
  .get(ctrl.showLogin)

export default router
