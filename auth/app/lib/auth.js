async function signIn(username, password) {
  const config = require("../config/auth.config");
  const db = require("../models");
  const User = db.user;

  var jwt = require("jsonwebtoken");
  var bcrypt = require("bcryptjs");

  var user = await User.findOne({
    username: username,
  });

  if (!user) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  if (user.block) {
    return {
      success: false,
      message: "User is block.",
    };
  }

  // Check password
  var passwordIsValid = bcrypt.compareSync(password, user.password);

  if (!passwordIsValid) {
    const now = new Date();

    if (user.attempts.length >= process.env.MAX_ATTEMPTS - 1) {
      if (
        now.getTime() - new Date(user.attempts[0]).getTime() <=
        process.env.MAX_ATTEMPTS_TIME * 60 * 1000
      ) {
        user.block = true;
        await user.save();
      }
    }

    user.attempts.push(now);

    if (user.attempts.length >= process.env.MAX_ATTEMPTS) {
      user.attempts = user.attempts.slice(-process.env.MAX_ATTEMPTS + 1);
    }

    await user.save();

    return {
      success: false,
      attempts: user.attempts,
      message: "Invalid Password!",
    };
  }

  const token = jwt.sign({ id: user.id }, config.secret, {
    algorithm: "HS256",
    allowInsecureKeySizes: true,
    expiresIn: 86400, // 24 hours
  });

  var authorities = [];
  return {
    success: true,
    user: user,
    accessToken: token,
  };
}

module.exports.signIn = signIn;
