import { Elysia } from "elysia";
import { fetchAndStoreWebsiteStats, get_states } from "../controller/website.controller";

const router = new Elysia();

router.post("/store-stats", async () => {
  await   fetchAndStoreWebsiteStats();
  return { message: "Response Stored Successfully." };
});

router.get("/get-stats", async () => {
    return   get_states();
    return { message: "Response Stord Successfully." };
  });


export default router;

