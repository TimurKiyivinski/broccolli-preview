'use strict'

const fs = require('fs')

const express = require('express')
const http = require('http')
const socket = require('socket.io')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer')
const cors = require('cors')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const ffmpeg = require('fluent-ffmpeg')

;(function () {
  // Environment
  const env = JSON.parse(fs.readFileSync('env.json', 'utf8'))

  // Create express application
  const app = express()
  const server = http.createServer(app)
  const io = socket(server)
  // Load third party express middlewares
  app.use(bodyParser.json()) // Parse data sent to Express
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(expressSanitizer()) // Sanitizes input
  app.use(cors()) // Enable CORS

  // Enable webpack in development environment
  if (env.environment === 'development') {
    const webConfig = require('./webpack.config')
    const middlewareConfig = {
      publicPath: '/assets/',
      stats: {
        colors: true
      }
    }
    const webpackCompiler = webpack(webConfig)

    // Webpack middlewares
    app.use(webpackDevMiddleware(webpackCompiler, middlewareConfig))
    app.use(webpackHotMiddleware(webpackCompiler))
  }

  // Put your Express code here
  app.use((req, res, next) => {
    // This is an example middleware
    next()
  })

  io.on('connection', (socket) => {
    socket.emit('greeting', { hello: 'world' })
  })

  const fStream = fs.createWriteStream('Webcam.webm', { flags: 'a' })

  const command = ffmpeg()
    .input('/dev/video0')
    .fps(24)
    .audioCodec('libvorbis')
    .videoCodec('libvpx')
    .outputFormat('webm')

  const ffstream = command.pipe()
  ffstream.on('data', chunk => {
    console.log(`Received ${chunk.length} with encoding`)
    const timeBuffer = Buffer.from([new Date().getTime()])
    const concatBuffer = Buffer.concat([timeBuffer, chunk])
    io.sockets.emit('Webcam', chunk)
  })

  // Frontend files such as index.html and webpack's bundle.js
  app.use(express.static('public'))

  // Route everything except /assets to index.html to be parsed by frontend router
  app.get(/^((?!\/assets\/).)*$/, (req, res) => {
    res.sendFile('/index.html', {
      root: 'public'
    })
  })

  // Start Express
  server.listen(process.env.PORT || env.port)
})()
