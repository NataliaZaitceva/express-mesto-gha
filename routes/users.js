const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateAvatar, updateProfile, getCurrentUser,
} = require('../controllers/users');
const { urlRegExp } = require('../constants');

router.get('/', getUsers);
router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).hex(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(urlRegExp),
  }),
}), updateAvatar);

module.exports = router;
