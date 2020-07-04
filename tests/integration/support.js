const crypto = require('crypto')
const ProtonMail = require('../../lib/proton-mail')
require('dotenv').config()
const username = process.env.PM_USERNAME
const password = process.env.PM_PASSWORD
const pm = new ProtonMail({
  username,
  password
})

before(async () => {
  console.log('----------- Oh yes we are getting ready to connect')
  await pm._connect()
  console.log('----------- And connected')
})

after(() => {
  pm.close()
})

function randomString (length = 20) {
  return crypto.randomBytes(length).toString('hex')
}

module.exports = {
  pm,
  randomString,
  username,
  password
}
