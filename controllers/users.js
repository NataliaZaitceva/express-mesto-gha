const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  SERVER_ERROR,
  INVALID_ID,
  MISSING_USER,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_INTERNAL,
  ERROR_DATA,
} = require('../constants');
const SALT_ROUND = require('../config');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, 5)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => res.send({ data: user, _id: user._id }))

    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(ERROR_CODE_BAD_REQUEST({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` }));
      } else {
        next(err);
      }
    });

  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(ERROR_DATA).send({ message: 'Такой пользователь уже существует' });
    }
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(ERROR_CODE_INTERNAL(SERVER_ERROR));
    }
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      bcrypt.compare(password, SALT_ROUND, user.password, (error, hash) => {
        if (error) return res.status(401).send({ message: ' Что-то пошло не так ' });
        console.log({ hash });
        const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
        res
          .cookie('jwt', token, {
            maxAge: 3600000,
            httpOnly: true,
          })
          .send({ token });
      });
    })
    .catch(next);
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
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      } else {
        next(err);
      }
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
