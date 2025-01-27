import { get_websites, store_website_stats } from "../database/website.query";
import { fetchPageSpeedData } from "../services/pagespeed.service";
import pg from "pg";
import { config } from "../config/env";
import CircularJSON from "circular-json";

const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});
export const fetchAndStoreWebsiteStats = async () => {
    try {
      await client.connect();
    
      const query = get_websites(); 
      const websites = await client.query(query);
  
      // Process all websites in parallel using Promise.allSettled
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
  