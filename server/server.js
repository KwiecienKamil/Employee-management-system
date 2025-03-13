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
app.get("/getAnnouncements", (req, res) => {
  const sql = "SELECT * FROM announcements";
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

app.post("/addDamageReport", (req, res) => {
  const { user_id, produkt, opis, data_zgloszenia } = req.body;

  if (!user_id || !produkt || !opis || !data_zgloszenia) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }

  db.query(
    "INSERT INTO damage_reports (user_id, produkt, opis, data_zgloszenia) VALUES (?, ?, ?, ?)",
    [user_id, produkt, opis, data_zgloszenia],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Błąd serwera" });
      return res.json({ message: "Zgłoszenie dodane", id: result.insertId });
    }
  );
});

app.post("/addEmployee", (req, res) => {
  const { imie, nazwisko, stanowisko, dzial, telefon, email, haslo } = req.body;

  if (
    !imie ||
    !nazwisko ||
    !stanowisko ||
    !dzial ||
    !telefon ||
    !email ||
    !haslo
  ) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }

  db.query(
    "INSERT INTO pracownicy (imie, nazwisko, stanowisko, dzial, telefon, email, haslo) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [imie, nazwisko, stanowisko, dzial, telefon, email, haslo],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Błąd serwera" });
      return res.json({ message: "Pracownik dodany", id: result.insertId });
    }
  );
});

app.post("/addAnnouncement", (req, res) => {
  const { tytul, tresc, data_dodania } = req.body;

  if (!tytul || !tresc || !data_dodania) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }

  db.query(
    "INSERT INTO announcements (tytul, tresc, data_dodania) VALUES (?, ?, ?)",
    [tytul, tresc, data_dodania],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Błąd serwera" });
      return res.json({ message: "Ogłoszenie dodane", id: result.insertId });
    }
  );
});
app.listen(8081, () => {
  console.log("listening");
});
