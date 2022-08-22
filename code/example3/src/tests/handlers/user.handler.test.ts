import { MikroORM, RequestContext } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { expect } from 'chai';
import { before, beforeEach, describe, it } from 'mocha';
import { v4 } from 'uuid';

import { create } from '../../controllers/users/handlers/create.handler';
import { deleteUser } from '../../controllers/users/handlers/delete.handler';
import { get } from '../../controllers/users/handlers/get.handler';
import { getList } from '../../controllers/users/handlers/getList.handler';
import { update } from '../../controllers/users/handlers/update.handler';
import { User } from '../../entities/user.entity';
import ormConfig from '../../orm.config';

const userFixtures: User[] = [
  {
    name: "test1",
    email: "test-user+1@panenco.com",
    password: "password1",
  } as User,
  {
    name: "test2",
    email: "test-user+2@panenco.com",
    password: "password2",
  } as User,
];

describe("Handler tests", () => {
  describe("User Tests", () => {
    let orm: MikroORM<PostgreSqlDriver>;
    let users: User[];
    before(async () => {
      orm = await MikroORM.init(ormConfig);
    });

    beforeEach(async () => {
      await orm.em.execute(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
      await orm.getMigrator().up();
      const em = orm.em.fork();
      users = userFixtures.map((x) => em.create(User, x));
      await em.persistAndFlush(users);
    });

    it("should get users", async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const [res, total] = await getList(null);
        expect(res.some((x) => x.name === "test2")).true;
      });
    });

    it("should get user by id", async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const res = await get(users[1].id);

        expect(res.name).equal("test2");
        expect(res.email).equal("test-user+2@panenco.com");
      });
    });

    it("should fail when getting user by unknown id", async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        try {
          await get(v4());
        } catch (error) {
          expect(error.message).equal("User not found");
          return;
        }
        expect(true, "should have thrown an error").false;
      });
    });

    it("should create user", async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const body = {
          email: "test-user+new@panenco.com",
          name: "newUser",
          password: "reallysecretstuff",
        } as User;
        const res = await create(body);

        expect(res.name).equal("newUser");
        expect(res.email).equal("test-user+new@panenco.com");
      });
    });

    it("should update user", async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const body = {
          email: "test-user+updated@panenco.com",
        } as User;
        const id = users[0].id;
        const res = await update(id.toString(), body);

        expect(res.email).equal(body.email);
        expect(res.name).equal("test1");
        const foundUser = await orm.em.findOne(User, { id });
        expect(foundUser.email).equal(body.email);
      });
    });

    it("should delete user by id", async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const initialCount = await orm.em.count(User);
        await deleteUser(users[0].id);

        const newCount = await orm.em.count(User);
        expect(initialCount - 1).equal(newCount);
      });
    });
  });
});
