import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@vercel/postgres";

// Create a connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432, // Default PostgreSQL port
  ssl: {
    rejectUnauthorized: false, // Only if your database requires SSL
  },
});

interface PricingResult {
  base_distance_in_km: number;
  km_price: number;
  fix_price: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract parameters from request body
    const { zone, organization_id, total_distance, item_type } = req.body;

    // Validate input parameters
    if (!zone || !organization_id || !total_distance || !item_type) {
      throw new Error("Missing required parameters");
    }

    // Get a client from the pool
    const client = await pool.connect();

    // Query to fetch pricing information
    const result = await client.query<PricingResult>({
      text: `
        SELECT base_distance_in_km, km_price, fix_price
        FROM Pricing
        WHERE organization_id = $1 AND zone = $2
        AND item_id = (SELECT id FROM Item WHERE type = $3)
      `,
      values: [organization_id, zone, item_type],
    });

    // Release the client back to the pool
    client.release();

    // Calculate total price based on pricing information
    const { base_distance_in_km, km_price, fix_price } = result.rows[0];
    let totalPrice = fix_price;
    if (total_distance > base_distance_in_km) {
      totalPrice += (total_distance - base_distance_in_km) * km_price;
    }
    totalPrice *= 100; // Convert price to cents

    // Send response with calculated total price
    res.status(200).json({ total_price: totalPrice });
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
