class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
            throw new RangeError(`Invalid status code: ${statusCode}`);
        }
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.data = null
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}