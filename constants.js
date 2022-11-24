const SERVER_ERROR = 'Произошла ошибка на сервере';
const INVALID_ID = 'Неккорретный ID';
const INVALID_CARD = 'Передан несуществующий _id карточки';
const INVALID_DATA = 'Переданы некорректные данные';
const MISSING_USER = 'Пользователь по указанному _id не найден';

const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_INTERNAL = 500;
const ERROR_DATA = 403;
const DOUBLE_EMAIL_ERROR = 403;
const AVATAR_REGEX = /^:?https?:\/\/(www\.)?[a-zA-Z\d-]+\.[\w\d\-.~:/?#[\]@!$&'()*+,;=]{2,}#?$/;

module.exports = {
  SERVER_ERROR,
  INVALID_CARD,
  INVALID_DATA,
  INVALID_ID,
  MISSING_USER,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_INTERNAL,
  ERROR_DATA,
  AVATAR_REGEX,
  DOUBLE_EMAIL_ERROR,
};
