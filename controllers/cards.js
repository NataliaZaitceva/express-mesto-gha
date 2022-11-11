const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(500).send({ message: 'Произошла ошибка сервера' });
      }
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else {
        res.status(500).send({ message: 'Произошла ошибка сервера' });
      }
    });
};

module.exports.deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .orFail(() => {
    throw new Error('NotFound');
  })
  .then((card) => res.send({ data: card }))
  .catch((err) => {
    if (err.message === 'NotFound') {
      return res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Произошла ошибка' });
    }
    if (err.name === 'CastError') {
      return res.status(400).send({ message: 'Произошла ошибка' });
    }
    return res.status(500).send({ message: 'Произошла ошибка сервера' });
  });

module.exports.likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((cards) => {
    if (!cards) {
      res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
    }
    res.status(200).send({ data: cards });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Произошла ошибка' });
    } else {
      res.status(500).send({ message: 'Произошла ошибка сервера' });
    }
  });

module.exports.dislikeCard = (res, req) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (!cards) {
        res.status(400).send({ message: 'Передан несуществующий _id карточки.' });
      }
      res.status(200).send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Произошла ошибка' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка сервера' });
      }
    });
};
