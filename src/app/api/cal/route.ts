
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from '@vercel/postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Connection URL from environment variable
  ssl: {
    rejectUnauthorized: false, // Only if your database requires SSL
  },
});

interface PricingResult {
  base_distance_in_km: number;
  km_price: number;
  fix_price: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { zone, organization_id, total_distance, item_type } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query<PricingResult>({
      text: `SELECT base_distance_in_km, km_price, fix_price
             FROM Pricing
             WHERE organization_id = $1 AND zone = $2 AND item_id = (SELECT id FROM Item WHERE type = $3)`,
      values: [organization_id, zone, item_type]
    });
    client.release(); // Release the client back to the pool

    const { base_distance_in_km, km_price, fix_price } = result.rows[0];
    
    let totalPrice = fix_price;
    if (total_distance > base_distance_in_km) {
      totalPrice += (total_distance - base_distance_in_km) * km_price;
    }

    // Convert price to cents to avoid decimal issues
    totalPrice *= 100;

    res.json({ total_price: totalPrice });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
