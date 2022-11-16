import { readFile } from 'fs/promises'

import dotenv from 'dotenv'
dotenv.config()

import connectDB from './db/connect.js'
import Job from './models/Job.js'

const start = async () => {
    try {
        /* connect to database */
        await connectDB(process.env.MONGO_URL)
        
        /* delete existing jobs */
        await Job.deleteMany()

        const jsonProducts = JSON.parse(await readFile(new URL('./MOCK_DATA.json',import.meta.url)))

        await Job.create(jsonProducts)
        console.log('Mock data successfully placed!')
        process.exit(0)
        /*
            To test:
            turn off server and type node populate
        */
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

start()