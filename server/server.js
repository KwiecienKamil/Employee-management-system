const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ems",
});

app.get("/", (req, res) => {
  return res.json("From server");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "SELECT * FROM pracownicy WHERE email = ? AND haslo = ?",
    [email, password],
    (err, result) => {
      if (err) {
        return res.send({ err: err });
      }

      if (result.length > 0) {
        return res.send(result);
      } else {
        return res.send({ message: "Wrong email/password" });
      }
    }
  );
});

app.listen(8081, () => {
  console.log("listening");
});
