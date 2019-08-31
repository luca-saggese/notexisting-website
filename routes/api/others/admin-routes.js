// ALL THE ADMIN-RELATED ROUTES ARE HANDLED BY THIS FILE

const app = require('express').Router()

// CHECKS IF USER US ADMIN [REQ = PASSWORD]
app.post('/check-is-admin', async (req, res) => {
  let { password } = req.body,
    { ADMIN_PASSWORD } = process.env

  if (password != ADMIN_PASSWORD) {
    res.json({ mssg: 'type yes to prove you are chee ho' })
  } else {
    req.session.isadmin = true
    res.json({
      mssg: 'Hello Chee Ho!!',
      success: true,
    })
  }
})

// ADMIN LOGOUT
app.post('/admin-logout', async (req, res) => {
  req.session.isadmin = false
  res.json('Hello, World!!')
})

module.exports = app
