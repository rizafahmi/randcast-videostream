var express = require('express')
const fs = require('fs')
var router = express.Router()

const destinationFolder = '/Users/riza/Desktop'

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})
router.get('/video', (req, res) => {
  // listing all mp4 files
  const files = fs.readdirSync(destinationFolder)
  const filteredFiles = files.filter(file => file.indexOf('.mp4') > -1)
  res.render('video', { files: filteredFiles })
})
router.get('/video/:filename', (req, res) => {
  const path = `${destinationFolder}/${req.params.filename}`
  const stats = fs.statSync(path)
  const fileSize = stats.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = end - start + 1
    const file = fs.createReadStream(path, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

module.exports = router
