exports.signin = async (req, res) => {
  const auth = require("../lib/auth");
  const result = await auth.signIn(req.body.username, req.body.password);

  if (result.success) {
    return res.status(200).send({
      user: {
        _id: result.user._id,
        username: result.user.username,
        lastAttempt: result.user.lastAttempt,
        attempt: result.user.attempt,
      },
      accessToken: result.accessToken,
    });
  } else {
    return res.status(404).send({ message: result.message });
  }
};
