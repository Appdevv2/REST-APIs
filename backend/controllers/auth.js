const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.signUp = (req, res, next) => {
  console.log("req", req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty) {
    return res.status(422).json({ message: "Please fill the required fields" });
  }

  const { email, password, name } = req.body;
  console.log("email,pass,name", email, name, password);
  bcrypt
    .hash(password, 12)
    .then((hashPass) => {
      const user = new User({
        email: email,
        password: hashPass,
        name: name,
      });
      user.save().then((result) => {
        res.status(201).json({ message: "User created" });
      });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).json({ message: "Server error" });
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "User not found!!" });
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        return res.status(401).json({ message: "Wrong password" });
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      console.log("err", err);
    });
};
