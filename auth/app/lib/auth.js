async function signIn(username, password) {
  const config = require("../config/auth.config");
  const db = require("../models");
  const User = db.user;

  var jwt = require("jsonwebtoken");
  var bcrypt = require("bcryptjs");

  var user = await User.findOne({
    username: username,
  });

  console.log(user);

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

    console.log(user);
    console.log("attempts");
    console.log(user.attempts.length);
    if (user.attempts.length >= process.env.MAX_ATTEMPTS - 1) {
      console.log(now.getTime() - new Date(user.attempts[0]).getTime());

      if (
        now.getTime() - new Date(user.attempts[0]).getTime() <=
        process.env.MAX_ATTEMPTS_TIME * 60 * 1000
      ) {
        console.log("a1");
        user.block = true;
        await user.save();
      }
    }
    console.log("a2");
    console.log(user.attempts);

    user.attempts.push(now);

    if (user.attempts.length >= process.env.MAX_ATTEMPTS) {
      user.attempts = user.attempts.slice(-process.env.MAX_ATTEMPTS + 1);
    }

    console.log("a4");
    await user.save();

    console.log("a3");
    console.log(user.attempts);

    return {
      success: false,
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
