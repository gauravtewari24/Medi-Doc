var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Sym_options = require("./public/js/symptoms");
const Item = require("./models/item.js");
const path = require("path");
const multer = require("multer");

const fetch = require("node-fetch");

const ApiMedicHost = "https://sandbox-healthservice.priaid.ch";
const AuthHost = "https://sandbox-authservice.priaid.ch";
const password = "Ee6z7H8SqKx4f9G5C";
const user_id = "gauravtewari2499@gmail.com";
const computedHash = CryptoJS.HmacMD5(`${AuthHost}/login`, password);
const computedHashString = computedHash.toString(CryptoJS.enc.Base64);
let Token = "";

const hospital = require("./public/js/Hospitals/Lucknow");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static("public"));

// declations end here

var pdf_no_l = "";
var date_l = "";

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + pdf_no_l + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("myImage");

// custom variables end here

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

router.post("/page1", function (req, res) {
  const p_no = req.body.pdf_no;
  const date = req.body.date;
  const report = req.body.report;
  const result = req.body.result;

  pdf_no_l = p_no;
  date_l = date;

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
        res.render("upload");
      }
    }
  );
});

router.post("/download", function (req, res) {
  var name = req.body.pdf;
  var path = __dirname + "/public/uploads/myImage-" + name + ".pdf";
  console.log(path);

  var filePath = path;
  var fileName = "report.pdf";

  res.download(filePath, fileName);
});

router.post("/upload", function (req, res) {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      if (req.file == undefined) {
        console.log("not");
        res.redirect("/profile/page1");
      } else {
        console.log("done");
        res.redirect("/profile/page1");
      }
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
          if (element === null) {
            console.log("BHAK");
            res.redirect("/profile/page1");
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

router.get("/page2", isLoggedIn, function (req, res) {
  Item.find({ username: req.user.username }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render("page2", {
        f_name: data[0]["first_name"],
        l_name: data[0]["last_name"],
        age: data[0]["age"],
        gender: data[0]["gender"],
        h_i_s: data[0]["h_i_s"],
        phone: data[0]["phone"],
        email: data[0]["username"],
        b_p: data[0]["blood_press"],
        b_o: data[0]["blood_oxy"],
        b_s: data[0]["sugar"],
        b_t: data[0]["thy"],
        b_psa: data[0]["PSA"],
      });
    }
  });
});

router.get("/update_stat", function (req, res) {
  res.render("update_stat");
});

router.post("/update_stat", isLoggedIn, function (req, res) {
  const b_p = req.body.blood_press;
  const b_o = req.body.blood_oxy;
  const b_s = req.body.sugar;
  const b_t = req.body.thyroid;
  const b_psa = req.body.bekar;
  const usern = req.user;
  console.log(b_p);
  Item.findOneAndUpdate(
    { username: usern.username },
    {
      $set: {
        blood_oxy: b_o,
        blood_press: b_p,
        sugar: b_s,
        thy: b_t,
        PSA: b_psa,
      },
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("updated");
        res.redirect("/profile/page2");
      }
    }
  );
});

//// GAURAVS PART OF CODE ////
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

/* router.get("/diagnose", function (req, res) {
  res.render("diagnose", { sym: Sym_options });
});

router.get("/diagnose/result", function (req, res) {
  res.render("diagnoseres");
});

router.post("/diagnose", function (req, res) {
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
});
 */
router.get("/diagnose", function (req, res) {
  res.render("diagnose_bot");
});

router.get("/appointment_history", function (req, res) {});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be Logged In!");
  res.redirect("/login");
}

module.exports = router;
