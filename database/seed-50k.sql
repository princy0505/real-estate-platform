import 'dotenv/config';
import { pool } from './pool';

async function seed() {
  console.log('🌱 Starting 50k seed...');

  // Step 1: Make sure at least one user exists (owner)
  const userCheck = await pool.query(`SELECT id FROM users LIMIT 1`);
  let ownerId: string;

  if (userCheck.rowCount === 0) {
    console.log('⚠️  No users found. Creating a dummy owner...');
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['Seed Owner', 'seed-owner@example.com', 'dummy-hash']
    );
    ownerId = newUser.rows[0].id;
  } else {
    ownerId = userCheck.rows[0].id;
  }

  console.log(`✅ Using owner ID: ${ownerId}`);

  // Step 2: Insert 50,000 properties using generate_series
  console.log('📦 Inserting 50,000 properties...');
  const startTime = Date.now();

  await pool.query(
    `
    INSERT INTO properties (
      owner_id, title, description, city, location, property_type,
      price, bedrooms, bathrooms, area_sqft, images, status
    )
    SELECT
      $1,
      'Property ' || gs,
      'Beautiful property in prime location. Property number ' || gs,
      (ARRAY['Mumbai','Bangalore','Delhi','Chennai','Hyderabad','Pune','Kolkata'])[1 + (gs % 7)],
      'Location ' || (gs % 500),
      (ARRAY['APARTMENT','VILLA','HOUSE','PLOT','OFFICE','SHOP']::property_type[])[1 + (gs % 6)],
      1000000 + (gs * 12345) % 50000000,
      1 + (gs % 5),
      1 + (gs % 4),
      500 + (gs * 7) % 3000,
      '{}',
      'ACTIVE'
    FROM generate_series(1, 50000) AS gs
    `,
    [ownerId]
  );

  const elapsed = Date.now() - startTime;
  console.log(`✅ 50,000 properties inserted in ${elapsed}ms`);

  // Step 3: Verify count
  const count = await pool.query(`SELECT COUNT(*) FROM properties`);
  console.log(`📊 Total properties in DB: ${count.rows[0].count}`);

  // Step 4: Benchmark query
  console.log('\n⚡ Benchmarking filter query...');
  const benchStart = Date.now();
  await pool.query(
    `
    SELECT id, title, city, price
    FROM properties
    WHERE city = 'Mumbai'
      AND property_type = 'APARTMENT'
      AND price BETWEEN 1000000 AND 5000000
      AND status = 'ACTIVE'
    ORDER BY created_at DESC, id DESC
    LIMIT 12
    `
  );
  const benchElapsed = Date.now() - benchStart;
  console.log(`⚡ Filter query took: ${benchElapsed}ms`);

  // Step 5: Benchmark cursor pagination
  console.log('\n⚡ Benchmarking cursor pagination...');
  const pageStart = Date.now();
  await pool.query(
    `
    SELECT id, title, created_at
    FROM properties
    WHERE status = 'ACTIVE'
    ORDER BY created_at DESC, id DESC
    LIMIT 12
    `
  );
  const pageElapsed = Date.now() - pageStart;
  console.log(`⚡ Pagination query took: ${pageElapsed}ms`);

  console.log('\n🎉 Seed complete!');
  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});