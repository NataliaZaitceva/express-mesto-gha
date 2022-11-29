class DoubleEmailError extends Error {
  constructor() {
    super();
    this.message = 'Данный email уже зарегистрирован!';
    this.statusCode = 409;
    this.name = 'DoubleEmailError';
  }
}

module.exports = DoubleEmailError;
