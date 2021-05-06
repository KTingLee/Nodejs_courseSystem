import mongoose from 'mongoose'
import fs from 'fs'

import User from './models/user.model'
const debug = require('debug')('app:initDB')

;(async () => {
  await insertUser()
})()

async function insertUser () {
  if (await User.count() !== 0) return
  const data = [
    {id: 'admin', username: 'admin', password: '1234', initpassword: false}
  ]

  debug(' => insert users')
  for (let user of data) {
    let result = await User.create(user)
  }
}