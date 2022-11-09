const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routerUsers = require('./routes/users');

// Слушаем 3000 порт
const PORT = 3000;
const app = express();

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
mongoose.connect('mongodb://localhost:27017/mestodb');
app.use((req, res, next) => {
  req.user = { _id: '6369c28aba5e69e8003039a6' }; // вставьте сюда _id созданного в предыдущем пункте пользователя
  next();
});

app.use('/users', routerUsers);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
