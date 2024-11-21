import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Category } from '../src/book/schemas/book.schema';

describe('Book & Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(async () => {
    try {
        // Connect to the database
        await mongoose.connect(process.env.DB_URI as string);

        // Drop the database after connection is established
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully');
    } catch (error) {
        console.error('Error during database setup:', error);
        throw error; // Fail the tests if setup fails
    }
});


  afterAll(() => mongoose.disconnect());

  const user = {
    name: 'Ghulam',
    email: 'ghulam@gmail.com',
    password: '12345678',
  };

  const newBook = {
    title: 'New Book',
    description: 'Book Description',
    author: 'Author',
    price: 100,
    category: Category.FANTASY,
  };

  let jwtToken: string = '';
  let bookCreated;

  describe('Auth', () => {
    it('(POST) - Register a new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/signUp')
        .send(user)
        .expect(201)
        .then((res) => {
          expect(res.body.token).toBeDefined();
        });
    });

    it('(GET) - Login user', async () => {
      return request(app.getHttpServer())
        .get('/auth/logIn')
        .send({ email: user.email, password: user.password })
        .expect(200)
        .then((res) => {
          expect(res.body.token).toBeDefined();
          jwtToken = res.body.token;
        });
    });
  });

  describe('Book', () => {
    it('(POST) - Create new Book', async () => {
      return request(app.getHttpServer())
        .post('/book')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newBook)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.title).toEqual(newBook.title);
          bookCreated = res.body;
        });
    });

    it('(GET) - Get all Books', async () => {
      return request(app.getHttpServer())
        .get('/book')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
    });

    it('(GET) - Get a Book by ID', async () => {
      return request(app.getHttpServer())
        .get(`/book/${bookCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toEqual(bookCreated._id);
        });
    });

    it('(PUT) - Update a Book by ID', async () => {
      const book = { title: 'Updated name' };
      return request(app.getHttpServer())
        .put(`/book/${bookCreated?._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(book)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.title).toEqual(book.title);
        });
    });

    it('(DELETE) - Delete a Book by ID', async () => {
      const res = await request(app.getHttpServer())
          .delete(`/book/${bookCreated?._id}`)
          .set('Authorization', 'Bearer ' + jwtToken)
          .expect(200);
  
      expect(res.body._id).toBeDefined();
      expect(res.body.deleted).toEqual(true);
  });
  
    
  });
});