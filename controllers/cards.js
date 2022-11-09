const Card = require('../models/card');

const ERROR_CODE = 400;
const INTERNAL_SERVER_ERROR = 500;

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  console.log(req.user._id);
  Card.create({ name, link })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.deleteCardById = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(ERROR_CODE).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.likeCard = (req, res) => Card.findById(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => res.status(201).send({ data: card }))
  .catch((err) => {
    if (err.name === 'BadRequest') {
      return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные для постановки лайка' });
    }
    if (!req.user._id) {
      return res.status(ERROR_CODE).send({ message: 'Передан несуществующий _id карточки.' });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
  });

module.exports.dislikeCard = (req, res) => Card.findById(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => res.status(201).send({ data: card }))
  .catch((err) => {
    if (err.name === 'BadRequest') {
      return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные для снятия лайка' });
    }
    if (!req.user._id) {
      return res.status(ERROR_CODE).send({ message: 'Передан несуществующий _id карточки.' });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка работы сервера' });
  });
