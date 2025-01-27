const get_websites = () => `SELECT id,url FROM websites;`;
const store_website_stats = (websiteId: number,  stats: object) => `
  INSERT INTO website_stats (website_id, stats)
  VALUES (${websiteId},  '${JSON.stringify(stats)}'::jsonb) returning id;
`;
export {get_websites,store_website_stats};