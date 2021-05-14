import express from 'express'
import session from "express-session"
import mongoose from 'mongoose'

import showCtrl from './controllers/show.controller.js'
import showRoutes from './routes/show.route.js'
import routes from './routes/index.route.js'

const app = express()
const debug = require('debug')('app:app')
const MongoStore = require('connect-mongo')
const PORT = 3000

// 連結資料庫 - CourseSystem  (記得先打開數據庫)
mongoose.connect('mongodb://localhost/CourseSystem', { useNewUrlParser: true })
const initDB = require('./initDB')

initNormal()

function initNormal() {
  app.use(session({
    secret: "yourSession",  // session 的名稱
    cookie: { maxAge: 600000 },  // 設定 session 同時會給前端 cookie，未來依此 cookie 存取該 session，所以要設定 cookie 過期時間
    resave: false,
    saveUninitialized: true
  }));

  app.set("view engine", "ejs")
  app.use(express.json({ limit: 1024 * 1024 * 1024 })) // 1G
  app.use(express.urlencoded({ extended: true }))

  app.get('/', showCtrl.showIndex)
  app.use('/show', showRoutes)
  app.use('/api', routes)
  
  // 提供靜態資料夾，這樣 public 資料夾就等同於根目路(/)
  app.use(express.static("public"))
  
  // 設置 404 頁面，如果請求的路由沒有在路由清單也不在靜態資料夾，就會執行這段
  app.use((req, res) => res.status(404).json("404 你的網頁不存在"))
  
  app.listen(PORT, () => { console.log(`選課系統啟動囉！前往 ${PORT} port 查看...`) })
}


