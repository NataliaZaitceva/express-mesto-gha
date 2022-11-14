const User = require('../models/user');
const {
  SERVER_ERROR,
  INVALID_CARD,
  INVALID_DATA,
  INVALID_FIELD,
  INVALID_ID,
  MISSING_USER,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_INTERNAL,
} = require('../constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((newUser) => res.send({ data: newUser }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
      }
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: MISSING_USER });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: INVALID_ID });
      } else { res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR }); }
    });
};

module.exports.updateProfile = (req, res) => {
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
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные при редактировании пользователя' });
      } else if (err.name === 'CastError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: INVALID_ID });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
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
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else if (err.name === 'CastError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: INVALID_ID });
      } else { res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR }); }
    });
};
