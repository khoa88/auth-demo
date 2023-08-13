const auth = require("../lib/auth.js");

describe("Auth Controller signin()", () => {
  const db = require("../models");
  const User = db.user;

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
  });

  afterAll(async () => {
    db.mongoose.connection.close();
  });

  test("Returns true if login success", async () => {
    const data = await auth.signIn("testuser", "testpassword");
    expect(data.success).toBe(true);
  }, 1000000);
});
