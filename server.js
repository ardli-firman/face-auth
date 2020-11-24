const express = require("express");
const fileupload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

// Setting up database
const db = new sqlite3.Database(
    path.join(__dirname, "db/face.db"),
    sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            console.log(err);
        }
    }
);

// Create Table
db.run(
    "CREATE TABLE IF NOT EXISTS people(id INTEGER PRIMARY KEY AUTOINCREMENT,nama TEXT NOT NULL,tgl_lahir DATE NOT NULL,email TEXT NOT NULL,foto BLOB)"
);

// Directory views file
const viewsDir = path.join(__dirname, "views");

// Handling Cors ajax request
app.use(
    cors({
        origin: "http://localhost:3000"
    })
);

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Setting static folder
app.use(express.static("public"));
app.use(express.static(viewsDir));
app.use("/images", express.static("uploads"));

// Plugin upload file express
app.use(fileupload({ createParentPath: true }));

// Routing views
// app.get("/", (req, res) => res.sendFile(path.join(viewsDir, "home.html")));
app.get("/home", (req, res) => res.sendFile(path.join(viewsDir, "home.html")));
app.get("/capture", (req, res) => {
    res.sendfile(path.join(viewsDir, "capture-face.html"));
});
app.get("/live", (req, res) => {
    res.sendfile(path.join(viewsDir, "live-face.html"));
});
app.get("/single", (req, res) => {
    res.sendfile(path.join(viewsDir, "single-face.html"));
});
app.get("/registrasi", (req, res) => {
    res.sendfile(path.join(viewsDir, "registrasi.html"));
});
app.get("/verifikasi", (req, res) => {
    res.sendfile(path.join(viewsDir, "verifikasi.html"));
});

// Routing request people
app.get("/people-data", (req, res) => {
    let peoples = ["Ebiet G Ade", "Ariel Noah"];
    res.json(peoples);
});

app.post("/test", (req, res) => {
    res.json("oke");
});

// Register
app.post("/register", (req, res) => {
    if (!req.files) {
        res.status(404);
    }
    const foto = req.files.foto_wajah;
    const body = req.body;
    const nama = body.nama;
    const email = body.email;
    const tgl_lahir = body.tgl_lahir;
    const buffer = foto.data;
    let dataBuffer = Buffer.from(buffer);
    let sql = "INSERT INTO people(nama,tgl_lahir,email,foto) VALUES(?,?,?,?)";
    db.run(sql, nama, tgl_lahir, email, dataBuffer, err => {
        if (err) {
            res.status(404);
        }
        res.redirect("/");
    });
});

// Get people data from db
app.get("/people", async (req, res) => {
    let sql = "SELECT DISTINCT foto,nama FROM people";
    let data = [];
    db.each(
        sql,
        async (err, row) => {
            if (err) {
                res.status(404).send(err);
            }
            data.push(row);
        },
        err => {
            if (err) {
                res.json(err);
            }
            res.json(data);
        }
    );
});

// Upload File
// app.post("/upload", async (req, res) => {
//     try {
//         if (!req.files) {
//             res.send({
//                 status: false,
//                 message: "No file uploaded"
//             });
//         } else {
//             let avatar = req.files.foto;
//             avatar.mv("./uploads/Mokhamad Wijaya/1.jpg");

//             res.send({
//                 status: true,
//                 message: "File is uploaded",
//                 data: {
//                     name: avatar.name,
//                     mimetype: avatar.mimetype,
//                     size: avatar.size
//                 }
//             });
//         }
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

app.listen(3000, () => {
    console.log("LISTEN");
});
