import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'
import morgan from 'morgan'

//DB and authenticateUser
import connectDB from './db/connect.js'

//routers
import authRouter from './routes/authRouter.js'
import jobsRouter from './routes/jobsRouter.js'

//middleware
import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddleware from './middleware/error-handler.js'
import authenticateUser from './middleware/auth.js'

//import __dirname
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

//morgan
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}

/* setup __dirname to make it compatible to ES6 */
const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static(path.resolve(__dirname,'./client/build'))) //static assets in are located

/* invoke middleware */
app.use(express.json()) //make json data available to controllers
app.use(helmet()) //secure HTTP headers
app.use(xss()) //sanitize user input coming from POST body, GET queries, and url params to prevent cross-site scripting attacks
app.use(mongoSanitize()) //sanitize user-supplied data to prevent MongoDB Operator Injection


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

/* setup GET routes */
app.get('*',(req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
}) //look for all GET routes and direct to client build index.html

app.use(notFoundMiddleware) //does not match the current routes
app.use(errorHandlerMiddleware) //all errors in the app

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        })
    } catch(error) {
        console.log(error)
    }
}

start()