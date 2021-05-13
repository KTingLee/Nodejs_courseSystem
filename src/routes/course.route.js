import multer from 'multer'
import express from 'express'
import {validate} from 'express-validation'
import paramValidation from '../validations/course.validation'
import ctrl from '../controllers/course.controller'

const router = express.Router()
const upload = multer({ dest: `${__dirname}/../storage` })

router.route('/')
  // .get(ctrl.list)
  .post(ctrl.add)

// router.route('/import')
//   .post(upload.single('file'), ctrl.importUsers)

// router.route('/download')
//   .get(ctrl.downloadUsers)

router.route('/:id')
  .get(ctrl.get)
//   .put(ctrl.set)
//   .delete(ctrl.del)

router.param('id', ctrl.load)

export default router
