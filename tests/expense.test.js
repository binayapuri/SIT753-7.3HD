const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

describe('Expense App API Tests', () => {
  
  describe('GET /', () => {
    it('should serve the main page', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.type).to.equal('text/html');
    });
  });

  describe('GET /expenses', () => {
    it('should return expenses array', async () => {
      const res = await request(app).get('/expenses');
      expect(res.status).to.equal(200);
      // Your API returns { data: [...] }, so check for that structure
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('POST /expenses', () => {
    it('should create a new expense', async () => {
      const newExpense = {
        title: 'Test Expense',
        amount: 50
      };
      
      const res = await request(app)
        .post('/expenses')
        .send(newExpense);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });

    it('should reject expense without title', async () => {
      const invalidExpense = {
        amount: 50
      };
      
      const res = await request(app)
        .post('/expenses')
        .send(invalidExpense);
      
      // Expect 400 (Bad Request) for validation error
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('DELETE /expenses/:id', () => {
    it('should handle delete requests', async () => {
      // This will test the endpoint exists
      const res = await request(app)
        .delete('/expenses/507f1f77bcf86cd799439011');
      
      // Expect either success or 404, not server error
      expect([200, 404]).to.include(res.status);
    });
  });
});