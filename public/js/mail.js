const nodemailer = require("nodemailer");
const mailGun = require("nodemailer-mailgun-transport");

const auth = {
  auth: {
    api_key: "cfe2a90b69c8c836e69578369953ca6a-aff2d1b9-06bd7945", // TODO: Replace with your mailgun API KEY
    domain: "sandboxa16197e3a2cd4db186e5fc6a78f9d824.mailgun.org", // TODO: Replace with your mailgun DOMAIN
  },
};

const transporter = nodemailer.createTransport(mailGun(auth));

const sendMail = (email, text, cb) => {
  const mailOptions = {
    from: "gauravtewari2499@gmail.com", // TODO replace this with your own email
    to: email, // TODO: the receiver email has to be authorized for the free tier
    subject: "Appointment Booking",
    text,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      return cb(err, null);
    }
    return cb(null, data);
  });
};

module.exports = sendMail;
