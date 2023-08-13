db = db.getSiblingDB("auth_db");

db.createCollection("users");

db.users.insertOne({
  username: "testuser",
  password: "$2a$08$67Bh9phEScbi9dY1osP1keLNR.K3VMHzVtWZnWYGsQ3srSq2isk0u",
  block: false,
  attempts: [],
});
