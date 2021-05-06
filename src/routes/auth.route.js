import express from 'express'
import {validate} from 'express-validation'
import paramValidation from '../validations/auth.validation'
import ctrl from '../controllers/auth.controller'

const router = express.Router()

router.route('/login')
  .post(ctrl.login)

router.route('/logout')
  .get(ctrl.logout)

// router.route('/passwd').post(validate(paramValidation.passwd), ctrl.passwd)

export default router
