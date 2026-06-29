const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');

test('GET /products/1 returns the expected product payload', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/1');

  expect(response.status()).toBe(200);

  const body = await response.json();
  const requiredKeys = ['id', 'title', 'price', 'category', 'description'];

  for (const key of requiredKeys) {
    expect(body, `Expected response to contain key: ${key}`).toHaveProperty(key);
  }

  expect(body).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      title: expect.any(String),
      price: expect.any(Number),
      category: expect.any(String),
      description: expect.any(String),
    })
  );

  const ajv = new Ajv({ allErrors: true });
  const schema = {
    type: 'object',
    required: requiredKeys,
    properties: {
      id: { type: 'number' },
      title: { type: 'string' },
      price: { type: 'number' },
      category: { type: 'string' },
      description: { type: 'string' },
    },
    additionalProperties: true,
  };

  const validate = ajv.compile(schema);
  const isValid = validate(body);

  expect(isValid, JSON.stringify(validate.errors, null, 2)).toBe(true);

  console.log(`Product title: ${body.title}`);
  console.log(`Product price: ${body.price}`);
});
