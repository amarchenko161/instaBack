const User = require('./models/User')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret } = require("./config");

const generateAccessToken = (id) => {
  const payload = { id };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
  async registration(req, res) {

    const hashPassword = bcrypt.hashSync(req.body.password, 6);
    const user = new User({
      username: req.body.username,
      password: hashPassword,
      email: req.body.email,
      fileUpload: req.file,
    });

    User.findOne({ email: req.body.email } || { username: req.body.username }).then((result) => {
      if (result) {
        return res.status(400).json({ message: 'User already exist' })
      } else {
        user.save().then((result) => {
          const token = generateAccessToken(result._id);
          res.send({ data: result, token });
          res.json({ image: req.file.path })
          return res.json({ message: 'User has been created' })
        });
      }
    });
  }

  async login(req, res) {
    if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password")) {
      User.findOne({ email: req.body.email }).then((result) => {
        console.log({ result }, "point");
        if (result) {

          const checkPassword = bcrypt.compareSync(
            req.body.password,
            result.password
          );
          if (!checkPassword) {

            res.status(404).send("Invalid password");
          } else {
            const token = generateAccessToken(result._id);
            console.log({ token });
            res.send(token);
          }
        } else {
          res.status(404).send("Username does not exist");
        }
      });
    } else {
      res.status(404).send("Login error");
    }
  }

  async getUsers(req, res) {
    try {
      res.json("server work")
    } catch (e) {

    }
  }
}

module.exports = new authController()