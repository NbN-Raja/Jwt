require("dotenv").config
const express = require('express')
const app = express()
const port = 3000
const bodyParser= require("body-parser")
const errorHandler = require("./src/helpers/prismaerror.js")
const morgan = require('morgan');


// Middleware
app.use(express.json()); 
app.use(errorHandler);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('Hello World!'))


require("./src/routes/auth.routes.js") (app)
require("./src/routes/products.routes.js") (app)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))