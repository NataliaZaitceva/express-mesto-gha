const {
  SERVER_ERROR,
  INVALID_CARD,
  INVALID_ID,
  ERROR_CODE_INTERNAL,
} = require('../constants');
const BadRequest = require('../Errors/BadRequest'); // 400
const NotFoundError = require('../Errors/NotFoundError'); // 404
const ForbiddenError = require('../Errors/ForbiddenError');
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
        next(new BadRequest({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` }));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => new NotFoundError(' ID карточки не существует'))
    .then((card) => {
      if ((!card.owner.equals(req.user._id))) {
        next(new ForbiddenError(INVALID_CARD));
      } else {
        Card.deleteOne({ card })
          .then(() => res.send({ message: 'Карточка удалена' }));
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError(INVALID_CARD);
      }
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.message === 'NotFound') next(new NotFoundError(INVALID_CARD));
      if (err.name === 'CastError') next(new BadRequest(INVALID_ID));
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
        throw new NotFoundError(INVALID_CARD);
      }
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequest(INVALID_ID));
      next(err);
    });
};
