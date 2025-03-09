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

app.post("/userInfo", (req, res) => {
  const user_id = req.body.user_id;

  db.query(
    "SELECT p.imie, p.nazwisko, p.dzial, p.pensja, wl.start_time AS work_start_time,wl.end_time AS work_end_time, t.id AS task_id, t.opis AS task_description, t.status AS task_status, dr.produkt AS damage_product, dr.opis AS damage_description, dr.data_zgloszenia AS damage_report_date FROM pracownicy p LEFT JOIN work_logs wl ON p.id_pracownika = wl.user_id LEFT JOIN tasks t ON p.id_pracownika = t.user_id LEFT JOIN damage_reports dr ON p.id_pracownika = dr.user_id WHERE p.id_pracownika = ?",
    [user_id],
    (err, result) => {
      if (err) {
        return res.send({ err: err });
      }

      if (result.length > 0) {
        return res.send(result);
      } else {
        return res.send({ message: "Wrong id" });
      }
    }
  );
});

app.listen(8081, () => {
  console.log("listening");
});
