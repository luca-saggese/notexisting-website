// ALL POST-RELATED ROUTES ARE HANDLED BY THIS FILE

const app = require('express').Router(),
  db = require('../../../config/db'),
  Post = require('../../../config/Post'),
  User = require('../../../config/User'),
  root = process.cwd(),
  cloudinary = require('cloudinary').v2,
  multer = require('multer')

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `${root}/dist/temp/`)
  },
  filename: function(req, file, cb) {
    // console.log(file)
    //
    cb(null, file.originalname)
  },
})

cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret,
})

// POST [REQ = DESC, FILTER, LOCATION, TYPE, GROUP, IMAGE(FILE) ]
app.post('/post-it', async (req, res) => {
  const upload = multer({ storage }).single('image')
  upload(req, res, async function(err) {
    if (err) {
      return res.send(err)
    }
    console.log(req.file)
    // res.json(req.file)

    const path = req.file.path
    const uniqueFilename = `perspective_${new Date().toISOString()}`

    try {
      var url = await cloudinary.uploader.upload(path)
    } catch (err) {
      console.log(err)
    }
    // filename = `instagram_${new Date().getTime()}.jpg`,
    // obj = {
    //   srcFile: req.file.path,
    //   destFile: `${root}/dist/posts/${filename}`,
    // },

    console.log(url)

    var fileURI = url.secure_url

    // console.log(req.body)
    try {
      let { id } = req.session,
        { desc, filter, location, type, group } = req.body,
        insert = {
          user: id,
          description: desc,
          imgSrc: fileURI,
          filter,
          location,
          type,
          group_id: group != 'undefined' ? group : '0',
          post_time: new Date().getTime(),
        }

      console.log(insert)

      // await ProcessImage(obj)
      // DeleteAllOfFolder(`${root}/dist/temp/`)

      let { insertId } = await db.query('INSERT INTO posts SET ?', insert),
        firstname = await User.getWhat('firstname', id),
        surname = await User.getWhat('surname', id)

      await db.toHashtag(desc, id, insertId)
      await User.mentionUsers(desc, id, insertId, 'post')

      res.json({
        success: true,
        mssg: 'Posted!!',
        post_id: insertId,
        firstname,
        surname,
        filename: fileURI,
      })
    } catch (error) {
      db.catchError(error, res)
    }

    cloudinary.uploader.upload(
      path,
      { public_id: `feed/${uniqueFilename}`, tags: `feed` }, // directory and tags are optional
      async function(err, image) {
        if (err) return res.send(err)
        console.log('file uploaded to Cloudinary')
        // remove file from server
        const fs = require('fs')
        fs.unlinkSync(path)
        // return image details
        // res.json(image)
        console.log(image)
      }
    )
  })
})

// TAGS USERS FOR A POST [REQ = TAGS, POST_ID]
app.post('/tag-post', (req, res) => {
  let { tags, post_id } = req.body
  tags.forEach(async t => {
    let tagInsert = {
      post_id: post_id,
      user: t.user,
    }
    await db.query('INSERT INTO post_tags SET ?', tagInsert)
  })
  res.json(null)
})

// EDIT POST [REQ = POST, DESCRIPTION]
app.post('/edit-post', async (req, res) => {
  try {
    let { post_id, description } = req.body
    let { id } = req.session

    await db.query('UPDATE posts SET description=? WHERE post_id=?', [
      description,
      post_id,
    ])
    await db.query('DELETE FROM hashtags WHERE post_id=?', [post_id])
    await db.toHashtag(description, id, post_id)

    res.json({
      success: true,
      mssg: 'Post updated!!',
    })
  } catch (error) {
    db.catchError(error, res)
  }
})

// GET POST TAGS [REQ = POST]
app.post('/get-post-tags', async (req, res) => {
  let { post } = req.body,
    { id } = req.session,
    tags = await db.query(
      'SELECT post_tags.post_tag_id, post_tags.post_id, post_tags.user, users.username, users.firstname, users.surname FROM post_tags, users WHERE post_tags.post_id = ? AND post_tags.user = users.id ORDER BY post_tag_id DESC',
      [post]
    ),
    array = []

  for (let t of tags) {
    array.push({
      ...t,
      isFollowing: await User.isFollowing(id, t.user),
    })
  }

  res.json({
    tags: array,
    isPostMine: await Post.isPostMine(id, post),
  })
})

// UNTAG [REQ = POST, USER]
app.post('/untag', async (req, res) => {
  let { user, post } = req.body
  await db.query('DELETE FROM post_tags WHERE post_id=? AND user=?', [
    post,
    user,
  ])
  res.json('Hello, World!!')
})

// DELETE POST [REQ = POST]
app.post('/delete-post', async (req, res) => {
  try {
    await Post.deletePost({
      post: req.body.post,
      when: 'user',
    })
    res.json({
      success: true,
      mssg: 'Post deleted!!',
    })
  } catch (error) {
    db.catchError(error, res)
  }
})

module.exports = app
