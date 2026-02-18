class AppException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None):
        super().__init__(message)
        self.message = message
        if status_code:
            self.status_code = status_code


class NotFoundException(AppException):
    status_code = 404


class ForbiddenException(AppException):
    status_code = 403
