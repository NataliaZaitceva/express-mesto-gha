const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../Errors/NotFoundError');
const { urlRegExp } = require('../constants');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(urlRegExp),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

router.use(auth);

// роуты, которым авторизация нужна
router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

router.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
