var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Sym_options = require("../public/js/symptoms");
const Item = require("../models/item.js");
//const usern = "final@gmail.com";
//router.set("view engine", "ejs");

const fetch = require("node-fetch");

const ApiMedicHost = "https://sandbox-healthservice.priaid.ch";
const AuthHost = "https://sandbox-authservice.priaid.ch";
const password = "Ee6z7H8SqKx4f9G5C";
const user_id = "gauravtewari2499@gmail.com";
const computedHash = CryptoJS.HmacMD5(`${AuthHost}/login`, password);
const computedHashString = computedHash.toString(CryptoJS.enc.Base64);
let Token = "";

const hospital = require("../public/js/Hospitals/Lucknow");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static("public"));
//var usern = "final@gmail.com";
router.get("/page1", isLoggedIn, function (req, res) {
  var elements = [];
  const usern = req.user;

  Item.findOne({ username: usern.username }, function (err, element) {
    if (err) {
      console.log(err);
    } else {
      if (element.user_data.length === 0) {
        console.log("bhag");
        var obj = { pdf_no: "no entries found" };
        elements.push(obj);
        res.render("page1", { user: usern.username, elements: elements });
      } else {
        for (var i = 0; i < element.user_data.length; i++) {
          elements.push(element.user_data[i]);
        }
        console.log("elements_found");
        res.render("page1", { elements: elements });
      }
    }
  });
});

router.get("/update_stat", function (req, res) {
  res.render("update_stat");
});

// post route

router.post("/page1", function (req, res) {
  const p_no = req.body.pdf_no;
  const date = req.body.date;
  const report = req.body.report;
  const result = req.body.result;

  console.log(p_no);
  const usern = req.user;
  const new_item = {
    pdf_no: p_no,
    date: date,
    report: report,
    result: result,
  };

  Item.findOneAndUpdate(
    { username: usern.username },
    { $push: { user_data: new_item } },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("entered");
        res.redirect("/profile/page1");
      }
    }
  );
});

router.get("/page2", isLoggedIn, function (req, res) {
  Item.find({ username: req.user.username }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.render("page2", {
        f_name: data[0]["first_name"],
        l_name: data[0]["last_name"],
        age: data[0]["age"],
        gender: data[0]["gender"],
        h_i_s: data[0]["h_i_s"],
        phone: data[0]["phone"],
      });
    }
  });
});

router.post("/func", isLoggedIn, function (req, res) {
  const p_no = req.body.pdf_no;
  const date = req.body.date;
  const button = req.body.button;
  var elements_found = [];
  const usern = req.user;
  if (button === "search") {
    Item.findOne(
      {
        username: usern.username,
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
          res.render("page1", {
            user: usern.username,
            elements: elements_found,
          });
        }
      }
    );
  } else if (button === "delete") {
    console.log("not made yet");
    Item.findOneAndUpdate(
      { username: usern.username },
      { $pull: { user_data: { pdf_no: p_no } } },
      function (err) {
        if (!err) {
          console.log("Successfully deleted checked item." + usern.username);
          res.redirect("/profile/page1");
        }
      }
    );
  } else if (button === "show") {
    res.redirect("/profile/page1");
  } else {
    res.redirect("/profile/page1");
  }
});
// page 2 post route

router.post("/update_stat", isLoggedIn, function (req, res) {
  const b_p = req.body.blood_press;
  const b_o = req.body.blood_oxy;
  const b_s = req.body.sugar;
  const usern = req.user;
  Item.findOneAndUpdate(
    { username: usern },
    { $set: { user_stat: { blood_oxy: b_o, blood_press: b_p, sugar: b_s } } },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("entered");
        res.redirect("/profile/page2");
      }
    }
  );
});

////SEARCH HOSPITAL ROUTE////
router.get("/searchHospital", function (req, res) {
  res.render("page3", { hospital: hospital });
});

router.get("/book", function (req, res) {
  res.render("bookingwindow");
});

router.post("/search_result", function (req, res) {
  var city = req.body.city,
    hos = req.body.Hospital;
  city = String(city);
  res.render("searchresulthospitals", { lucknow: hospital[city], name: city });
});

// register and login
////*******Diagnose Routes**********////////////////////
router.get("/diagnose", function (req, res) {
  res.render("diagnose_bot", { sym: Sym_options });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be Logged In!");
  res.redirect("/login");
}

module.exports = router;
