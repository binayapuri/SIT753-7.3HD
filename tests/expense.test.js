const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

describe('Expenses API', () => {
  it('GET /expenses should return an array', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });
});
