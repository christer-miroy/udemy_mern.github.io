import express from 'express'
const router = express.Router()

import rateLimiter from 'express-rate-limit'
const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per `window` in 15 minutes
    message: 'Too many requests from this IP address. Please try again after 15 minutes',
})

import { register, login, updateUser } from "../controllers/authControllers.js"
import authenticateUser from '../middleware/auth.js'

router.route('/register').post(apiLimiter, register)
router.route('/login').post(apiLimiter, login)
router.route('/updateUser').patch(authenticateUser, updateUser)

export default router