const router = require('express').Router();
const {
  getUsers, createUser, getUserById, updateAvatar, updateProfile,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
