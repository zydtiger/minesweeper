const handler = require('serve-handler')
const http = require('http')
const express = require('express')

const app = express()

app.use('/', express.static('./'))

// const server = http.createServer((req, res) => {
//   return handler(req, res, {
//     directoryListing: false
//   })
// })

// server.listen(60001, () => console.log('Server listening at http://localhost:60001'))

app.listen(60001, () => console.log('Server listening at http://localhost:60001'))