const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  INVALID_ID,
  MISSING_USER,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
} = require('../constants');
const { SALT_ROUND } = require('../config');
const BadRequest = require('../Errors/BadRequest');
const DoubleEmailError = require('../Errors/DoubleEmailError');
const NotFoundError = require('../Errors/NotFoundError');
const AuthError = require('../Errors/AuthError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, SALT_ROUND)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send({
      name: user.name, about: user.about, avatar: user.avatar, email: user.email, _id: user._id,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequest('Ошибка'));
      if (err.code === 11000) {
        next(new DoubleEmailError());
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (email === undefined || password === undefined) {
    throw new AuthError();
  }
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password, (error, hash) => {
        if (!hash) {
          return res.status(401).send({ message: ' Что-то пошло не так ' });
        }
        const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
        return res
          .cookie('jwt', token, {
            maxAge: 3600000,
            httpOnly: true,
          })
          .send({ token });
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Ошибка'));
      }
      next(err);
    });
};

module.exports.getUserInfo = (req, res, next) => {
  User.get({
    name: req.body.name,
    about: req.body.about,
    owner: req.user._id,
  })
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: MISSING_USER });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      } else {
        next(err);
      }
    });
};
module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректные данные пользователя'));
      }
      next(err);
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: MISSING_USER });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректные данные пользователя'));
      }
      next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: MISSING_USER });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные при редактировании пользователя' });
      } else if (err.name === 'CastError') {
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: MISSING_USER });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(ERROR_CODE_BAD_REQUEST({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` }));
      } else if (err.name === 'CastError') {
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      } else {
        next(err);
      }
    });
};
