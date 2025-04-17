// import express from 'express'
const express = require('express')

const app = express()

const port = 5173

app.use(express.static('views'))
app.use('/output', express.static('views'))

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
})