const get_websites = () => `SELECT id,url FROM websites;`;
const store_website_stats = (websiteId: number,  stats: object) => `
  INSERT INTO website_stats (website_id, stats)
  VALUES (${websiteId},  '${JSON.stringify(stats)}'::jsonb) returning id;
`;

  interface Param {
    url?: string;
  }
  
  const get_stats_q = (param: Param) => `
    SELECT ws.website_id, w.url,ws.stats
    FROM ${process.env.schema}.website_stats ws
    JOIN ${process.env.schema}.websites w
    ON ws.website_id = w.id
    ${param.url && param.url !== "" ? `WHERE w.url = '${param.url}'` : ""}
  `;

export {get_websites,store_website_stats,get_stats_q};