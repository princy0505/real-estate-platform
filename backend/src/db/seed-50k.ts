import { query, pool } from './pool';

async function seed() {
  console.log('🌱 Starting 50k seed...');
  const startTime = Date.now();

  // Check if any user exists (need owner for properties)
  const userCheck = await query<{ id: string }>(`SELECT id FROM users LIMIT 1`);
  let ownerId: string;

  if (userCheck.rowCount === 0) {
    console.log('⚠️  No users found. Creating dummy owner...');
    const newUser = await query<{ id: string }>(
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

  // Insert 50,000 properties
  console.log('📦 Inserting 50,000 properties...');
  await query(
    `
    INSERT INTO properties (
      owner_id, title, description, city, location, property_type,
      price, bedrooms, bathrooms, area_sqft, images, status
    )
    SELECT
      $1,
      'Property ' || gs,
      'Beautiful property in prime location. Number ' || gs,
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

  // Verify
  const count = await query<{ count: string }>(`SELECT COUNT(*) FROM properties`);
  console.log(`📊 Total properties: ${count.rows[0].count}`);

  // Benchmark
  console.log('\n⚡ Benchmarking filter query...');
  const benchStart = Date.now();
  await query(
    `SELECT id, title FROM properties
     WHERE city = 'Mumbai' AND property_type = 'APARTMENT'
       AND price BETWEEN 1000000 AND 5000000 AND status = 'ACTIVE'
     ORDER BY created_at DESC LIMIT 12`
  );
  console.log(`⚡ Filter query: ${Date.now() - benchStart}ms`);

  console.log('\n🎉 Seed complete!');
  await pool.end();
}

seed().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});