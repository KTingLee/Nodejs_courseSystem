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