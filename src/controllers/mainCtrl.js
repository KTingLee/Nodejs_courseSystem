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
var Course = require("../models/course.model");
var crypto = require("crypto");

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