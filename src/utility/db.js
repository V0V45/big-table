const { Pool } = require("pg");
require("dotenv").config();
const { generateString, generateAge } = require("./generate-data.js");

let pool;

function connectAndGetPool() {
  return new Pool({
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    host: process.env.VITE_DB_HOST,
    port: process.env.VITE_DB_PORT,
    database: process.env.VITE_DB_DATABASE
  });
}

function generateData(pool, rowsNumber) {
  for (let i = 0; i < rowsNumber; i++) {
    const name = generateString(10);
    const description = generateString(20);
    const age = generateAge(100);
    pool.query(`INSERT INTO data_example (name, description, age) VALUES ($1, $2, $3)`, [
      name,
      description,
      age
    ]);
  }
}

process.parentPort.on("message", (message) => {
  switch (message.data.type) {
    case "start-connection":
      process.parentPort.postMessage(`checking env: ${process.env.VITE_DB_USER}`);
      pool = connectAndGetPool();
      pool.query("SELECT NOW()", (err, res) => {
        if (err) process.parentPort.postMessage(`errorFromDb: ${err}`);
        else process.parentPort.postMessage(`connected to db at ${res.rows[0].now}`);
      });
      break;
    case "generate-data":
      generateData(pool, message.data.number);
      process.parentPort.postMessage(`data generated. rows: ${message.data.number}`);
      break;
    case "clear-data":
      pool.query("TRUNCATE data_example", (err) => {
        if (err) process.parentPort.postMessage(`errorFromDb: ${err}`);
        else process.parentPort.postMessage(`data cleared`);
      });
  }
});
