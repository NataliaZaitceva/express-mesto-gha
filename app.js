const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const { ERROR_CODE_NOT_FOUND, INVALID_DATA, AVATAR_REGEX } = require('./constants');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
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
app.post('/signin', login);
// авторизация
app.use(auth);

// роуты, которым авторизация нужна
app.use('/users', routerUsers);
app.use('/cards', routerCards);

app.use('*', (req, res) => {
  if (res.status(ERROR_CODE_NOT_FOUND)) {
    throw new INVALID_DATA('Необходимо авторизироваться');
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: 'На сервере произошла ошибка' });
  next();
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
