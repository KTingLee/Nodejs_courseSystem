/*
超級使用者 - 學生頁面 的模組
*/

var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var xlsx = require("node-xlsx");
var Student = require("../../models/Student.js");
var url = require("url");
var dateFormat = require('dateformat');


// 超級使用者學生清單頁面(主頁面)
exports.showAdminStudents = function(req, res){
    // 分析學生清單的接口是 所有學生資料 還是 分批的學生資料
    var AjaxImport = '';
    if(url.parse(req.url, true).query.Ajax){
        AjaxImport = url.parse(req.url, true).query.Ajax;
    }else{
        AjaxImport = false;
    }
    res.render("admin/students/adminStudents", {
        // 分析是否為 Ajax 
        "AjaxImport" : AjaxImport,
        "page"  : "students",
        "level" : "admin"
    })
}

// 超級使用者學生清單頁面(導入學生頁面)
exports.showAdminStudentsImport = function(req, res){
    res.render("admin/students/adminStudentsImport", {
        "page"  : "students",
        "level" : "admin"
    })
}

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

// 超級使用者學生清單頁面的接口 (一口氣導出所有學生)
exports.showAdminAllStudents = function(req, res){
    Student.find({}, function(err, results){
        res.send(results)
    })
}

// 超級使用者學生清單頁面的接口 (依照前端請求的數量導出學生)
// 前端傳遞GET請求，路由例如 admin/students/partExport?_search=false&nd=1586593334266&rows=10&page=1&sidx=initpassword&sord=desc
// 解析此路由，以獲得對應的學生資料，再將其傳至 Ajax 接口
exports.showAdminPartStudents = function(req, res){
    // 解析GET請求
    var page = url.parse(req.url, true).query.page;  // 目前讀取的是第幾頁
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
                    {"stu_id" : regexp},
                    {"Name" : regexp},
                    {"grade" : regexp}
            ]
        }
    }

    // 若採用升冪排序，則 sordNumber 為 1
    var sordNumber = sord == 'asc' ? 1 : -1;

    // 因為不能確定以哪個 index 排序，所以建立一個 JSON 物件，並附上屬性
    var sordObj = {};
    sordObj[sidx] = sordNumber;

    // 依照前端要求，輸出對應的學生資料
    Student.count(findFilter, function(err, count){
        if(err){console.log(err)}
        var total = Math.ceil(count / rows);  // jqGrid 的總頁數(會根據 rows 而有所改變)

        // 輸出學生資料，格式必須依照 jqGrid 的 API 要求
        Student.find(findFilter).sort(sordObj).limit(parseInt(rows)).skip(rows * (page-1)).exec(function(err, results){
            res.json({
                "page"    : page,
                "total"   : total,
                "records" : count,
                "rows"    : results
            });
        });
    });
}

// 更新學生資料(學生清單頁面，修改後會發送 POST 請求，內含修改資料，在後端修改後，向前端發送修改結果)
// 因為是 POST 請求，所以用 formidable 解析
exports.updateStudent = function(req, res){
    // 獲得學生學號
    var stu_id = req.params.sid;
    
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        // 解析 POST 內容：cellName 與 value 是由學生清單頁面傳來的參數
        var key = fields.cellName;
        var value = fields.value;

        // 修改資料庫數據
        Student.find({"stu_id":stu_id}, function(err, results){
            if(err){
                res.send({"results": -2});  // 向前端回傳 -2 表示數據庫錯誤
                return;
            }
            if(results.length == 0){
                res.send({"results": -1});  // 向前端回傳 -1 表示資料庫沒有這筆資料
                return;
            }
            var thisStudent = results[0];
            thisStudent[key] = value;
            thisStudent.save(function(err){
                if(err){
                    res.send({"results": -2}); // 向前端回傳 -2 表示數據庫錯誤
                }else{
                    res.send({"results":  1}); // 向前端回傳 1 表示修改成功
                }
            })
        })
    })

}

// 增加學生頁面
exports.showAdminStudentsAdd = function(req, res){
    res.render("admin/students/adminStudentsAdd", {
        "page"  : "students",
        "level" : "admin"
    })
}

// 檢查學生是否存在
exports.checkStudentExist = function(req, res){
    // 獲得學生學號
    var stu_id = req.params.sid;
    
    // 從資料庫中尋找該學生
    Student.count({"stu_id":stu_id}, function(err, count){
        if(err){
            res.json({"results" : -1});   // -1 表示資料庫錯誤
        }else{
            res.json({"results" : count}); // 0 表示學號可使用
        }
    })
}

// 增加學生頁面 - 前端傳來學生資料，將其加入至資料庫
// 前端的驗證都是屁，後端一定要做驗證，但只要寫不合格的情況即可！
// 注意從資料庫中查詢的動作是異步語句，所以要嘛寫在最後，要嘛把其他驗證流程包住
exports.doAdminStudentsAdd = function(req, res){
    // 由前端提交的 post 表單獲取資料
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        if(err){
            res.json({"results" : -1});  // -1 表示伺服器出錯
            return;
        }
        var stu_id = fields.stu_id;
        var Name = fields.Name;
        var grade = fields.grade;
        var password = fields.password;

    /*--------------------驗證流程--------------------*/
        // 驗證學號是否合格
        if(!/^[\d]{8}$/.test(stu_id)){
            res.json({"results" : -2});  // -2 表示學號不合格
            return;
        }

        // 驗證名稱是否為空
        if(Name == ''){
            res.json({"results" : -3});  // -3 表示名稱為空
            return;
        }

        // 驗證年級是否未選擇
        if(grade == ''){
            res.json({"results" : -4});  // -4 表示年級尚未選擇
            return;
        }

        // 驗證初始密碼
        if(password == ''){
            res.json({"results" : -5});  // -5 表示初始密碼未設置
            return;
        }

        // 驗證學號是否重複(此為異步語句)
        Student.count({"stu_id":stu_id}, function(err, count){
            if(err){
                res.json({"results" : -1});  // -1 表示伺服器出錯
                return;
            }else if(count > 0){
                res.json({"results" : -6}); // -6 表示學號已重複
                return;
            }

            // 學號若可使用，則將該學生加入至資料庫
            var s = new Student({
                stu_id : fields.stu_id,
                Name   : fields.Name,
                grade  : fields.grade,
                password : fields.password
            });
            // 儲存至資料庫
            s.save(function(err){
                if(err){
                    console.log(err)
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
exports.deleteStudents = function(req, res){
    // 解析 post 資料
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        var stu_id = fields.arr;
        // 直接從資料庫刪除學生
        Student.remove({"stu_id" : stu_id}, function(err, results){
            if(err){
                res.json({"results" : -1});
                return;
            }
            res.json({"results" : results.deletedCount});

        })
    })
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
