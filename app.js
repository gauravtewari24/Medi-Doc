const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var path = require("path");
const sendMail = require("./public/js/mail.js");
const hospital = require("./public/js/Hospitals/Lucknow");
//const _ = require("lodash");
const request = require("request");
(User = require("./models/users.js")),
  (passport = require("passport")),
  (CryptoJS = require("crypto-js")),
  (LocalStrategy = require("passport-local")),
  (Sym_options = require("./public/js/symptoms"));
var profileRoutes = require("./profile");
const Item = require("./models/item.js");
const Appointment = require("./models/appointment.js");
var flash = require("connect-flash"),
  methodOverride = require("method-override");

const app = express();

const fetch = require("node-fetch");

const ApiMedicHost = "https://sandbox-healthservice.priaid.ch";
const AuthHost = "https://sandbox-authservice.priaid.ch";
const password = "Ee6z7H8SqKx4f9G5C";
const user_id = "gauravtewari2499@gmail.com";
const computedHash = CryptoJS.HmacMD5(`${AuthHost}/login`, password);
const computedHashString = computedHash.toString(CryptoJS.enc.Base64);
let Token = "";

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());

mongoose
  .connect(
    "mongodb://u7l8arllam84y5ujfhrv:KExrqmWn7xk4Z29bOtzW@buhu1tnk1zats5y-mongodb.services.clever-cloud.com:27017/buhu1tnk1zats5y",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to DB!"))
  .catch((error) => console.log(error.message));

app.use(
  require("express-session")({
    secret: "Once again the monsoon arrives!",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/profile", profileRoutes);

/* app.get("/chatbot", function (req, res) {
  res.render("bot page");
}); */
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
  res.render("register1");
});

app.get("/register", function (req, res) {
  res.render("register1");
});

app.get("/logout", function (req, res) {
  console.log(req.user);
  req.logout();
  req.flash("success", "Logged Out !! Successfully ");

  res.redirect("/");
});

///////////**********SEARCH AND APPOINTMENT BOOKING ROUTES*********//////////////
/* app.get("/search_hospital", function (req, res) {
  res.render("search_hospital", { hospital: hospital });
});

app.get("/book", function (req, res) {
  res.render("bookingwindow");
});

app.post("/search_result", function (req, res) {
  var city = req.body.city,
    hos = req.body.Hospital;
  city = String(city);
  res.render("searchresulthospitals", { lucknow: hospital[city], name: city });
});
 */
////////////////////************************////////////////////////// */

app.post("/email", (req, res) => {
  const { email, name, gender, contact, date } = req.body;
  const usern = req.user;
  var last2 = contact.slice(-2);
  const new_item = {
    email,
    name,
    hospital: "Nanavati Hospital",
    speciality: "EYE",
    doctor: "Dr Shailesh Srivastava",
    gender,
    contact,
    no: last2,
    date,
  };

  Appointment.findOneAndUpdate(
    { username: usern.username },
    { $push: { user_data: new_item } },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("appoitment registered");
      }
    }
  );

  const text =
    "Name : " +
    name +
    "\n" +
    "hospital : Nanavati Hospital" +
    "\n" +
    "Speciality: Eye" +
    "\n" +
    "date: 27-10-2020";

  sendMail(email, text, function (err, data) {
    if (err) {
      console.log("ERROR: ", err);
      res.redirect("/profile/book");
    } else {
      console.log("Email sent!!!");
      res.redirect("/profile/book");
    }
  });
});

app.get("/appointment_history", isLoggedIn, function (req, res) {
  var elements = [];
  const usern = req.user;

  Appointment.findOne({ username: usern.username }, function (err, element) {
    if (err) {
      console.log(err);
    } /*  else {
      if (element.user_data.length === 0) {
        console.log("bhag");
        var obj = { pdf_no: "no entries found" };
        elements.push(obj);
        res.render("page1", { user: usern.username, elements: elements });
      }  */ else {
      console.log(element.user_data);
      for (var i = 0; i < element.user_data.length; i++) {
        elements.push(element.user_data[i]);
      }
      console.log("appointments_found");
      res.render("appointmenthistory", { elements: elements });
    }
  });
});

app.post("/register", function (req, res) {
  var newUser = new User({ username: req.body.username });

  User.register(newUser, req.body.password, function (err, user) {
    const first_name = req.body.f_name;
    const last_name = req.body.l_name;

    const username = req.body.username;
    const phone = req.body.phone;
    const h_i_s = req.body.insurance_status;
    const age = req.body.age;
    const gender = req.body.gender;

    if (err) {
      req.flash("error", err.message);
      console.log(err);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Welcome to Medi-Doc " + req.user.username);
      const appoint = new Appointment({
        username: req.user.username,
        user_data: [],
      });
      appoint.save();

      const newUser = new Item({
        first_name: first_name,
        last_name: last_name,
        username: username,
        phone: phone,
        gender: gender,
        h_i_s: h_i_s,
        age: age,
        Uid: username + phone,
        blood_oxy: "not provided",
        blood_press: "not provided",
        sugar: "not provided",
        thy: "not provided",
        PSA: "not provided",

        user_data: [],
      });
      newUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/profile/page2");
        }
      });
    });
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile/page1",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    const usern = req.body.username;
    console.log(error + success);
    req.flash("success", "Logged in !! Successfully ");
  }
);

////*******Diagnose Routes**********////////////////////
/*app.get("/diagnose", isLoggedIn, function (req, res) {
  res.render("diagnose", { sym: Sym_options });
}); */

/* app.get("/diagnose/result", function (req, res) {
  res.render("diagnoseres");
});
 */
/* app.post("/diagnose", function (req, res) {
  const sym = [9];
  var gender = req.body.gender;
  const age = req.body.age;

  fetch(`${AuthHost}/login`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${user_id}:${computedHashString}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      Token = Token + data.Token;
      console.log(data.Token);
      request(
        "https://sandbox-healthservice.priaid.ch/diagnosis?symptoms=[9]" +
          "&gender=" +
          gender +
          "&" +
          "year_of_birth=" +
          age +
          "&token=" +
          Token +
          "&format=json&language=en-gb",
        function (error, response, body) {
          if (error) {
            console.log("SOmething Wnt Wrong!!");
            console.log(error);
          } else {
            console.log("HI" + JSON.parse(body));
            if (response.statusCode == 200) {
              var data = JSON.parse(body);
              console.log(data);
              res.render("diagnoseres.ejs", { data: data, sym: Sym_options });
            }
          }
        }
      );
    });
}); */
///////////****************////////

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be Logged In!");
  res.redirect("/login");
}
app.get("/demo", function (req, res) {
  res.render("demo");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, function () {
  console.log("server started at 8000 port");
});
