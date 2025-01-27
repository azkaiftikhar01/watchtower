import axios from "axios";
import { config } from "../config/env";

export const fetchPageSpeedData = async (url: string) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${config.PAGESPEED_API_KEY}`
    );

    const json = response.data;
    const cleanedResponse = {
      url: json.id,
      fetchTime: json.lighthouseResult.fetchTime,
      performance: json.lighthouseResult.categories.performance
    };

    return cleanedResponse;  

  } catch (error) {
    console.error("Error fetching PageSpeed data:", error);
    throw new Error("Failed to fetch website statistics");
  }
};
