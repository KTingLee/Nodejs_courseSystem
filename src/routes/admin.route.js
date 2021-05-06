import express from 'express'
import ctrl from '../controllers/show.controller'

const router = express.Router()

router.route('/')
  .get(ctrl.showAdminDashboard)

router.route('/addStudents')
  .get(ctrl.showAddStudent)

export default router
