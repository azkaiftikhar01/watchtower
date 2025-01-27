import { Elysia } from "elysia";
import { fetchAndStoreWebsiteStats } from "../controller/website.controller";

const router = new Elysia();

router.post("/fetch-stats", async () => {
  await   fetchAndStoreWebsiteStats();
  return { message: "Response Stored Successfully." };
});

export default router;

