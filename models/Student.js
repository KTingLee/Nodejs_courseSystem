/*
資料庫模組 - 操作學生集合
*/

var mongoose = require("mongoose");

// 建立 學生Student類別 的 Schema
var studentSchema = new mongoose.Schema({
    "stu_id"   : String,
    "Name"     : String,
    "grade"    : String,   // 學生的年級，1, 2, 3 代表國一、二、三；4, 5, 6 代表高一、二、三
    "email"    : {type : String, default : ""},
    "password" : String,
    "initpassword" : {type : Boolean, default : true},  // 是否為最初直接提供給學生的初始密碼，默認為 true；當用戶登入後，要求更改密碼，將便為 false
    "myCourses": [String]  // 記錄學生所選課程
});


// 靜態方法
// arr 是通過驗證的 Excel 學生資料
studentSchema.statics.importStudents = function(arr, callback){
    var gradeArr = ["國一", "國二", "國三", "高一", "高二", "高三"];

    // 先刪除整個 collection，因為是異步語句，所以新增的動作是放在匿名函數中(放到外面就變成邊刪除編新增啦！)
    mongoose.connection.collection("students").drop(function(){
        // 再匯入學生數據
        for(let i = 0; i < 6; i++){
            for(let j = 1; j < arr[i].data.length; j++){
                // 創立學生物件
                var s = new Student({
                    "stu_id" : arr[i].data[j][0],
                    "Name"   : arr[i].data[j][1],
                    "grade"  : gradeArr[i],
                    "password" : Student.initPassword()
                });
                s.save(function(err){
                    if(err){
                        callback(-1)
                        return;
                    }
                });
            }
        }
        callback(1)
    })
};

// 製作初始密碼
studentSchema.statics.initPassword = function(){
    // 等等加密用的字元
    var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&%$#@!"
    var pwd = "";
    // 製作六位數密碼
    for(let m = 0; m < 6; m++){
        pwd += str.charAt(parseInt(str.length * Math.random()))
    }
    return pwd;
}


// 建立 Student model，到時候資料庫會出現 students collection
var Student = mongoose.model("Student", studentSchema);



// 作為類別輸出
module.exports = Student;
