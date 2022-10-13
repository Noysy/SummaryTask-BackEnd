class CustomError extends Error {
  statusCode!: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class notFoundError extends CustomError {
  constructor(objectType: string) {
    super(`There is no such ${objectType} with given id`, 404);
  }
}

class validationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

class noPermissionError extends CustomError {
  constructor(role: string) {
    super(
      `Uh oh.. Seems like you need to be ${role} to do that. Get lost loser.`,
      403
    );
  }
}

export { CustomError, notFoundError, validationError, noPermissionError };
