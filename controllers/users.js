const User = require('../models/user');

const ERROR_CODE = 400;
const INTERNAL_SERVER_ERROR = 500;
const NOT_FOUND = 404;
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(201).send({ data: users }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((users) => res.status(201).send({ data: users }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((userId) => res.status(201).send({ data: userId }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate({ name, about })
    .then((updateUser) => res.status(201).send({ data: updateUser }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      }
      if (!req.user._id) {
        return res.status(ERROR_CODE).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((updateUser) => res.status(201).send({ data: updateUser }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      }
      if (!req.user._id) {
        return res.status(ERROR_CODE).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};
