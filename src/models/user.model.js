import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
const debug = require('debug')('app:model:user')

const schema = new mongoose.Schema({
    id: String,
    username: String,
    grade: { type: String, trim: true, enum: { values: ['', '國一', '國二', '國三', '高一', '高二', '高三'] } },   // 年級，1, 2, 3 代表國一、二、三；4, 5, 6 代表高一、二、三
    email: {type : String, default : ''},
    password: String,
    initpassword: {type : Boolean, default : true},  // 是否為最初直接提供給學生的初始密碼，默認為 true；當用戶登入後，要求更改密碼，將便為 false
    courses: [String],  // 記錄所選課程
    role: { type: String, default : 'student', enum: { values: ['admin', 'student'] } }
})

// 改寫 userSchema 的 save
schema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password') || user.initpassword) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

schema.statics = {
  async importStudents (studentsArr, callback) {
    debug(`drop table: Users`)
    await this.deleteMany({role: 'student'});
  
    try {
      for (const students of studentsArr) {
        const grade = students.name
        for (const student of students.data) {
          if (student[0] === '學號') continue
    
          const user = {
            id: student[0],
            username: student[1],
            grade: grade,
            password: _initPassword()
          }
    
          await this.create(user)
        }
      }
    } catch (e) {
      throw e
    }
  },

  comparePassword (inputPassword, DBPassword) {
    const match = bcrypt.compareSync(inputPassword, DBPassword)
    return match ? true : false
  },
  
}

function _initPassword() {
    // 等等加密用的字元
    const str = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&%$#@!`
    let pwd = ''
    // 製作六位數密碼
    for(let m = 0; m < 6; m++){
        pwd += str.charAt(parseInt(str.length * Math.random()))
    }
    return pwd
}

export default mongoose.model('User', schema)