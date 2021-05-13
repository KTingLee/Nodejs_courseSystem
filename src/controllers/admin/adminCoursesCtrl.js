/*
超級使用者 - 學生頁面 的模組
*/

var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var xlsx = require("node-xlsx");
var url = require("url");
var dateFormat = require('dateformat');
var Course = require("../../models/course.model")
var mongoose = require("mongoose");

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