import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js'

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
    res.status(StatusCodes.CREATED).json({
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
    const { email, password } = req.body
    
    /* check for empty values */
    if (!email || !password) {
        throw new BadRequestError('Please provide all values!')
    }

    /* check for user */
    const user = await User.findOne({ email }).select('+password')
    //.select('+password') = add password to the object
    if (!user) {
        throw new UnAuthenticatedError('Invalid credentials!')
    }

    /* check for password */
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnAuthenticatedError('Invalid credentials!')
    }

    const token = user.createJWT()

    user.password = undefined //remove the password from response

    /* send back user, token, and location */
    res.status(StatusCodes.OK).json({
        user,
        token,
        location: user.location
    })
}

const updateUser = async (req, res) => {
    const { email, name, lastName, location } = req.body

    /* check for values */
    if (!email || !name || !lastName || !location) {
        throw new BadRequestError('Please provide all values!')
    }

    /* find user by id and update the fields */
    const user = await User.findOne({_id: req.user.userId})
    user.email = email
    user.name = name
    user.lastName = lastName
    user.location = location

    await user.save()

    /* create new JWT */
    const token = user.createJWT()

    /* send back user, token, and location */
    res.status(StatusCodes.OK).json({
        user,
        token,
        location: user.location
    })
}

export {
    register,
    login,
    updateUser
}