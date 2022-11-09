const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(500).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => res.status(200).send({ data: card }, req.user._id))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(500).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.deleteCardById = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'BadRequest') {
        return res.status(400).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(500).send({ message: 'Ошибка работы сервера' });
    });
};

module.exports.likeCard = (req, res) => Card.findById(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => res.status(200).send({ data: card }))
  .catch((err) => {
    if (err.name === 'BadRequest') {
      return res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' });
    }
    if (!req.user._id) {
      return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
    }
    return res.status(500).send({ message: 'Ошибка работы сервера' });
  });

module.exports.dislikeCard = (req, res) => Card.findById(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => res.status(201).send({ data: card }))
  .catch((err) => {
    if (err.name === 'BadRequest') {
      return res.status(400).send({ message: 'Переданы некорректные данные для снятия лайка' });
    }
    if (!req.user._id) {
      return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
    }
    return res.status(500).send({ message: 'Ошибка работы сервера' });
  });
