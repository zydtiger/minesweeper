const express = require('express')
const app = express()
app.use('/', express.static('./'))
app.listen(5000, () => console.log('Server listening at http://localhost:5000'))