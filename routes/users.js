const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateAvatar, updateProfile, getUserInfo,
} = require('../controllers/users');
const { AVATAR_REGEX } = require('../constants');

router.get('/', getUsers);
router.get('/me', celebrate({
  body: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserInfo);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).hex(),
  }),
}), getUserById);
router.patch('/me', updateProfile);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(AVATAR_REGEX),
  }),
}), updateAvatar);

module.exports = router;
