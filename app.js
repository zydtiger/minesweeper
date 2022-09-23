const express = require('express')
const app = express()
app.use('/', express.static('./'))
app.listen(60001, () => console.log('Server listening at http://localhost:60001'))