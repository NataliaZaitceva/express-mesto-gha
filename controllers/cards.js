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
      res.status(ERROR_CODE_INTERNAL).send({ SERVER_ERROR });
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(ERROR_CODE_BAD_REQUEST({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` }));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((card) => {
      Card.deleteOne(req.params.cardId);
      res.send({ data: card });
    }).catch((err) => {
      if (err.message === 'NotFound') {
        next(new ERROR_CODE_NOT_FOUND(INVALID_CARD));
      }
      if (err.name === 'CastError') {
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
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
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
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
        next(ERROR_CODE_BAD_REQUEST(INVALID_ID));
      } next(err);
    });
};
