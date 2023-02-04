import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { StatusCode } from "@panenco/papi";
import { expect } from "chai";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import supertest from "supertest";
import { App } from "../../app";
import { User } from "../../entities/user.entity";

// bootstrapping the server with supertest
describe('Integration tests', () => {
  describe('User Tests', () => {
    let request: supertest.SuperTest<supertest.Test>;
    let orm: MikroORM<PostgreSqlDriver>;

    before(async () => {
      const app = new App();
      await app.createConnection();
      orm = app.orm;
      request = supertest(app.host);
    });

    beforeEach(async () => {
      await orm.em.execute(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
      await orm.getMigrator().up();
    });

    it('CRUD user', async () => {
      // Unauthorized without "token"
      await request.get(`/api/users`).expect(StatusCode.unauthorized);

      // calling an endpoint
      const { body: createResponse } = await request
      .post(`/api/users`) // post a certain route
      .send({
        name: 'test',
        email: 'test-user+1@panenco.com',
        password: 'real secret stuff',
      }) // Send a request body
      .expect(StatusCode.ok); // Here you can already expect a certain status code.
      
      // login
      const { body: loginResponse } = await request
      .post('/api/auth/login')
      .send({ email: 'test-user+1@panenco.com', password: 'real secret stuff' })
      .expect(StatusCode.ok);
      const token = loginResponse.token;

      const foundCreatedUser = await orm.em.fork().findOne(User, {
        id: createResponse.id,
      });
      expect(foundCreatedUser.name).equal('test');

      const { body: getUserResponse } = await request
      .get(`/api/users/${createResponse.id}`)
      .set('x-auth', token)
      .expect(StatusCode.ok);

      expect(getUserResponse.email).equal('test-user+1@panenco.com');

      const { body: updateUserResponse } = await request
      .patch(`/api/users/${getUserResponse.id}`)
      .send({
        name: 'test2'
      })
      .set('x-auth', token)
      .expect(StatusCode.ok);

      expect(updateUserResponse.name).equal('test2');

      const { body: searchUserResponse } = await request
      .get(`/api/users?search=${updateUserResponse.name}`)
      .set('x-auth', token)
      .expect(StatusCode.ok);

      expect(searchUserResponse.items).to.be.an('array').that.is.not.empty;

      // Delete user
      const { body: deleteUserResponse } = await request
      .delete(`/api/users/${updateUserResponse.id}`)
      .set('x-auth', token)
      .expect(StatusCode.noContent);
    })
  });
});
