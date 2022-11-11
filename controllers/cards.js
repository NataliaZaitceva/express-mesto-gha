const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }, req.user._id))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteCardById = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((cards) => res.status(200).send(req.params.cardId, { data: cards }))
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Ошибка обработки данных' });
    } return res.status(500).send({ message: 'Ошибка работы сервера' });
  });

module.exports.likeCard = (res, req) => Card.findById(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((user) => res.status(200).send(req.user._id, { data: user }))
  .catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(500).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
    }
  });

module.exports.dislikeCard = (res, req) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((cards) => {
    if (!cards) {
      return res.status(404).send({ message: 'Объект не найден' });
    }
    return res.status(200).send({ data: cards });
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
    }
  });
