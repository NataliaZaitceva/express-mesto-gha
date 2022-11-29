class ForbiddenError extends Error {
  constructor() {
    super();
    this.message = 'Данный email уже зарегистрирован!';
    this.statusCode = 403;
  }
}

module.exports = ForbiddenError;
