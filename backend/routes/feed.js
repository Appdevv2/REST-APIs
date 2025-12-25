const express = require("express");

const { check, body } = require("express-validator");

const router = express.Router();

const feedController = require("../controllers/feed");

const authMiddleware = require("../middleware/is-auth");

router.get("/posts", authMiddleware, feedController.getFeed);

router.post(
  "/posts",
  authMiddleware,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/posts/:postId", feedController.getPostById);

router.put(
  "/posts/:postId",
  authMiddleware,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/posts/:postId", authMiddleware, feedController.deletePost);

module.exports = router;
