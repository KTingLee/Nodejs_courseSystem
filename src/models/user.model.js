import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    grade: String,   // 年級，1, 2, 3 代表國一、二、三；4, 5, 6 代表高一、二、三
    email: {type : String, default : ''},
    password: String,
    initpassword: {type : Boolean, default : true},  // 是否為最初直接提供給學生的初始密碼，默認為 true；當用戶登入後，要求更改密碼，將便為 false
    courses: [String]  // 記錄所選課程
})

userSchema.statics.comparePassword = function (inputPassword, DBPassword) {
  const match = bcrypt.compareSync(inputPassword, DBPassword)
  return match ? true : false
}

// 改寫 userSchema 的 save
userSchema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

// 製作初始密碼
userSchema.statics.initPassword = function(){
    // 等等加密用的字元
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&%$#@!"
    const pwd = "";
    // 製作六位數密碼
    for(let m = 0; m < 6; m++){
        pwd += str.charAt(parseInt(str.length * Math.random()))
    }
    return pwd;
}

const Student = mongoose.model('User', userSchema)

module.exports = Student