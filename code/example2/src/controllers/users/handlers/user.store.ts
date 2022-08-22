export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export class UserStore {
  static users: User[] = [];

  static get(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  static getByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  static find(search?: string): User[] {
    return this.users.filter(
      (user) => !search || Object.values(user).some((value) => value?.toString().includes(search))
    );
  }

  static add(user: Omit<User, 'id'>): User {
    const u = { ...user, id: this.users.length };
    this.users.push(u);
    return u;
  }

  static update(id: number, input: User): User {
    const current = this.get(id);
    const user = { ...current, ...input };
    this.users.splice(
      this.users.findIndex((x) => x === current),
      1,
      user
    );
    return user;
  }

  static delete(id: number) {
    this.users.splice(
      this.users.findIndex((x) => x.id === id),
      1
    );
  }
}
