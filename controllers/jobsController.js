import Job from '../models/Job.js'
import { StatusCodes } from 'http-status-codes'
import {
    BadRequestError,
    NotFoundError,
    UnAuthenticatedError,
} from '../errors/index.js'
import checkPermissions from '../utils/checkPermissions.js'
import mongoose from 'mongoose'

const createJob = async(req, res) => {
    const { company, position } = req.body

    if (!company || !position) {
        throw new BadRequestError('Please provide all values.')
    }

    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)

    res.status(StatusCodes.CREATED).json({ job })
}

const getAllJobs = async(req, res) => {
    const jobs = await Job.find({createdBy: req.user.userId})

    res
    .status(StatusCodes.OK)
    .json({
        jobs,
        totalJobs: jobs.length,
        numOfPages: 1
    })
}

const updateJob = async(req, res) => {
    const { id: jobId } = req.params
    const { company, position } = req.body
    /*  const { company, position, jobLocation } = req.body (second approach, see notes below) */

    if (!company || !position) {
        throw new BadRequestError('Please provide all values.')
    }

    const job = await Job.findOne({_id: jobId })

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId} found!`)
    }

    /* check permissions */
    checkPermissions(req.user, job.createdBy)

    /* first approach: will not trigger the hook */
    const updatedJob = await Job.findByIdAndUpdate({_id: jobId}, req.body, {
        new: true,
        runValidators: true //will only run based on what is provided by req.body (enum values in this case)
    })

    res.status(StatusCodes.OK).json({ updatedJob })
    

    /* second approach - will also trigger the hook. cons: make sure all properties exist 
    job.position = position
    job.company = company
    job.jobLocation = jobLocation   

    await job.save()

    res.status(StatusCodes.OK).json({ job })
    */
}

const deleteJob = async(req, res) => {
    const { id: jobId } = req.params

    const job = await Job.findOne({_id: jobId })

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId} found!`)
    }

    /* check permissions */
    checkPermissions(req.user, job.createdBy)

    await job.remove()

    res.status(StatusCodes.OK).json({
        msg: 'Job removed successfully!'
    })
}

const showStats = async(req, res) => {
    /* 1. return stats as an array */
    let stats = await Job.aggregate([
        {
            $match: {
                createdBy: mongoose.Types.ObjectId(req.user.userId)
            }
        },
        /* group by status */
        {
            $group: {
                _id: '$status',
                count: {
                    $sum: 1
                }
            }
        }
    ])

    /* 2. return stats as an object */
    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr
        acc[title] = count
        return acc
    }, {})

    /* display default stats */
    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0
    }

    /* monthly applications */
    let monthlyApplications = []

    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications })
}


export {
    createJob,
    deleteJob,
    getAllJobs,
    updateJob,
    showStats
}