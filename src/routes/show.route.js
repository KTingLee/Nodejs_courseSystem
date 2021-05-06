import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/login')
  .get(ctrl.showLogin)

router.route('/admin')
  .get(ctrl.showAdminDashboard)

router.route('/admin/addStudents')
  .get(ctrl.showAddStudent)

export default router
