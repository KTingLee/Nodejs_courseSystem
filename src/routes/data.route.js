import express from 'express'
import {validate} from 'express-validation'
import paramValidation from '../validations/course.validation'
import ctrl from '../controllers/data.controller'

const router = express.Router()

router.route('/courseStatus')
  .get(ctrl.listCourseStatus)

export default router
