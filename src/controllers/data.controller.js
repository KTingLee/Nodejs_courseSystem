import httpStatus from 'http-status'
import CourseDB from '../models/course.model'
import UserDB from '../models/user.model'

const debug = require('debug')('app:ctrl:data')

// 依照不同的使用者，各課程顯示的狀態會不一樣
async function listCourseStatus(req, res, next) {
  const user = await UserDB.findOne({id: req.session.userId})
  const courses = await CourseDB.find({})

  // 紀錄學生所選課程的上課星期
  let days = []
  courses.forEach(course => {
    if (user.courses.includes(course.id)) {
      days.push(course.day)
    }
  })

  // 再遍歷一次課程，紀錄各個課程對於當前學生的狀況
  let coursesCondition = {}
  courses.forEach(course => {
    // 學生已經選過該課程
    if (user.courses.includes(course.id)) {
      coursesCondition[course.id] = "已選課程";
    }
    // 學生於該日已經選過課程(每日只能一門)
    else if (days.indexOf(course.courseDay) != -1) {
      coursesCondition[course.id] = "每日只限一門";
    }
    // 該課程已達上限
    else if (course.member <= 0) {
      coursesCondition[course.id] = "課程已達上限";
    }
    // 學生年級不符要求
    else if (course.allow.indexOf(user.grade) == -1) {
      coursesCondition[course.id] = "年級不符";
    }
    // 學生所選課程已達上限(最多兩門課)
    else if (days.length == 2) {
      coursesCondition[course.id] = "已達選課上限";
    }
    else {
      coursesCondition[course.id] = "報名";
    }
  })
  return res.send(coursesCondition)
}

export default { listCourseStatus, }