require('dotenv').config()

const express = require('express')
const app = express()
const cors = require("cors")
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL , { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(cors())

const productsRouter = require('./app/routes/product')
const usersRouter = require('./app/routes/user')

const cartRouter = require("./app/routes/cart");
app.use('/products', productsRouter)
app.use('/users', usersRouter)

app.use("/cart", cartRouter);

app.listen(process.env.PORT || 3300, () => console.log(`Server started on port 3000`))