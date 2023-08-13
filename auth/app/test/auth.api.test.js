process.env.NODE_DOCKER_PORT = process.env.NODE_DOCKER_TEST_PORT;
const request = require("supertest");
const app = require("../../server");

describe("POST /api/auth/signin", () => {
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

  it("Login with normal account", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      username: "testuser1",
      password: "testpass1",
    });

    expect(res.statusCode).toBe(200);
  });

  it("Login with wrong username", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      username: "testuserx",
      password: "testpass1",
    });

    expect(res.statusCode).toBe(404);
  });

  it("Login with wrong password", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      username: "testuser1",
      password: "testpassx",
    });

    expect(res.statusCode).toBe(404);
  });

  it("Login with blocked user", async () => {
    await User.create({
      username: "testuser2",
      password: bcrypt.hashSync("testpass2", 8),
      block: true,
      attemps: [],
    });

    const res = await request(app).post("/api/auth/signin").send({
      username: "testuser2",
      password: "testpass2",
    });

    expect(res.statusCode).toBe(404);

    await User.deleteOne({ username: "testuser2" });
  });

  it("Login with 3 fail attempts", async () => {
    await User.create({
      username: "testuser3",
      password: bcrypt.hashSync("testpass3", 8),
      block: true,
      attemps: [],
    });

    await request(app).post("/api/auth/signin").send({
      username: "testuser3",
      password: "testpassx",
    });

    await request(app).post("/api/auth/signin").send({
      username: "testuser3",
      password: "testpassx",
    });

    await request(app).post("/api/auth/signin").send({
      username: "testuser3",
      password: "testpassx",
    });

    var user = await User.findOne({
      username: "testuser3",
    });
    expect(user.block).toBe(true);

    const res = await request(app).post("/api/auth/signin").send({
      username: "testuser3",
      password: "testpass3",
    });

    expect(res.statusCode).toBe(404);

    await User.deleteOne({ username: "testuser3" });
  });

  it("Login with 3 fail attempts more than 5 minutes", async () => {
    await User.create({
      username: "testuser4",
      password: bcrypt.hashSync("testpass4", 8),
      block: false,
      attemps: [
        new Date(new Date().setDate(new Date().getDate() - 2)),
        new Date(new Date().setDate(new Date().getDate() - 1)),
      ],
    });

    await request(app).post("/api/auth/signin").send({
      username: "testuser4",
      password: "testpassx",
    });

    var user = await User.findOne({
      username: "testuser4",
    });

    console.log(user);

    expect(user.block).toBe(false);

    await User.deleteOne({ username: "testuser4" });
  });
});
