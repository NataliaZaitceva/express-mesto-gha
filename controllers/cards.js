const BadRequest = require('../Errors/BadRequest'); // 400
const NotFoundError = require('../Errors/NotFoundError'); // 404
const ForbiddenError = require('../Errors/ForbiddenError');
const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
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
        next(new ForbiddenError('Переданы некорректные данные'));
      } else {
        Card.deleteOne({ card })
          .then(() => res.send({ message: 'Карточка удалена' }))
          .catch(next);
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
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequest('Переданы некорректные данные'));
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
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequest('Переданы некорректные данные'));
      next(err);
    });
};
