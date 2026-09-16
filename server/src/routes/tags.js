import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /tags — reusable tags, most-used first for fast workout logging.
router.get("/", async (_req, res) => {
  try {
    const tags = await prisma.workoutTag.findMany({
      include: { _count: { select: { sessions: true } } },
    });

    res.json(
      tags
        .map(({ _count, ...tag }) => ({ ...tag, usedCount: _count.sessions }))
        .sort((a, b) => b.usedCount - a.usedCount || a.name.localeCompare(b.name))
    );
  } catch (error) {
    console.error("list tags failed:", error);
    res.status(500).json({ error: "Could not load tags." });
  }
});

export default router;
