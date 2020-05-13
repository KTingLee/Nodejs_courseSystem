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

// 管理員登入按鈕。檢查帳密是否為 root
exports.authLogin = function(req, res){
    const form  = formidable({ multiples: true , keepExtensions: true});
        form.parse(req, (err, fields, files) => {
            if(err){
                res.json({"results" : -1});  // -1 表示伺服器錯誤
                return;
            }

            var authID = fields.authID;
            var authPWD = fields.authPWD;

            // 利用傳統表單傳遞管理員帳密，可在後端重定向
            if(authID == "root" && authPWD == "root"){
                res.redirect("/admin");
                return;
            }
            // 利用 Ajax 發送 POST 請求，以傳遞管理員帳密，無法於後端重定向，故將重定向網址傳給前端(有暴露風險)
            else if(authID == "ajax" && authPWD == "ajax"){
                res.json({"results":"/admin"});
            }
            // 登入失敗
            else{
                res.json({"results" : -2});
            }
        })

    
}
