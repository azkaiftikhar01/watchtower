import { get_stats_q, get_websites, store_website_stats } from "../database/website.query";
import { fetchPageSpeedData } from "../services/pagespeed.service";
import pg from "pg";
import { config } from "../config/env";
import CircularJSON from "circular-json";
import NodeCache from "node-cache";
import { pool } from "../config/db";
const cache = new NodeCache({ stdTTL: 0 });
const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});
export const fetchAndStoreWebsiteStats = async () => {
    try {
      const client = await pool.connect(); 
    
      const query = get_websites(); 
      const websites = await client.query(query);
      await Promise.allSettled(
        websites.rows.map(async (website) => {
          try {
            const stats = await fetchPageSpeedData(website.url);
            const safeStats = CircularJSON.stringify(stats);
            await client.query(store_website_stats(website.id, safeStats));
            console.log(`Successfully stored stats for: ${website.url}`);
          } catch (innerError) {
            console.error(`Failed to process ${website.url}:`, innerError);
          }
        })
      );
  
      return true;
    } catch (error) {
      console.error("Error fetching and storing stats:", error);
    }
  };
  export const get_states = async (param: Param) => {
    try {
      const client = await pool.connect(); 
      const query = get_stats_q(param);
      const stats = await client.query(query);
      if (stats.rows.length > 0) {
        
        const parsedStats = stats.rows.map(row => {
          return {
            ...row,
            stats: row.stats ? JSON.parse(row.stats) : null 
          };
        });

        return parsedStats;
      } else {
        console.log("No data found");
        return [];
      }
    } catch (error) {
      console.error("Error fetching and storing stats:", error);
      return { message: "Error fetching stats", error: error.message };
    } finally {
      await client.end(); // Make sure to close the client connection
    }
  };
