const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Item = require("./models/item.js");
const path = require("path");
const multer = require("multer");

const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ndbc (node data base connection)

mongoose.connect("mongodb://localhost:27017/Med-Doc", {
  useNewUrlParser: true,
});

// custom variables

var usern = "";
var g_f_name = "";
var g_l_name = "";
var g_age = "";
var g_gender = "";
var g_h_i_s = "";
var g_phone = "";
var g_b_p = "";
var g_b_o = "";
var g_b_s = "";
var pdf_no_l = "";
var date_l = "";

// file system

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-"+ pdf_no_l + path.extname(file.originalname));
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("myImage");

// get route

// base route

app.get("/", function (req, res) {
  res.render("landing", { userName: usern });
});

app.get("/login", function (req, res) {
  res.redirect("/register");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/lg", function (req, res) {
  usern = "";
  g_f_name = "";
  g_l_name = "";
  g_age = "";
  g_gender = "";
  g_h_i_s = "";
  g_phone = "";
  g_b_o = "";
  g_b_p = "";
  g_b_s = "";
  console.log("logout");
  res.redirect("/");
});

// others

app.get("/update_stat", function (req, res) {
  res.render("update_stat");
});

app.get("/page1", function (req, res) {
  var elements = [];

  if (usern === "") {
    res.redirect("/register");
  } else {
    Item.findOne({ email: usern }, function (err, element) {
      if (err) {
        console.log(err);
      } else {
        if (element.user_data.length === 0) {
          console.log("bhag");
          var obj = { pdf_no: "no entries found" };
          elements.push(obj);
          res.render("page1", { user: usern, elements: elements });
        } else {
          for (var i = 0; i < element.user_data.length; i++) {
            elements.push(element.user_data[i]);
          }
        }
        console.log("elements_found");
        res.render("page1", { user: usern, elements: elements });
      }
    });
  }
});

app.get("/page2", function (req, res) {
  res.render("page2", {
    f_name: g_f_name,
    l_name: g_l_name,
    age: g_age,
    gender: g_gender,
    h_i_s: g_h_i_s,
    phone: g_phone,
    b_o: g_b_o,
    b_p: g_b_p,
    b_s: g_b_s,
  });
});

app.get("/page3", function (req, res) {
  res.render("page3");
});
app.get("/page4", function (req, res) {
  res.render("page4");
});

// post route

// page 1 post route
app.post("/page1", function (req, res) {
  const p_no = req.body.pdf_no;
  const date = req.body.date;
  const report = req.body.report;
  const result = req.body.result;

  console.log(p_no);

  pdf_no_l = p_no;
  date_l = date;

  const new_item = {
    pdf_no: p_no,
    date: date,
    report: report,
    result: result,
    update: "not uploaded",
  };
  if (usern === "") {
    res.redirect("/redirect");
  } else {
    Item.findOneAndUpdate({ email: usern }, { $push: { user_data: new_item } }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("entered");
        res.render("upload");
      }
    });
  }
});

app.post("/download", function (req, res) {
  var name = req.body.pdf;
  var path = __dirname + "/public/uploads/myImage-" + name +".pdf";
  console.log(path);
  
  var filePath = path;
  var fileName = "report.pdf";

  res.download(filePath, fileName);
});

app.post("/upload", function (req, res) {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      if (req.file == undefined) {
        console.log("not");
        res.redirect("/page1");
      } else {
        console.log("done");
        res.redirect("/page1");
      }
    }
  });
});

app.post("/func", function (req, res) {
  const p_no = req.body.pdf_no;
  const date = req.body.date;
  const button = req.body.button;
  var elements_found = [];

  if (usern === "") {
    res.redirect("/login");
  } else {
    if (button === "search") {
      Item.findOne(
        {
          email: usern,
          user_data: { $elemMatch: { pdf_no: p_no, date: date } },
        },
        function (err, element) {
          if (err) {
            console.log(err);
          } else {
            for (i in element.user_data) {
              if (p_no === element.user_data[i]["pdf_no"]) {
                elements_found.push(element.user_data[i]);
              }
            }
            console.log(elements_found);
            res.render("page1", { user: usern, elements: elements_found });
          }
        }
      );
    } else if (button === "delete") {
      console.log("not made yet");
      Item.findOneAndUpdate({ email: usern }, { $pull: { user_data: { pdf_no: p_no } } }, function (err) {
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/page1");
        }
      });
    } else if (button === "show") {
      res.redirect("/page1");
    } else {
      res.redirect("/page1");
    }
  }
});
// page 2 post route

app.post("/update_stat", function (req, res) {
  const b_p = req.body.blood_press;
  const b_o = req.body.blood_oxy;
  const b_s = req.body.sugar;
  console.log(b_p);

  if (usern === "") {
    res.redirect("/register");
  } else {
    Item.findOneAndUpdate({ email: usern }, { $set: { user_stat: { blood_oxy: b_o, blood_press: b_p, sugar: b_s } } }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("entered");
        res.redirect("/page2");
      }
    });
  }
});

// register and login

app.post("/register", function (req, res) {
  const first_name = req.body.f_name;
  const last_name = req.body.l_name;
  const password = req.body.password;
  const c_password = req.body.c_password;
  const email = req.body.username;
  const phone = req.body.phone;
  const h_i_s = req.body.insurance_status;
  const age = req.body.age;
  const gender = req.body.gender;

  const newUser = new Item({
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: password,
    c_password: c_password,
    phone: phone,
    gender: gender,
    h_i_s: h_i_s,
    age: age,
    Uid: email + phone,

    userdata: [],
  });

  Item.findOne({ email: email }, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else if (foundUser) {
      console.log("user exists");
      res.redirect("/register");
    } else {
      newUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          usern = req.body.username;
          g_f_name = req.body.f_name;
          g_l_name = req.body.l_name;
          g_age = req.body.age;
          g_gender = req.body.gender;
          g_h_i_s = req.body.insurance_status;
          g_phone = req.body.phone;
          console.log("register hua abb");
          res.redirect("/page2");
        }
      });
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  Item.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else if (foundUser) {
      if (foundUser.password === password) {
        usern = foundUser.email;
        g_f_name = foundUser.first_name;
        g_l_name = foundUser.last_name;
        g_age = foundUser.age;
        g_gender = foundUser.gender;
        g_h_i_s = foundUser.h_i_s;
        g_phone = foundUser.phone;
        console.log(usern);
        res.redirect("/page2");
      } else {
        res.redirect("login");
      }
    } else {
      res.redirect("/register");
    }
  });
});

// post route end here

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("server started at 3000 port");
});
