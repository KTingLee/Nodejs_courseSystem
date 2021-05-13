import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/')
  .get(ctrl.showAdminDashboard)

router.route('/addStudents')
  .get(ctrl.showAddStudent)

router.route('/importStudents')
  .get(ctrl.showImportStudent)

router.route('/courses')
  .get(ctrl.showCourseDashboard)

router.route('/importCourses')
  .get(ctrl.showImportCourses)

router.route('/addCourses')
  .get(ctrl.showAddCourses)

export default router
