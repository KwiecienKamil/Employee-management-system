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
    "SELECT p.imie, p.nazwisko, p.dzial, p.pensja, wl.godziny_pracy AS work_hours, wl.data AS work_date, t.id AS task_id, t.opis AS task_description, t.status AS task_status, dr.produkt AS damage_product, dr.opis AS damage_description, dr.data_zgloszenia AS damage_report_date FROM pracownicy p LEFT JOIN work_logs wl ON p.id_pracownika = wl.id_pracownika LEFT JOIN tasks t ON p.id_pracownika = t.user_id LEFT JOIN damage_reports dr ON p.id_pracownika = dr.user_id WHERE p.id_pracownika = ?",
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

app.get("/getInventory", (req, res) => {
  const sql = "SELECT * FROM inventory";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/getEmployees", (req, res) => {
  const sql =
    "SELECT id_pracownika AS id, imie AS name, nazwisko AS surname, dzial AS department, telefon as phone_number, stanowisko AS position FROM pracownicy";

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    return res.json(data);
  });
});

app.get("/getDamageReports", (req, res) => {
  const sql = "SELECT * FROM damage_reports";

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("listening");
});
