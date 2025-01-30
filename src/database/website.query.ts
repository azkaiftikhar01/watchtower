const get_websites = () => `SELECT id,url FROM websites;`;
const store_website_stats = (websiteId: number,  stats: object) => `
  INSERT INTO website_stats (website_id, stats)
  VALUES (${websiteId},  '${JSON.stringify(stats)}'::jsonb) returning id;
`;

  interface Param {
    url?: string;
  }
  
  const get_stats_q = (url:string) => `
    SELECT ws.website_id, w.url,ws.stats
    FROM website_stats ws
    JOIN websites w
    ON ws.website_id = w.id
    --${url && url !== "" ? `WHERE w.url = '${url}'` : ""}
  `;

export {get_websites,store_website_stats,get_stats_q};