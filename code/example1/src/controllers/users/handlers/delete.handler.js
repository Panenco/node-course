const { UserStore } = require('./user.store.js');

const deleteUser = async (req, res, next) => {
  const user = UserStore.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  UserStore.delete(req.params.id);
  res.status(204);
};

module.exports = { deleteUser };
