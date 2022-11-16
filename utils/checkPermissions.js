import { UnAuthenticatedError } from '../errors/index.js'

const checkPermissions = (requestUser, resourceUserId) => {
    /* check if user id = resource user id turned into string */
    if (requestUser.userId === resourceUserId.toString()) return
    throw new UnAuthenticatedError('Not authorized to access this route!')
}

export default checkPermissions