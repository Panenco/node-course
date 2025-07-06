const { UserStore } = require('./user.store.js');

const update = async (req, res, next) => {
  const user = UserStore.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const updated = UserStore.update(req.params.id, { ...user, ...req.body });
  res.json(updated);
};

module.exports = { update };
