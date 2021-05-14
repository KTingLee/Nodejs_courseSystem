import httpStatus from 'http-status'
import UserDB from '../models/user.model'

function showIndex(req, res, next) {
  if (!req.session || !req.session.authenticated) {
    return res.redirect('/show/login')
  }

  // 從 session 中獲得使用者帳號、名稱以及是否為初始密碼
  const userID = req.session.userId
  const userName = req.session.username
  const initpassword = req.session.initpassword
  const grade = req.session.grade

  // 若為初始密碼，則仍無法讀取首頁，必須強制跳轉到更改密碼頁面
  if (initpassword) {
    res.redirect('/show/user/changePWD')
  } else {
    res.render('index', {
      nowPage: 'index',
      userID: userID,
      userName: userName,
      userGrade: grade
    })
  }
}

function showLogin(req, res, next) {
  return res.render("login", {})
}

function showAdminDashboard(req, res, next) {
  const isAjax = req.query.Ajax ? true : false

  res.render('admin/students/adminStudents', {
    AjaxImport: isAjax,
    page: 'students',
    level: 'admin'
  })
  return
}

function showAddStudent(req, res, next) {
  res.render('admin/students/adminStudentsAdd', {
    page: 'students',
    level: 'admin'
  })
  return
}

function showImportStudent(req, res, next) {
  res.render('admin/students/adminStudentsImport', {
    page: 'students',
    level: 'admin'
  })
  return
}

function showCourseDashboard(req, res, next) {
  res.render('admin/courses/adminCourses', {
    page: 'courses',
    level: 'admi'
  })
  return
}

function showImportCourses(req, res, next) {
  res.render('admin/courses/adminCoursesImport', {
    page: 'courses',
    level: 'admin'
  })
  return
}

function showAddCourses(req, res, next) {
  res.render('admin/courses/adminCoursesAdd', {
    page: 'courses',
    level: 'admin'
  })
  return
}

async function showUserChangePWD(req, res, next) {
  const userId = req.session.userId
  const username = req.session.username
  const initpassword = req.session.initpassword
  const grade = req.session.grade

  const user = await UserDB.findOne({ id: userId })
  if (!user) return res.redirect('/show/login')

  return res.render('changePWD', {
    nowPage: 'changePWD',
    userID: userId,
    userName: username,
    initpassword: initpassword,
    userGrade: grade,
    email: user.email
  })
}

async function showUserForgetPWD(req, res, next) {
  return res.render('forgetPWD')
}

async function showUserCourses(req, res, next) {
  const userId = req.session.userId
  const username = req.session.username
  const grade = req.session.grade
  
  return res.render('myCourses', {
      nowPage: 'myCourses',
      userID: userId,
      userName: username,
      userGrade: grade
  })
}

export default {
  showIndex,
  showLogin, 
  showAdminDashboard, 
  showAddStudent, 
  showImportStudent, 
  showCourseDashboard, 
  showImportCourses, 
  showAddCourses, 
  showUserChangePWD,
  showUserForgetPWD,
  showUserCourses,
}
