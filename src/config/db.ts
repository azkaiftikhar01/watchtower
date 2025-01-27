import { Client } from "pg";
import { config } from "./env";

const client = new Client({
  connectionString: config.DATABASE_URL,
});

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export default client;
