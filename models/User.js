import mongoose from "mongoose"
import validator from "validator"
import bcryptjs from "bcryptjs"

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
        trim: true
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
    const salt = await bcryptjs.genSalt(10);
    
    /* set password */
    this.password = await bcryptjs.hash(this.password, salt)
})

export default mongoose.model('User', UserSchema)