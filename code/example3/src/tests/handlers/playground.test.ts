import { MikroORM } from '@mikro-orm/core';
import { expect } from 'chai';

import { User } from '../../entities/user.entity';
import ormConfig from '../../orm.config';

describe("Playground", () => {
  it("Play around with MikroORM", async () => {
    // Create connection
    const orm = await MikroORM.init(ormConfig);
    // Clear database by dropping schema and running the migrations
    await orm.em.execute(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    await orm.getMigrator().up();

    // MikroORM manages a local cache of entities so we always work on a forked copy of the entity manager
    const em = orm.em.fork();

    // Create a user
    const user1 = em.create(User, {
      email: "test-user@panenco.com",
      name: "test",
      password: "testtestest",
    });
    // Save the user to the database
    await em.persistAndFlush(user1);

    // Count the users in the database
    const userCount = await em.count(User);
    expect(userCount).equal(1);

    const user2 = em.create(User, {
      email: "test-user+leslie@panenco.com",
      name: "Leslie Jobse",
      password: "testtestest",
    });
    await em.persistAndFlush(user2);

    const userCount2 = await em.count(User);
    expect(userCount2).equal(2);

    // Get all users from the database
    const allUsers = await em.find(User, {});
    expect(allUsers.length).equal(2);

    // Find users by conditions
    const foundByName = await em.findOneOrFail(User, {
      name: { $like: "%Jobse%" },
    });
    expect(foundByName.name).equal("Leslie Jobse");

    const allFoundByNotEmail = await em.find(User, {
      $not: {
        email: {
          $ilike: "%LESLIE%",
        },
      },
    });
    expect(allFoundByNotEmail.length).equal(1);
    expect(allFoundByNotEmail[0].email).equal("test-user@panenco.com");

    // Update a user
    user1.name = "Updated User";
    await em.flush();

    const updatedUserCount = await em.count(User, { name: "Updated User" });
    expect(updatedUserCount).equal(1);
  });
});
