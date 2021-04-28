/*
資料庫模組 - 操作課程集合
*/

var mongoose = require("mongoose");

// 建立 學生Student類別 的 Schema
var courseSchema = new mongoose.Schema({
    "cid"       : String,
    "Name"      : String,
    "courseDay" : String,   // 開課日期(星期幾)
    "member"    : Number,
    "allow"     : [String],
    "teacher"   : String,
    "intro"     : String,
    "myStudents": [String]
});


// 靜態方法



// 建立 Course model，到時候資料庫會出現 courses collection
var Course = mongoose.model("Course", courseSchema);



// 作為類別輸出
module.exports = Course;
