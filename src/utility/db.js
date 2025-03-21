// Подпрограмма (utilityProcess) для работы с базой данных
const { Pool } = require("pg");
require("dotenv").config();
const { generateString, generateAge } = require("./generate-data.js");

let pool; // переменная пула подключения к базе данных для глобального доступа

// Подключение к базе данных
function connectAndGetPool() {
  return new Pool({
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    host: process.env.VITE_DB_HOST,
    port: process.env.VITE_DB_PORT,
    database: process.env.VITE_DB_DATABASE
  });
}

// Генерация данных
// Функция асинхронная, для того, чтобы точно убедится, что все данные получены
// и только потом можно делать другие запросы
async function generateData(pool, rowsNumber) {
  const queries = [];
  for (let i = 0; i < rowsNumber; i++) {
    const name = generateString(10);
    const description = generateString(20);
    const age = generateAge(100);
    queries.push(
      pool.query(`INSERT INTO data_example (name, description, age) VALUES ($1, $2, $3)`, [
        name,
        description,
        age
      ])
    );
  }
  await Promise.all(queries);
}

// Обработка сообщений из потока main
process.parentPort.on("message", (message) => {
  switch (message.data.type) {
    // Обработка начального соединения
    case "start-connection":
      pool = connectAndGetPool();
      pool.query("SELECT NOW()", (err, res) => {
        if (err) process.parentPort.postMessage({ type: "db-error", error: err });
        else
          process.parentPort.postMessage({
            type: "db-connection-success",
            info: `connected to db at ${res.rows[0].now}`
          });
      });
      break;
    // Обработка генерации данных
    case "generate-data":
      generateData(pool, message.data.number).then(() => {
        process.parentPort.postMessage({ type: "db-generate-success", info: "data generated" });
      });
      break;
    // Обработка очистки данных
    case "clear-data":
      pool.query("TRUNCATE data_example RESTART IDENTITY", (err) => {
        if (err) process.parentPort.postMessage({ type: "db-error", error: err });
        else process.parentPort.postMessage({ type: "db-clear-success", info: "data cleared" });
      });
      break;
    // Обработка получения данных
    case "get-data":
      pool.query("SELECT * FROM data_example ORDER BY id", (err, res) => {
        if (err) process.parentPort.postMessage({ type: "db-error", error: err });
        else process.parentPort.postMessage({ type: "db-get-data", data: res.rows });
      });
      break;
  }
});
