db = db.getSiblingDB("auth_db");

db.createCollection("users");

db.users.insertOne({
  username: "testuser",
  password: "testpassword",
  lastAttempt: new Date().toISOString().replace(/T/, " ").replace(/\..+/, ""),
  attempt: 0,
});
