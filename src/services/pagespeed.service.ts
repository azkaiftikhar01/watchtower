import axios from "axios";
import { config } from "../config/env";
export const fetchPageSpeedData = async (url: string) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${config.PAGESPEED_API_KEY}`
    );

    const json = response.data;
   // console.log("API Response:", JSON.stringify(json, null, 2)); // Log the entire response

    // Check if the required fields exist
    if (!json.lighthouseResult || !json.lighthouseResult.categories) {
      throw new Error("Invalid API response structure");
    }
    //console.log(json.lighthouseResult.categories)
    const performanceScore = json.lighthouseResult.categories.performance?.score ;
    const largest_contentful_paint = json.originLoadingExperience.metrics["LARGEST_CONTENTFUL_PAINT_MS"].percentile/1000 ; 
    const interaction_to_next_paint=json.originLoadingExperience.metrics["INTERACTION_TO_NEXT_PAINT"].percentile/1000;
    const cumulative_shift_layout = json.lighthouseResult.audits["cumulative-layout-shift"].score/1000 ;
    const first_contentful_paint = json.originLoadingExperience.metrics["LARGEST_CONTENTFUL_PAINT_MS"].percentile/1000 ;
    const time_to_first_bite=json.originLoadingExperience.metrics["EXPERIMENTAL_TIME_TO_FIRST_BYTE"].percentile/1000;
    const speed_index = json.lighthouseResult.audits["speed-index"].displayValue ;
    const total_blocking_time = json.lighthouseResult.audits["total-blocking-time"].numericValue/1000 ;
    const cleanedResponse = {
      url: json.id,
      fetchTime: json.lighthouseResult.fetchTime,
      performanceScore,
      largest_contentful_paint,
      interaction_to_next_paint,
      cumulative_shift_layout,
      first_contentful_paint,
      time_to_first_bite,
      speed_index
      //total_blocking_time
    };
    return cleanedResponse;
  } catch (error) {
    console.error("Error fetching PageSpeed data:", error);
    throw new Error("Failed to fetch website statistics");
  }
};
import fetch from "node-fetch";

const API_KEY = process.env.SEARCH_API_KEY; 
const CX = process.env.CX; 
const query = "site:.gov.pk"; 
const MAX_PAGES = 40; 
const RESULTS_PER_PAGE = 10;
import { pool } from "../config/db";
import pg from "pg";
import { store_websites } from "../database/website.query";

const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});
export const searchAndStoreGovPkWebsites = async () => {
  const client = await pool.connect();
  let allWebsites = new Set<string>(); // Using Set to avoid duplicates

  for (let page = 0; page < MAX_PAGES; page++) {
    const startIndex = page * RESULTS_PER_PAGE + 1; // 1, 11, 21, ..., 91
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${API_KEY}&cx=${CX}&start=${startIndex}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.items) {
        console.log(`No results found on page ${page + 1}.`);
        break; // Stop if there are no more results
      }

      const websites = data.items.map((item: any) => {
        let hostname = new URL(item.link).hostname;
        return `https://${hostname}`; // Ensure "https://" is added
      });

      websites.forEach((site) => allWebsites.add(site));
    } catch (error) {
      console.error(`Error fetching page ${page + 1}:`, error);
      break; // Stop on error
    }
  }

  if (allWebsites.size === 0) {
    console.log("No new websites found.");
    return [];
  }

  const values = [...allWebsites].map((url) => `('${url}')`).join(", ");
  
  try {
    const result = await pool.query(store_websites(values));
    console.log(`Inserted ${result.rowCount} new websites.`);
    return result.rows.map((row) => row.id);
  } catch (error) {
    console.error("Error inserting websites:", error);
    throw error;
  } finally {
    client.release();
  }
};
