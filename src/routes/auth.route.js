import express from 'express'
import {validate} from 'express-validation'
import paramValidation from '../validations/auth.validation'
import ctrl from '../controllers/auth.controller'

const router = express.Router()

router.route('/login')
  .post(ctrl.login)

router.route('/logout')
  .get(ctrl.logout)

router.route('/changePWD')
  .post(ctrl.changePWD)

router.route('/forgetPWD')
  .post(ctrl.forgetPWD)

export default router
