import httpStatus from 'http-status'

function showIndex(req, res, next) {
  if (!req.session || !req.session.authenticated) {
    return res.redirect('/show/login')
  }

  // 從 session 中獲得使用者帳號、名稱以及是否為初始密碼
  const userID = req.session.userID;
  const userName = req.session.userName;
  const initpassword = req.session.initpassword;
  const grade = req.session.grade;

  // 若為初始密碼，則仍無法讀取首頁，必須強制跳轉到更改密碼頁面
  if (initpassword) {
    res.redirect('/changePWD');
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
  return res.render("login",{})
}


export default { showIndex, showLogin, }
