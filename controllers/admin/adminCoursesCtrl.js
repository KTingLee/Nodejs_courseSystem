/*
超級使用者 - 學生頁面 的模組
*/

var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var xlsx = require("node-xlsx");
var url = require("url");
var dateFormat = require('dateformat');
var Course = require("../../models/Course.js");
var mongoose = require("mongoose");


// 超級使用者課程清單頁面(主頁面)
exports.showAdminCourses = function(req, res){
    res.render('admin/courses/adminCourses',{
        "page"  : "courses",
        "level" : "admin"
    })
}

// 超級使用者課程清單頁面(導入課程頁面)
exports.showAdminCoursesImport = function(req, res){
    res.render("admin/courses/adminCoursesImport", {
        "page"  : "courses",
        "level" : "admin"
    })
}

// 超級使用者課程清單頁面(導入課程頁面 - 上傳課程資料)
// 上傳檔案記得要設置 存放文件的資料夾
exports.uploadCoursesJSON = function(req, res){
    // 這邊直接保留副檔名，就不需要像之前還要用 path.extname() 過濾
    const form = formidable({ multiples: true , keepExtensions: true});
    form.uploadDir = "./uploads"

    form.parse(req, (err, fields, files) => {
        if(err){
            res.send("伺服器錯誤");  // -1 表示伺服器錯誤
            return;
        }
        if(!files.coursesJSON){
            res.send("沒有上傳檔案");  // -2 表示沒有上傳檔案
            return;
        };

        // // 檢查檔案是否為 excel，仍採用 path.extname 過濾
        // if(path.extname(files.studentExcel.name) != ".xlsx"){
        //     // 但此時已經上傳至 upload 文件夾，所以再將其刪除(fs.unlink(path, callback))
        //     // 記住，fs 是根據終端機執行時的路徑
        //     fs.unlink("./" + files.studentExcel.path, function(){
        //         res.send("錯誤格式之文件已刪除，請上傳 excel 檔案！請重新整理")
        //     })
        //     return;
        // }

        // 讀取該 JSON 資料
        var filePath = files.coursesJSON.path
        fs.readFile('./' + filePath, function(err, results) {
            // 先清空資料庫
            mongoose.connection.collection("courses").drop(function(){
                // 插入資料庫
                var data = JSON.parse(results.toString()).course;  // 獲得課程矩陣
                Course.insertMany(data, function(err, r){
                    if(err){
                        res.send("伺服器錯誤");
                        return;
                    }
                    res.send("成功加入" + r.length + "門課程！");
                })
            })
        })
    });
}


// 課程清單接口，依照前端發送的請求，發送對應的課程資料
// 前端傳遞GET請求，路由例如 coursesData?_search=false&nd=1587007004897&rows=10&page=1&sidx=cid&sord=asc
// 解析此路由，以獲得對應的課程資料，再將其傳至 Ajax 接口
exports.showCourses = function(req, res){
    // 解析GET請求
    var page = url.parse(req.url, true).query.page; // 目前讀取的是第幾頁
    var rows = url.parse(req.url, true).query.rows; // 每頁要顯示幾筆資料
    var sidx = url.parse(req.url, true).query.sidx; // 以哪個 index 排序
    var sord = url.parse(req.url, true).query.sord; // 排序方式

    // 若有輸入快速查詢，則會放在 keyword 屬性中
    var keyword = url.parse(req.url, true).query.keyword; // 快速查詢字元
    if(keyword === undefined || keyword == ""){
        var findFilter = {};    
    }else{
        // 將快速查詢的結果轉成正規表達式物件，並做全局搜索，意即 /keyword/g  (其中 keyword 是網址列中的參數)
        var regexp = new RegExp(keyword, "g");

        // 製作搜尋格式，待會會放在 find()、count() 中
        var findFilter = {
            $or : [
                    {"cid"       : regexp},
                    {"Name"      : regexp},
                    {"allow"     : regexp},
                    {"courseDay" : regexp},
                    {"teacher"   : regexp},
                    {"intro"     : regexp}
            ]
        }
    }

    // 若採用升冪排序，則 sordNumber 為 1
    var sordNumber = sord == 'asc' ? 1 : -1;

    // 因為不能確定以哪個 index 排序，所以建立一個 JSON 物件，並附上屬性
    var sordObj = {};
    sordObj[sidx] = sordNumber;

    // 依照前端要求，輸出對應的學生資料
    Course.count(findFilter, function(err, count){
        if(err){console.log(err)}
        var total = Math.ceil(count / rows);  // jqGrid 的總頁數(會根據 rows 而有所改變)

        // 輸出學生資料，格式必須依照 jqGrid 的 API 要求
        Course.find(findFilter).sort(sordObj).limit(parseInt(rows)).skip(rows * (page-1)).exec(function(err, results){
            res.json({
                "page"    : page,
                "total"   : total,
                "records" : count,
                "rows"    : results
            });
        });
    });
}

