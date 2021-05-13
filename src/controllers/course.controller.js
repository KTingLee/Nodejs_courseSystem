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

async function list (req, res, next) {
  if (req.query.showAll) {
    const results = await Model.find({})
    return res.status(httpStatus.OK).json(results)
  }

  const page = req.query.page // 目前讀取的是第幾頁
  const rows = req.query.rows // 每頁要顯示幾筆資料
  const sidx = req.query.sidx // 以哪個 index 排序
  
  // 若有輸入快速查詢，則會放在 keyword 屬性中，並動態產生過濾內容 findFilter
  const findFilter = _makeRegex(req.query.keyword)

  // 因為不能確定以哪個 index 排序，所以建立一個 JSON 物件，並附上屬性
  const sort = (req.query.sord === 'asc') ? 1 : -1
  let sortObj = {}
  sortObj[sidx] = sort

  try {
    const count = await Model.countDocuments(findFilter)
    const totalPages = Math.ceil(count / rows)  // jqGrid 的總頁數(會根據 rows 而有所改變)
  
    // 輸出學生資料，格式必須依照 jqGrid 的 API 要求
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

  function _makeRegex (keyword) {
    if (!keyword) return {}

    // 將快速查詢的結果轉成正規表達式物件，並做全局搜索，意即 /keyword/g  (其中 keyword 是網址列中的參數)
    const regexp = new RegExp(keyword, 'g')
    return {
      $or: [
        {id: regexp},
        {name: regexp},
        {grade: regexp}
      ]
    }
  }
}

async function set (req, res, next) {
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

async function importUsers(req, res, next) {
  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).json({message: `file is required`})
  }

  if (!req.file.mimetype.includes('spreadsheetml.sheet')) {
    // fs 是依照 terminal 執行時的位置
    fs.unlinkSync(req.file.path)
    return res.status(httpStatus.BAD_REQUEST).json({message: `Format error! Only 'xlsx' accept`})
  }

  try {
    const users = xlsx.parse(req.file.path)
    const errMsg = _checkFormat(users)
    if (errMsg.length !== 0) {
      return res.status(httpStatus.BAD_REQUEST).json({message: errMsg})
    }

    await Model.importStudents(users)
    return res.status(httpStatus.OK).json({data: 'ok'})
  } catch (e) {
    next(e)
  }

  function _checkFormat(data) {
    let errMsg = []

    // 檢查是否含有六個年級的 sheet
    if (data.length !== 6) {
      errMsg.push(`sheet amount error`)
    }

    // 檢查資料格式是否正確 學號、姓名、性別
    for (let i = 0; i < 6; i++) {
      if (data[i].data[0][0] !== '學號' || data[i].data[0][1] !== '姓名') {
        errMsg.push(`Format error in sheet ${i + 1}. The first row must be '學號' and '姓名'`)
      }
    }

    return errMsg
  }
}

// 先從資料庫撈學生資料，再轉成 Excel buffer，最後以 fs 生成檔案
async function downloadUsers(req, res, next) {
    let excelRes = []
    const GRADES = ['國一', '國二', '國三', '高一', '高二', '高三']

    try {
      for (const grade of GRADES) {
        const users = await Model.find({grade: grade})
        let sheetRes = [ ['學號', '姓名', '年級', '初始密碼'] ]
        users.forEach(user => {
          sheetRes.push([
            user.id,
            user.username,
            user.grade,
            user.password
          ])
        })
  
        excelRes.push({name: grade, data: sheetRes})
      }
      const buffer = xlsx.build(excelRes)
      const fileName = dateFormat(new Date(), '學生資料yyyy年MM月dd日hhmmss') + '.xlsx'
  
      fs.writeFileSync(`./public/excel/${fileName}`, buffer)
      return res.status(httpStatus.OK).redirect(`/excel/${fileName}`)
    } catch(e) {
      next(e)
    }
}

export default { get, load, add, list, set, del, importUsers, downloadUsers, }