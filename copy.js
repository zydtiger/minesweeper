const fs = require('fs')
fs.copyFileSync('src/build/style.css', 'style.min.css')
fs.copyFileSync('src/build/bundle.js', 'bundle.min.js')
