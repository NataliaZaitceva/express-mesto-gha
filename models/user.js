const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const bcrypt = require('bcryptjs');
const AuthError = require('../Errors/AuthError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак Ив Кусто',
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    default: 'исследователь',
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  avatar: {
    type: String,
    default: 'https//pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => isURL(v),
      message: 'Неправильный формат ссылки',
      required: true,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password').orFail(new AuthError('пользователь не зарегистрирован'))
    .then((user) => bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) {
          throw new AuthError('Неправильные почта или пароль');
        }
        return user; // теперь user доступен
      }));
};

module.exports = mongoose.model('user', userSchema);
