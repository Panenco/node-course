import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { StatusCode } from "@panenco/papi";
import { expect } from "chai";
import supertest from "supertest";
import { App } from "../../app";

describe('Integration tests', () => {
  describe('Post tests', () => {
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

    it('CRUD post', async () => {
      // create user
      const { body: userCreation } = await request
      .post(`/api/users`)
      .send({
        name: 'test',
        email: 'test-user+1@panenco.com',
        password: 'real secret stuff',
      })
      .expect(StatusCode.ok);

      // login
      const { body: loginResponse } = await request
      .post('/api/auth/login')
      .send({ email: 'test-user+1@panenco.com', password: 'real secret stuff' })
      .expect(StatusCode.ok);
      const token = loginResponse.token;

      // create post
      const { body: createResponse } = await request
      .post('/api/posts')
      .send({ title: 'Post title', text: 'Post text' })
      .set('x-auth', token)
      .expect(StatusCode.created);

      expect(createResponse.title).equal('Post title');

      // find created post
      const { body: getResponse } = await request
      .get(`/api/posts/${createResponse.id}`)
      .set('x-auth', token)
      .expect(StatusCode.ok);

      expect(getResponse.id).equal(createResponse.id);

      // get user posts
      const { body: getListResponse } = await request
      .get('/api/posts')
      .set('x-auth', token)
      .expect(StatusCode.ok);

      expect(getListResponse.items.some((post) => post.title === 'Post title')).true;

      // update created post
      const { body: updateResponse } = await request
      .patch(`/api/posts/${createResponse.id}`)
      .send({ title: 'Updated title' })
      .set('x-auth', token)
      expect(StatusCode.ok);

      expect(updateResponse.title).equal('Updated title');

      // delete created post
      const { body: deleteResponse } = await request
      .delete(`/api/posts/${createResponse.id}`)
      .set('x-auth', token)
      .expect(StatusCode.noContent);
    })
  })
})