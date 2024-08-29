import express from "express";
import { deleteUrl, getUrl, postUrl } from "../controllers/urlController.js";

const router = express.Router();

router.post("/websites", postUrl);
router.get("/websites", getUrl);
router.delete("/websites/:id", deleteUrl);

export default router;
