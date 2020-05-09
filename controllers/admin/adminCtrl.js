/*
超級使用者 - 一般操作 有關的模組
*/

var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var xlsx = require("node-xlsx");
var Student = require("../../models/Student.js");
var url = require("url");
var dateFormat = require('dateformat');


// 超級使用者首頁 (路徑是相對 views)
exports.showAdmin = function(req, res){
    res.render("admin/index", {
        "page"  : "index",
        "level" : "admin"
    })
}


// 超級使用者課程管理頁面
exports.showAdminCourses = function(req, res){
    res.render("admin/course/adminCourse", {
        "page"  : "courses",
        "level" : "admin"
    })
}

// 超級使用者報表頁面
exports.showAdminReports = function(req, res){
    res.render("admin/report/adminReports", {
        "page"  : "reports",
        "level" : "admin"
    })
}


