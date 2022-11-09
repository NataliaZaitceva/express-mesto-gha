const router = require('express').Router();
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/cards', getCards);
router.post('/cards', createCard);
router.delete('/cards/:cardId', deleteCard);
router.PUT('/cards/:cardId/likes', likeCard);
router.PUT('PUT /cards/:cardId/likes', dislikeCard);
module.exports = router;
