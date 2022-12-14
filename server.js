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

//morgan
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}

app.use(express.json()) //make json data available to controllers
console.log('Back end running.')


app.get('/', (req, res) => {
    //throw new Error('error')
    res.send({msg: 'Welcome!'})
})

app.get('/api/v1', (req, res) => {
    //throw new Error('error')
    res.send({msg: 'API'})
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

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