// 更新課程資料(課程清單頁面，修改後會發送 POST 請求，內含修改資料，在後端修改後，向前端發送修改結果)
// 因為是 POST 請求，所以用 formidable 解析
exports.updateCourse = function(req, res){   
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        // 因為課程頁面的修改是採用 row 修改，所以傳過來是所有欄位的資料，而不項學生是各別 cell 的資料
        // 直接從表單獲得課程編號
        var cid = fields.cid;

        // 修改資料庫數據
        Course.find({"cid":cid}, function(err, results){
            if(err){
                res.send({"results": -2});  // 向前端回傳 -2 表示數據庫錯誤
                return;
            }
            if(results.length == 0){
                res.send({"results": -1});  // 向前端回傳 -1 表示資料庫沒有這筆資料
                return;
            }
            var thisCourse = results[0];
            thisCourse.Name      = fields.Name;
            thisCourse.courseDay = fields.courseDay;
            thisCourse.teacher   = fields.teacher;
            thisCourse.member    = fields.member;
            thisCourse.intro     = fields.intro;
            thisCourse.allow     = fields.allow.split(",");  // 因為前端傳來是字串，但後端要存成矩陣
            thisCourse.save(function(err){
                if(err){
                    res.send({"results": -2}); // 向前端回傳 -2 表示數據庫錯誤
                }else{
                    res.send({"results":  1}); // 向前端回傳 1 表示修改成功
                }
            })
        })
    })
}



exports.showAdminCoursesAdd = function(req, res){
    res.render("admin/courses/adminCoursesAdd", {
        "page"  : "courses",
        "level" : "admin"
    })
}


// 檢查課程是否存在
exports.checkCourseExist = function(req, res){
    // 獲得學生學號
    var cid = req.params.cid;
    
    // 從資料庫中尋找該課程
    Course.count({"cid":cid}, function(err, count){
        if(err){
            res.json({"results" : -1});   // -1 表示資料庫錯誤
        }else{
            res.json({"results" : count}); // 0 表示學號可使用
        }
    })
}

// 前端發送 ajax (且為 POST 請求)，所以用 formidable 解析之
// 在後端也會做基本檢驗，檢驗通過與否都會回傳訊息給前端，若成功亦會加入資料庫
exports.doAdminCoursesAdd = function(req, res){
    // 由前端提交的 post 表單獲取資料
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器出錯
            return;
        }

        // 解析資料
        var cid       = fields.cid
        var Name      = fields.Name
        var courseDay = fields.courseDay
        var teacher   = fields.teacher
        var member    = fields.member
        var intro     = fields.intro
        var allow     = fields.allow

    /*--------------------驗證流程--------------------*/

        // 驗證資料是否有空值
        for(let k in fields){
            if(fields.k == ""){
                res.json({"results" : -2});  // -2 表示有資料為空
                return;
            }
        }

        // 驗證選課人數是否大於等於 10 人
        if(member < 10){
            res.json({"results" : -3});  // -3 表示選課人數不足
            return;
        }


        // 驗證課程是否重複(此為異步語句)
        Course.count({"cid":cid}, function(err, count){
            if(err){
                res.json({"results" : -1});  // -1 表示伺服器出錯
                return;
            }else if(count > 0){
                res.json({"results" : -4}); // -4 表示學號已重複
                return;
            }

            // 課程編號若可使用，則將該課程加入至資料庫
            var c = new Course({
                "cid"       : cid,
                "Name"      : Name,
                "courseDay" : courseDay,
                "teacher"   : teacher,
                "member"    : member,
                "intro"     : intro,
                "allow"     : allow
            });
            // 儲存至資料庫
            c.save(function(err){
                if(err){
                    res.json({"results" : -1});  // -1 表示伺服器出錯
                    return;
                }
                    res.json({"results" : 1}); // 1 表示成功儲存
            })
        })
    })
}


// 前端發送 delete 請求，並將欲刪除對象之資料放在 post 表單
// 一樣以 formidable 解析 post 表單，再刪除資料庫中的資料
exports.deleteCourses = function(req, res){
    // 解析 post 資料
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        var cid = fields.arr;
        // 直接從資料庫刪除學生
        Course.remove({"cid" : cid}, function(err, results){
            if(err){
                res.json({"results" : -1});
                return;
            }
            res.json({"results" : results.deletedCount});

        })
    })
}