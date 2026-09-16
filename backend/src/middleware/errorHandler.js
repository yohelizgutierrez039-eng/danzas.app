class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_ERROR";

    if (!err.statusCode) {
        console.error(err);
    }

    res.status(statusCode).json({
        error: {
            code,
            message: statusCode === 500 ? "Ocurrió un error inesperado" : err.message
        }
    });
}

module.exports = { AppError, errorHandler };
