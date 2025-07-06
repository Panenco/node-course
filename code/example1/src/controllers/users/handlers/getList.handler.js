const { UserStore } = require('./user.store.js');

const getList = async (req, res, next) => {
  const users = UserStore.find(req.query.search);
  res.json(users);
};

module.exports = { getList };
