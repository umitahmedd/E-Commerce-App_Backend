const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "shopxpress",
});

module.exports = client;
