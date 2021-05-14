import express from 'express'
import {validate} from 'express-validation'
import paramValidation from '../validations/course.validation'
import ctrl from '../controllers/data.controller'

const router = express.Router()

router.route('/courses/:id')
  .delete(ctrl.dropCourse)

router.route('/courses')
  .get(ctrl.listCourseStatus)
  .post(ctrl.chooseCourse)

export default router
