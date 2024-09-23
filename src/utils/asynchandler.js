const asyncHandler = (fn) => async (req, res, next) => {
     try {
        await fn(req, res, next);
     } catch (error) {
        const statusCode = error.statusCode || 500;
        // Validate status code
        if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
            console.error(`Invalid status code: ${statusCode}`);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
     }
}

export { asyncHandler };