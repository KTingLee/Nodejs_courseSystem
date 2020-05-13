/*
一般操作的模組
*/
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var xlsx = require("node-xlsx");
var url = require("url");
var mongoose = require("mongoose");
var Student = require("../models/Student.js");
var Course = require("../models/Course.js");
var crypto = require("crypto");

// 顯示 404 頁面
exports.show404 = function(req, res){
    res.send("404 你的網頁不存在")
}


// 顯示首頁
exports.showIndex = function(req, res){
    // 檢查使用者身上是否有 session，若沒有就跳轉至登入頁面
    if(req.session.login != true){
        // 重定向
        res.redirect("/login");
        return;
    }else{
        // 從 session 中獲得使用者帳號、名稱以及是否為初始密碼
        var userID   = req.session.userID;
        var userName = req.session.userName;
        var initpassword = req.session.initpassword;
        var grade = req.session.grade;

        // 若為初始密碼，則仍無法讀取首頁，必須強制跳轉到更改密碼頁面
        if(initpassword){
            res.redirect("/changePWD");
        }else{
            res.render("index", {
                "nowPage"  : "index",
                "userID"   : userID,
                "userName" : userName,
                "userGrade" : grade
            })
        }
    }
}

// 顯示登入頁面
exports.showLogin = function(req, res){
    res.render("login",{})
}

// 登入內容會以 post 方式提交，所以用 formidable 處理
// 先驗證帳號是否存在，若有，則檢查密碼是否為初始密碼(initPassword 為 true 表示為初始密碼)
// 初始密碼直接比對即可
// 若為使用者設定之密碼，則將表單的密碼做加密後，在與資料庫比對(因為資料庫只會放加密過的)
exports.doLogin = function(req, res){
    const form  = formidable({ multiples: true , keepExtensions: true});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器錯誤
            return;
        }
        var id  = fields.userID;
        var pwd = fields.userPassword;

        // 這邊應該可以放管理員密碼

        // 從學生資料庫檢查
        Student.find({"stu_id" : id}, function(err, results){
            if(err){
                res.json({"results" : -1});  // -1 表示伺服器錯誤
                return;
            }

            if(results.length == 0){
                res.json({"results" : -2});  // -2 表示沒有此學生
                return;
            }

            // 學生存在，則先檢查是否修改過密碼
            var thisStudent = results[0];
            var initpassword = thisStudent.initpassword;

            // 若為初始密碼，則直接比對
            if(initpassword){
                if(pwd === thisStudent.password){
                    // 密碼正確，下發一個 cookie 並保存其 session
                    req.session.login = true;
                    // 也可以再發其他東西至 session 中
                    req.session.userID = id;
                    req.session.userName = thisStudent.Name;
                    req.session.grade = thisStudent.grade;
                    req.session.initpassword = initpassword;
                    // 記得要先發完 cooki 後才 res.send 或 res.json
                    res.json({"results" : 1});
                    return;
                }
                res.json({"results" : -3});  // -3 表示密碼錯誤
                return;
            }else{
                // 若不為初始密碼，則要進行加密驗證
                var secretPWD = crypto.createHash("sha256").update(pwd).digest("hex");
                if(secretPWD === thisStudent.password){
                    // 密碼正確，下發一個 cookie 並保存其 session
                    req.session.login = true;
                    // 也可以再發其他東西至 session 中
                    req.session.userID = id;
                    req.session.userName = thisStudent.Name;
                    req.session.grade = thisStudent.grade;
                    req.session.initpassword = initpassword;
                    // 記得要先發完 cooki 後才 res.send 或 res.json
                    res.json({"results" : 1});
                    return;
                }
                res.json({"results" : -3});  // -3 表示密碼錯誤
                return;
            }
        })
    })
}


// 登出的方式就是將 session 拿掉
exports.doLogout = function(req, res){
    req.session.login = false;
    req.session.userID = '';

    res.redirect("/login")
    return;
}


