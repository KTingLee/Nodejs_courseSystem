import debug from 'debug'
import httpStatus from 'http-status'
// import APIError from '../middlewares/errors/APIError'
import Model from '../models/user.model'

async function add (req, res, next) {
  const user = await Model.findOne({id: req.body.id})
  if (user) {
    return res.status(httpStatus.BAD_REQUEST).json({message: 'user already exist'})
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
  const user = {
    id: obj.id,
    username: obj.username,
    email: obj.email
  }
  return res.status(httpStatus.OK).json(user)
}

async function load (req, res, next, id) {
  try {
    const obj = await Model.findOne({id: id})
    if (!obj) {
      return res.status(httpStatus.NOT_FOUND).json({message: 'user id not exist'})
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

export default { get, load, add, list, }