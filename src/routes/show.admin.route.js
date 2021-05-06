import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/')
  .get(ctrl.showAdminDashboard)

router.route('/addStudents')
  .get(ctrl.showAddStudent)

router.route('/importStudents')
  .get(ctrl.showImportStudent)

export default router
