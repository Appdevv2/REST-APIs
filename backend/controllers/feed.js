const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const { validationResult } = require("express-validator");

const LIMIT_PER_PAGE = 2;

exports.getFeed = (req, res, next) => {
  const page = req.query.page || 1;
  let totalItems;

  Post.countDocuments()
    .then((count) => {
      totalItems = count;
      Post.find()
        .skip((page - 1) * LIMIT_PER_PAGE)
        .limit(LIMIT_PER_PAGE)
        .then((posts) => {
          if (!posts) {
            return res
              .status(404)
              .json({ message: "No post yet please add some" });
          }
          res.status(200).json({
            message: "feed fetched successfully",
            posts: posts,
            // currentPage: page,
            // nextPage: page + 1,
            // previousPage: page - 1,
            totalItems: totalItems,
          });
        })
        .catch((err) => console.log("err", err));
    })
    .catch((err) => {
      console.log("err", err);
    });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const image = req.file;
  const creator = req.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  if (!image) {
    return res.status(422).json({ message: "No image provided" });
  }

  const imageUrl = `images/${req.file.filename}`;

  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: creator,
  });

  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((err) => {
      console.log("error", err);
    });
};

exports.getPostById = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found by given id" });
      }
      res.status(200).json({ message: "post find", post: post });
    })
    .catch((err) => {
      console.log("err", err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  console.log("imageUrl", imageUrl);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  if (req.file) {
    imageUrl = `images/${req.file.filename}`;
  }

  if (!imageUrl) {
    return res.status(422).json({ message: "No image provided" });
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found by given id" });
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch((err) => {
      console.log("err", err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found by given id" });
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(post._id);
    })
    .then((result) => {
      return res.status(200).json({ message: "Post Deleted" });
    })
    .catch((err) => console.log("err", err));
};

const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, (err) => {
    console.log(err);
  });
};
