import mongoose from 'mongoose'
const debug = require('debug')('app:model:course')

const schema = new mongoose.Schema({
  id: String,
  name: String,
  day: { type: String, trim: true, enum: { values: ['星期一', '星期二', '星期三', '星期四', '星期五'] } },  // 開課日期(星期幾)
  member: Number,
  allow: [{ type: String, trim: true, enum: { values: ['國一', '國二', '國三', '高一', '高二', '高三'] } }],  // 允許年級
  teacher: String,
  intro: String,
  students: [String]
})

schema.statics = {
  async importCourses (courses, callback) {
    debug(`drop table: Courses`)
    await mongoose.connection.collection('courses').drop()
  
    try {
      await this.insertMany(courses)
    } catch (e) {
      throw e
    }
  },
}

export default mongoose.model('Course', schema)