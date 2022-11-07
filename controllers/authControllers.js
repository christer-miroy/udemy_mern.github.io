import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from '../errors/index.js'

const register = async (req, res) => {
    const { name, email, password } = req.body
    
    /* check for empty values */
    if (!name || !email || !password) {
        throw new BadRequestError('Please provide all values')
    }

    /* Duplicate Email */
     const userAlreadyExist = await User.findOne({email})
     if (userAlreadyExist) {
        throw new BadRequestError('Email already in use!')
     }

    const user = await User.create({ name, email, password })
    const token = user.createJWT() //create JWT
    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            location: user.location,
        },
        token,
        location: user.location
    })
    
}

const login = async (req, res) => {
    res.send('login user')
}

const updateUser = async (req, res) => {
    res.send('update user')
}

export {
    register,
    login,
    updateUser
}