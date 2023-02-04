import { updatePost } from './../../controllers/posts/handlers/update.handler';
import { v4 } from 'uuid';
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { expect } from "chai";
import { PostBody } from "../../contracts/bodies/post.pody";
import { createPost } from "../../controllers/posts/handlers/create.handler"
import { deletePost } from "../../controllers/posts/handlers/delete.handler";
import { Post } from "../../entities/post.entity";
import { User } from "../../entities/user.entity";
import ormConfig from "../../orm.config";
import { getPost } from '../../controllers/posts/handlers/getPost.handler';
import { getUserPosts } from '../../controllers/posts/handlers/getUserPosts.handler';

const postFixtures: Post[] = [
  {
    title: 'title 1',
    text: 'text 1 post',
  } as Post,
  {
    title: 'title 2',
    text: 'text 2 post',
  } as Post
];

describe('Handler tests', () => {
  describe('Post Tests', () => {
    let orm: MikroORM<PostgreSqlDriver>;
    let posts: Post[];
    let authorId: string;

    before(async () => {
      orm = await MikroORM.init(ormConfig);
    });

    beforeEach(async () => {
      await orm.em.execute(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
      await orm.getMigrator().up();
      const em = orm.em.fork();
      const user = await em.create(User, {
        name: 'Test',
        email: 'test@mail.com',
        password: 'strongpasswordddddd'
      })
      authorId = user.id;
      posts = postFixtures.map((post) => em.create(Post, { ...post, authorId }));
      await em.persistAndFlush(posts);
      
    });

    it('Should create post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const postBody = {
          title: 'test title',
          text: 'post test text'
        }
        const res = await createPost(postBody, authorId);
        expect(res.title).equal(postBody.title); 
        expect(res.text).equal(postBody.text); 
      })
    });

    it('Should fail due to body validation', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const postBody = {
          title: 's',
        }
        try {
          await createPost(postBody as PostBody, authorId);
        } catch (error) {
          expect(error.message).exist;
          return;
        }
        expect(true, 'should have thrown an error').false;
      })
    });

    it('Should delete post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const postToDeleteId = posts[0].id;
        const initialPostsCount = await orm.em.count(Post);
        await deletePost(postToDeleteId);

        const newPostsCount = await orm.em.count(Post);
        console.log(newPostsCount, initialPostsCount)
        expect(initialPostsCount - 1).equal(newPostsCount);
      });
    });

    it('Should`nt delete post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        try {
          await deletePost(v4())
        } catch (err) {
          expect(err.message).exist;
        }
      });
    });

    it('Should get specific post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const res = await getPost(posts[0].id);
        expect(res.text).equal(posts[0].text);
      })
    });

    it('Shouldn`t get specific post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        try {
          await getPost(v4())
        } catch (err) {
          expect(err.message).exist;
        }
      })
    });

    it('Should get posts list related to user', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const [posts, count] = await getUserPosts(authorId);
        expect(posts).to.be.an('array');
        expect(count).equal(posts.length);
      })
    });

    it('Shouldn`t get posts list of fake user', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        try {
          await getUserPosts(v4())
        } catch (err) {
          expect(err.message).exist;
        }
      })
    });

    it('Should update post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        const postBody = {
          title: 'updated title'
        }
        const res = await updatePost(posts[0].id, postBody as PostBody);
        
        expect(res.title).equal(postBody.title);
        expect(res.authorId).exist;
      })
    });

    it('Shouldn`t update fake post', async () => {
      await RequestContext.createAsync(orm.em.fork(), async () => {
        try {
          await updatePost( v4(), {} as PostBody)
        } catch (err) {
          expect(err.message).exist;
        }
      })
    });
  });
});
