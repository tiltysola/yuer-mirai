import express from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import ws from 'ws'
import path from 'path'
import fs from 'fs'
import sass from 'node-sass'
import DBHandle from './handlers/DBHandle'
import CQHandle from './handlers/CQHandle'

import config from './configs/config'

const app = express()

// Custom listening port
const http_port = config.http_port
const ws_port = config.ws_port

// Set ejs as default template engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Resolve static directory: public
app.use(express.static(path.join(__dirname, '../public')))

// Routes
app.use('/', require('./routes/main'))
app.use('/tata', require('./routes/tata'))

// Watch scss change
fs.exists(path.join(__dirname, 'scss'), (ext) => {
  if (ext) {
    let watch = fs.watch(path.join(__dirname, 'scss'))
    watch.on('change', (type, filename: string) => {
      setTimeout(() => {
        let suffix = path.extname(filename)
        let outputName = path.join(__dirname, '../public/assets/css', path.basename(filename, suffix) + '.css')
        sass.render({
          file: path.join(__dirname, 'scss', filename),
          outFile: outputName,
          outputStyle: 'compressed',
          sourceMap: true
        }, (err, result) => {
          if (err) {
            console.log('[Error] sass render err ->', err)
          } else {
            fs.writeFile(outputName, result.css, (err) => {
              if (err) {
                console.log('[Error] sass save err ->', err)
              }
            })
          }
        })
      }, 3000)
    })
  }
})

console.log('\
  __    __  _   _     _   _____   _____   _____  \n\
  \\ \\  / / | | | |   / / |  _  \\ /  _  \\ |_   _| \n\
   \\ \\/ /  | | | |  / /  | |_| | | | | |   | |   \n\
    }  {   | | | | / /   |  _  { | | | |   | |   \n\
   / /\\ \\  | | | |/ /    | |_| | | |_| |   | |   \n\
  /_/  \\_\\ |_| |___/     |_____/ \\_____/   |_|   \n')

// Get connection with Database
DBHandle.then(() => {
  // Server listening
  let server = http.createServer(app)
  if (http_port !== ws_port) {
    server.listen(http_port, () => {
      console.log('[Debug] XivBot listening on port: %s', http_port)
      // WebSocket Server
      const wss = new ws.Server({
        port: ws_port
      }, () => {
        console.log('[Debug] XivBot websocket listening on port: %s', ws_port)
        CQHandle(wss)
      })
    })
  } else {
    const wss = new ws.Server({
      noServer: true
    })
    CQHandle(wss)
    server.on('upgrade', function upgrade(request, socket, head) {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request)
      })
    })
    server.listen(http_port, () => {
      console.log('[Debug] XivBot listening on port: %s', http_port, ', websocket is the same port.')
    })
  }
}).catch((err) => {
  console.log('[Error]', err)
})