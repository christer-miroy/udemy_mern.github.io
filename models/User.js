import mongoose from "mongoose"
import validator from "validator"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 20,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email address.'
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
        trim: true,
        select: false
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 20,
        trim: true,
        default: 'Last Name'
    },
    location: {
        type: String,
        minlength: 3,
        maxlength: 20,
        trim: true,
        default: 'My City'
    }
})

/* hash password before saving */
UserSchema.pre('save', async function () {
    /* generate salt */
    //const salt = await bcryptjs.genSalt(10);
    
    /* set password */
    //this.password = await bcryptjs.hash(this.password, salt)

    /* return all paths that the user is modifying */
    //console.log(this.modifiedPaths())
    if (!this.isModified('password')) return
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt)
})

/* create json web token */
UserSchema.methods.createJWT = function () {
    return jwt.sign({ userId: this.id }, process.env.JWT_SECRET , { expiresIn: process.env.JWT_LIFETIME })
}

/* compare password */
UserSchema.methods.comparePassword = async function(candidatePassword) {
    const isMatch = await bcryptjs.compare(candidatePassword, this.password);
    return isMatch
}

export default mongoose.model('User', UserSchema)