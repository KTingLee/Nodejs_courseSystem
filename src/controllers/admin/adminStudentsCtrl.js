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


// 超級使用者學生清單頁面(導入學生頁面 - 上傳學生資料)
// 上傳檔案記得要設置 存放文件的資料夾
exports.uploadStudentsExcel = function(req, res){
    // 這邊直接保留副檔名，就不需要像之前還要用 path.extname() 過濾
    const form = formidable({ multiples: true , keepExtensions: true});
    form.uploadDir = "./uploads"

    form.parse(req, (err, fields, files) => {
        if(!files.studentExcel){
            res.send("請上傳文件！")
            return;
        };

        // 檢查檔案是否為 excel，仍採用 path.extname 過濾
        if(path.extname(files.studentExcel.name) != ".xlsx"){
            // 但此時已經上傳至 upload 文件夾，所以再將其刪除(fs.unlink(path, callback))
            // 記住，fs 是根據終端機執行時的路徑
            fs.unlink("./" + files.studentExcel.path, function(){
                res.send("錯誤格式之文件已刪除，請上傳 excel 檔案！請重新整理")
            })
            return;
        }

        // 讀取該 excel 表格(同步語句，沒有回呼函數)
        var studentsData = xlsx.parse("./" + files.studentExcel.path)
        // 檢查是否含有六個年級的 sheet
        if(studentsData.length != 6){
            res.send("你上傳的 Excel 檔案，sheet 數量不正確。請重新整理")
            return;
        };
        // 檢查資料格式是否正確 學號、姓名、性別
        for(let i = 0; i < 6; i++){
            if(studentsData[i].data[0][0] != "學號" || studentsData[i].data[0][1] != "姓名"){
                res.send("第" + (i+1) + "張 sheet 的第一列錯了，格式必須為 學號、姓名。請重新整理")
                return;
            };
        }

        // 至此，Excel 資料已通過驗證，接下來就是將資料加入至資料庫
        // 但這項行為應該是徹底覆寫資料庫
        Student.importStudents(studentsData, function(mes){
            if(mes != 1){
                res.send("上傳失敗，請檢查學生格式、筆數是否無誤！請重新整理");
            }else{
                res.send("上傳成功，學生資料庫已改寫！")
            }
        })
    });
}

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
