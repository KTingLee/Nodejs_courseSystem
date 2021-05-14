import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/changePWD')
  .get(ctrl.showUserChangePWD)

router.route('/courses')
  .get(ctrl.showUserCourses)

export default router