// 顯示密碼更改頁面
exports.showChangePWD = function(req, res){
    var userID = req.session.userID;
    var userName = req.session.userName;
    var initpassword = req.session.initpassword;
    var grade = req.session.grade;

    // 抓取該學生的電子信箱
    Student.find({"stu_id" : userID}, function(err, results){
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器錯誤
            return;
        }

        if(results.length == 0){
            res.redirect("/login");
            return;
        }
        // 學生存在
        var thisStudent = results[0];

        // 渲染頁面
        res.render("changePWD",{
            "nowPage"  : "changePWD",
            "userID"   : userID,
            "userName" : userName,
            "initpassword" : initpassword,
            "userGrade" : grade,
            "email"     : thisStudent.email
        })
    })
}


// 修改密碼的話，前端會發送新的密碼表單，後端也驗證完兩者一致後，才寫入資料庫(記得要加密寫入！)
// session 本身就帶著學號了，所以前端不需要再傳遞學號過來
exports.doChangePWD = function(req, res){
    const form  = formidable({ multiples: true , keepExtensions: true});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器錯誤
            return;
        }
        var userID = req.session.userID;
        var pwd1  = fields.pwd1;
        var pwd2  = fields.pwd2;
        var email = fields.email;

        // 檢查電子信箱是否合格
        if( /.*@gmail\.com/.test(email) != true){
            res.json({"results" : -1});  // -4 表示電子信箱不合格
            return;
        }

        // 檢查密碼是否一致
        if(pwd1 === pwd2){
            Student.find({"stu_id" : userID}, function(err, data){
                if(err){
                    res.json({"results" : -1});  // -1 表示伺服器錯誤
                    return;
                }

                if(data.length == 0){
                    res.json({"results" : -2});  // -2 表示資料庫中沒有此帳號
                    return;
                }

                var thisStudent = data[0];
                // 對使用者輸入的密碼加密
                thisStudent.password = crypto.createHash("sha256").update(pwd1).digest("hex");
                // 將 initpassword 設置為 false，表示該使用者已經修改過密碼
                thisStudent.initpassword = false;
                // 將電子信箱寫入學生資料
                thisStudent.email = email;
                // 寫入資料庫
                thisStudent.save();

                // 改一下 session.initpassword
                req.session.initpassword = thisStudent.initpassword;

                res.json({"results" : 1});  // 1 表示修改成功
                return;
            })
        }else{
            res.json({"results" : -3});  // -3 表示密碼不一致
            return;
        }
    })
}

// 忘記密碼頁面
exports.forgetPWD = function(req, res){
    res.render("forgetPWD")
}

// 找回密碼，前端向後端發送 post 表單
exports.doForgetPWD = function(req, res){
    const form  = formidable({ multiples: true , keepExtensions: true});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"result" : -1});  // -1 表示伺服器錯誤
            return;
        }
        var fieldsEmail  = fields.email;
        var stu_id = fields.stu_id;

        // 從學生資料庫檢查
        Student.find({"stu_id" : stu_id}, function(err, results){
            if(err){
                res.json({"result" : -1});  // -1 表示伺服器錯誤
                return;
            }

            if(results.length == 0){
                res.json({"result" : -2});  // -2 表示沒有此學生
                return;
            }

            // 學生存在，驗證信箱是否正確
            var thisStudent = results[0];
            var email = thisStudent.email;

            // 若信箱正確，則改寫密碼，並把 initpassword 設為 true
            if(fieldsEmail == email){
                // 改寫學生資料
                thisStudent.initpassword = true;
                thisStudent.password = RandomPassword();
                thisStudent.save();

                // 向前端回傳結果
                res.json({"result" : thisStudent.password});
            }else{
                res.json({"result" : -3});  // -3 表示信箱錯誤
            }

        })
    })
}

