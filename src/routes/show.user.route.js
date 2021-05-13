import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/changePWD')
  .get(ctrl.showUserChangePWD)

export default router