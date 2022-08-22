export class UserStore {
  static users = [];

  static get(id) {
    return this.users.find((user) => user.id === Number(id));
  }

  static getByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  static find(search = undefined) {
    return this.users.filter(
      (user) => !search || Object.values(user).some((value) => value?.toString().includes(search))
    );
  }

  static add(user) {
    const u = { ...user, id: this.users.length };
    this.users.push(u);
    return u;
  }

  static update(id, input) {
    const current = this.get(id);
    const user = { ...current, ...input };
    this.users.splice(
      this.users.findIndex((x) => x === current),
      1,
      user
    );
    return user;
  }

  static delete(id) {
    this.users.splice(
      this.users.findIndex((x) => x.id === Number(id)),
      1
    );
  }
}