// 隨機密碼生成函數
RandomPassword = function(){
    // 等等加密用的字元
    var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&%$#@!"
    var pwd = "";
    // 製作六位數密碼
    for(let m = 0; m < 6; m++){
        pwd += str.charAt(parseInt(str.length * Math.random()))
    }
    return pwd;
}

// 選課頁面必須提供課程能否報名(因為課程資訊已知，所以將針對個別學生，顯示各個課程對於他的狀態如何)
// 主要是想知道學生選的課程是星期幾，學生選課數量，課程剩餘人數
exports.checkCourses = function(req, res){
    // 記錄"對於某學生而言"，各個課程的狀態如何，變數為 json (k-v 類型)
    var coursesCondition = {};
    // 記錄學生所選課程是星期幾
    var occupyDay = [];

    // 尋找該學生，並獲得該學生選課資訊(這邊要對 studentSchema 新增一個屬性 myCourses)
    Student.find({"stu_id" : req.session.userID}, function(err, students){
        if(err){
            res.json("-1");  // -1 表示伺服器錯誤
            return;
        }
        var thisStudent = students[0];

        // 遍歷所有課程，因為搜索學生只能知道他選了甚麼課，遍歷課程是為了知道學生選的課程是在星期幾
        Course.find({}, function(err, courses){
            // 紀錄學生所選課程的上課日期
            courses.forEach(function(item, index){
                // 如果學生有選到該課程，就記錄這個課程的上課日期
                if(thisStudent.myCourses.indexOf(item.cid) != -1){
                    occupyDay.push(item.courseDay)
                }
            })

            // 再遍歷一次課程，將各個課程對於該學生的狀況寫上，並放入至 coursesCondition 矩陣中
            courses.forEach(function(item, index){
                // 學生已經選過該課程
                if(thisStudent.myCourses.indexOf(item.cid) != -1){
                    coursesCondition[item.cid] = "已選課程";
                }
                // 學生於該日已經選過課程(每日只能一門)
                else if(occupyDay.indexOf(item.courseDay) != -1){
                    coursesCondition[item.cid] = "每日只限一門";
                }
                // 該課程已達上限
                else if(item.member <= 0){
                    coursesCondition[item.cid] = "課程已達上限";
                }
                // 學生年級不符要求
                else if(item.allow.indexOf(thisStudent.grade) == -1){
                    coursesCondition[item.cid] = "年級不符";
                }
                // 學生所選課程已達上限(最多兩門課)
                else if(occupyDay.length == 2){
                    coursesCondition[item.cid] = "已達選課上限";
                }
                else {
                    coursesCondition[item.cid] = "報名";
                }
            })

            // 向前端回傳各個課程的狀態
            res.send(coursesCondition)
        })
    })
}


// 選修課程，前端會以 POST 傳送課程代碼，後端將會
// 在學生的 myCourses 中，新增該課程代碼；該課程的 myStudents 也會加上該學生
exports.getCourse = function(req, res){
    const form  = formidable({ multiples: true , keepExtensions: true});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器出錯
            return;
        }
        var cid = fields.cid;

        // 尋找學生
        Student.find({"stu_id" : req.session.userID}, function(err, students){
            if(err){
                res.json({"results" : -2});  // -2 表示資料庫
                return;
            }
            var thisStudent = students[0];
            console.log(thisStudent)

            // 在學生的課程清單中，加上課程代碼
            thisStudent.myCourses.push(cid);
            thisStudent.save(function(err){
                if(err){
                    res.json({"results" : -2});  // -2 表示資料庫
                    return;
                }

                // 尋找課程
                Course.find({"cid" : cid}, function(err, courses){
                    if(err){
                        res.json({"results" : -2});  // -2 表示資料庫
                        return;
                    }
                    var thisCourse = courses[0];

                    // 在課程的學生清單中，加上該學生，並減少課程人數
                    thisCourse.myStudents.push(req.session.userID);
                    thisCourse.member--;
                    thisCourse.save(function(err){
                        if(err){
                            console.log(err)
                            res.json({"results" : -2});  // -2 表示資料庫
                            return;
                        }
                        res.json({"results" : 1});
                    })
                })
            })
        })
    })
}


