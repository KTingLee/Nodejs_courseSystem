import fs from 'fs'
import debug from 'debug'
import xlsx from 'node-xlsx'
import httpStatus from 'http-status'
// import APIError from '../middlewares/errors/APIError'
import dateFormat from 'dateformat'
import Model from '../models/course.model'

async function add (req, res, next) {
  const course = await Model.findOne({id: req.body.id})
  if (course) {
    return res.status(httpStatus.BAD_REQUEST).json({message: 'course already exist'})
  }

  try {
    await Model.create(req.body)
    return res.status(httpStatus.OK).json({data: 'ok'})
  } catch (e) {
    next(e)
  }
}

function get (req, res, next) {
  const obj = req.obj
  return res.status(httpStatus.OK).json(obj)
}

async function load (req, res, next, id) {
  try {
    const obj = await Model.findOne({id: id})
    if (!obj) {
      return res.status(httpStatus.NOT_FOUND).json({message: 'course id not exist'})
      // throw new APIError({status: httpStatus.NOT_FOUND, message: 'user id not exist'})
    }
    req.obj = obj
    next()
    return null
  } catch (e) {
    next(e)
  }
}

// 前端傳遞GET請求，路由例如 coursesData?_search=false&nd=1587007004897&rows=10&page=1&sidx=cid&sord=asc
// 解析此路由，以獲得對應的課程資料，再將其回傳
async function list(req, res, next) {
  // 解析GET請求
  const page = req.query.page // 目前讀取的是第幾頁
  const rows = req.query.rows // 每頁要顯示幾筆資料
  const sidx = req.query.sidx // 以哪個 index 排序

  // 快速查詢字元放在 keyword 欄位中
  const findFilter = _makeRegex(req.query.keyword)

  // 因為不能確定以哪個 index 排序，所以建立一個 JSON 物件，並附上屬性
  const sort = (req.query.sord === 'asc') ? 1 : -1
  let sortObj = {}
  sortObj[sidx] = sort

  try {
    const count = await Model.countDocuments(findFilter)
    const totalPages = Math.ceil(count / rows)  // jqGrid 的總頁數(會根據 rows 而有所改變)
  
    // 輸出課程資料，格式必須依照 jqGrid 的 API 要求
    const results = await Model.find(findFilter).sort(sortObj).limit(parseInt(rows)).skip(rows * (page - 1)).exec()
    const ret = {
      page: page,
      total: totalPages,
      records: count,
      rows: results
    }
    return res.status(httpStatus.OK).json(ret)
  } catch (e) {
    next(e)
  }

  function _makeRegex(keyword) {
    if (!keyword) return {}

    // 將快速查詢的結果轉成正規表達式物件，並做全局搜索，意即 /keyword/g  (其中 keyword 是網址列中的參數)
    const regexp = new RegExp(keyword, 'g')
    return {
      $or: [
        {id: regexp},
        {name: regexp},
        {allow: regexp},
        {day: regexp},
        {teacher: regexp},
        {intro: regexp}
      ]
    }
  }
}

async function set (req, res, next) {
  delete req.body.oper
  req.body.allow = req.body.allow.split(',')  // 前端用 jqGrid，導致傳來的內容有點難處理，所以放到後端來弄
  let obj = req.obj
  Object.assign(obj, req.body)
  try {
    const result = obj.save()
    return res.status(httpStatus.OK).json(obj)
  } catch (e) {
    next(e)
  }
}

async function del (req, res, next) {
  const obj = req.obj
  await Model.deleteOne({id: obj.id})
  return res.status(httpStatus.OK).json({data: 'ok'})
}

async function importCourses(req, res, next) {
  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).json({message: `file is required`})
  }

  if (!req.file.mimetype.includes('json')) {
    // fs 是依照 terminal 執行時的位置
    fs.unlinkSync(req.file.path)
    return res.status(httpStatus.BAD_REQUEST).json({message: `Format error! Only 'json' accept`})
  }
  
  try {
    const courses = JSON.parse(fs.readFileSync(req.file.path))

    await Model.importCourses(courses.course)
    return res.status(httpStatus.OK).json({data: 'ok'})
  } catch (e) {
    next(e)
  }
}

export default { get, load, add, list, set, del, importCourses, }