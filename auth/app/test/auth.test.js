describe("Auth Controller signin()", () => {
  const auth = require("../lib/auth.js");
  const db = require("../models");
  const User = db.user;
  var bcrypt = require("bcryptjs");

  beforeAll(async () => {
    db.mongoose.connect(
      `mongodb://mongodb:${process.env.MONGODB_DOCKER_PORT}/${process.env.MONGODB_DATABASE}`,
      {
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASSWORD,
        authSource: "admin",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    await User.create({
      username: "testuser1",
      password: bcrypt.hashSync("testpass1", 8),
      block: false,
      attemps: [],
    });
  });

  afterAll(async () => {
    await User.deleteOne({ username: "testuser1" });
    db.mongoose.connection.close();
  });

  test("Login with normal account", async () => {
    const data = await auth.signIn("testuser1", "testpass1");
    expect(data.success).toBe(true);
  });

  test("Login with wrong username", async () => {
    const data = await auth.signIn("testuserx", "testpass1");
    expect(data.success).toBe(false);
  });

  test("Login with wrong password", async () => {
    const data = await auth.signIn("testuser1", "testpassx");
    expect(data.success).toBe(false);
    expect(data.attempts.length).toBe(1);
  });

  test("Login with blocked user", async () => {
    await User.create({
      username: "testuser2",
      password: bcrypt.hashSync("testpass2", 8),
      block: true,
      attemps: [],
    });

    const data = await auth.signIn("testuser2", "testpass2");
    expect(data.success).toBe(false);

    await User.deleteOne({ username: "testuser2" });
  });

  test("Login with 3 fail attempts", async () => {
    await User.create({
      username: "testuser3",
      password: bcrypt.hashSync("testpass3", 8),
      block: true,
      attemps: [],
    });

    await auth.signIn("testuser3", "testpassx");
    await auth.signIn("testuser3", "testpassx");
    await auth.signIn("testuser3", "testpassx");

    var user = await User.findOne({
      username: "testuser3",
    });
    expect(user.block).toBe(true);

    const data = await auth.signIn("testuser2", "testpassx");

    expect(data.success).toBe(false);

    await User.deleteOne({ username: "testuser3" });
  });

  test("Login with 3 fail attempts more than 5 minutes", async () => {
    await User.create({
      username: "testuser4",
      password: bcrypt.hashSync("testpass4", 8),
      block: false,
      attemps: [
        new Date(new Date().setDate(new Date().getDate() - 2)),
        new Date(new Date().setDate(new Date().getDate() - 1)),
      ],
    });

    await auth.signIn("testuser4", "testpassx");

    var user = await User.findOne({
      username: "testuser4",
    });

    expect(user.block).toBe(false);

    await User.deleteOne({ username: "testuser4" });
  });
});