// 選修課程，前端會以 POST 傳送課程代碼，後端將會
// 在學生的 myCourses 中，去除該課程代碼；該課程的 myStudents 也會去除該學生
exports.dropCourse = function(req, res){
    const form  = formidable({ multiples: true , keepExtensions: true});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器出錯
            return;
        }
        var cid = fields.cid;

        // 尋找學生
        Student.find({"stu_id" : req.session.userID}, function(err, students){
            if(err){
                res.json({"results" : -2});  // -2 表示資料庫
                return;
            }
            var thisStudent = students[0];

            // 尋找學生的課程清單中，該課程的 index，再以 splice 移除之(第2個參數表示將移除的元素個數)
            console.log("移除前", thisStudent.myCourses)
            var index = thisStudent.myCourses.indexOf(cid);
            thisStudent.myCourses.splice(index, 1);
            console.log("移除後", thisStudent.myCourses)

            thisStudent.save(function(err){
                if(err){
                    res.json({"results" : -2});  // -2 表示資料庫
                    return;
                }

                // 尋找課程
                Course.find({"cid" : cid}, function(err, courses){
                    if(err){
                        res.json({"results" : -2});  // -2 表示資料庫
                        return;
                    }
                    var thisCourse = courses[0];

                    // 在課程的學生清單中，移除該學生，並補回課程人數
                    console.log("移除前", thisCourse.myStudents)
                    var index = thisCourse.myStudents.indexOf(req.session.userID);
                    thisCourse.myStudents.splice(index, 1);
                    console.log("移除後", thisStudent.myCourses)

                    thisCourse.member++;
                    thisCourse.save(function(err){
                        if(err){
                            res.json({"results" : -2});  // -2 表示資料庫
                            return;
                        }
                        res.json({"results" : 1});
                    })
                })
            })
        })
    })
}

// 顯示所選課程
exports.showMyCourses = function(req, res){
    var userID = req.session.userID;
    var userName = req.session.userName;
    var grade = req.session.grade;

    if(userID != undefined){
        res.render("myCourses", {
            "nowPage"  : "myCourses",
            "userID"   : userID,
            "userName" : userName,
            "userGrade" : grade
        });
    }else{
        res.redirect("/login");
    }
}

// 獲得該學生所選課程資料
exports.getMyCourses = function(req, res){
    // 從 session 中獲得學號
    var userID = req.session.userID;

    // 查詢學生數據庫，獲得學生選擇之課程代碼
    Student.find({"stu_id" : userID}, function(err, students){
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器錯誤
            return;
        }

        if(students.length == 0){
            res.json({"results" : -2});  // -2 表示查無此學生
            return;
        }

        // 獲得學生所選課程編號
        var thisStudent = students[0];
        var myCoursesId = thisStudent.myCourses;

        // 存放課程資訊
        var myCourses = [];

        // 查詢課程，以獲得所選課程資訊
        Course.find({"cid" : myCoursesId}, function(err, courses){
            if(err){
                res.json({"results" : -1});  // -1 表示伺服器錯誤
                return;
            }

            if(courses.length == 0){
                res.json({"results" : -2});  // -2 表示尚未選擇課程
                return;
            }

            // 遍歷課程資訊，只獲取課程名稱、簡介
            courses.forEach(function(item, index){
                courseInfo = {};
                courseInfo["cid"] = item.cid;
                courseInfo["Name"] = item.Name;
                courseInfo["courseDay"] = item.courseDay;
                courseInfo["teacher"] = item.teacher;
                courseInfo["intro"] = item.intro;
                myCourses.push(courseInfo);
            })

            res.json({"results" : myCourses});
            
        })

    })

}