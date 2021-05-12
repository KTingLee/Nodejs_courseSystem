/*
超級使用者 - 學生頁面 的模組
*/

var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var xlsx = require("node-xlsx");
var Student = require("../../models/user.model");
var url = require("url");
var dateFormat = require('dateformat');

// 下載學生資料(注意有使用迭代器)
// 先從資料庫撈學生資料，再轉成 Excel buffer，最後以 fs 生成檔案
exports.downloadStudents = function(req, res){
    // 用以生成 Excel 的矩陣
    var excelRes = [];
    var gradeArr = ["國一", "國二", "國三", "高一", "高二", "高三"];


    // 迭代器，用來取代迴圈，避免異步語句因迴圈產生的問題(別忘了要啟動)
    function iterator(i){
        // 迭代器終止條件
        if(i == 6){
            // 將 excelRes 的內容轉成 buffer
            var buffer = xlsx.build(excelRes);
            // 以 fs 生成 excel 檔案(同步語句)，在 public 文件夾中生成，就不需要再為檔案設置路由
            var fileName = dateFormat(new Date(), '學生資料yyyy年MM月dd日hhmmss');
            fs.writeFile("./public/excel/" + fileName + ".xlsx", buffer, function(err){
                // 對使用者連線重定向，直接指向該檔案，便會觸發瀏覽器下載(路徑寫路由)
                res.redirect("/excel/" + fileName + ".xlsx");
            })
            // 記得要加上這個 return，不然迭代器不會終止
            return;
        }

        // 先讀取資料庫(異步語句)
        Student.find({"grade" : gradeArr[i]}, function(err, results){
            // 各 sheet 的資料
            var sheetRes = [ ["學號", "姓名", "年級", "初始密碼"] ];
            // 遍歷 results，並提出所需資料，放入 sheetRes 中
            results.forEach(function(item){
                sheetRes.push([
                    item.stu_id,
                    item.Name,
                    item.grade,
                    item.password
                ])
            })

            // 放入 excelRes。  這邊請參考 xlsx 模組的寫入使用方法
            excelRes.push({"name" : gradeArr[i], data : sheetRes});

            // 進行下一輪
            iterator(++i);
        })
    }
    // 啟動迭代器！
    iterator(0);
}
