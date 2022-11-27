const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const { AVATAR_REGEX } = require('./constants');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const BadRequest = require('./Errors/BadRequest');
// Слушаем 3000 порт
const PORT = 3000;
const app = express();
const auth = require('./middlewares/auth');

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
mongoose.connect('mongodb://localhost:27017/mestodb');

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(AVATAR_REGEX),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
// авторизация
app.use(auth);

// роуты, которым авторизация нужна
app.use('/users', routerUsers);
app.use('/cards', routerCards);

app.use((req, res, next) => {
  next(new BadRequest('Страница не найдена'));
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Ошибка сервера' } = err;
  res.status(statusCode).send({ message });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
