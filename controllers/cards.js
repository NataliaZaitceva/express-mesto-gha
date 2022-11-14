const {
  SERVER_ERROR,
  INVALID_CARD,
  INVALID_ID,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_INTERNAL,
} = require('../constants');

const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const { owner } = req.user._id;
  Card.create({ name, link })
    .then((card) => res.send({ data: card, owner }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
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
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: INVALID_CARD });
    }
    if (err.name === 'CastError') {
      return res.status(ERROR_CODE_BAD_REQUEST).send({ message: INVALID_ID });
    }
    return res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
  });

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: INVALID_CARD });
      }
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({ message: INVALID_ID });
      }
      return res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (!cards) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: INVALID_CARD });
      }
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: INVALID_ID });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: SERVER_ERROR });
      }
    });
};
