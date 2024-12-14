"use strict";
/*******
 * Password reset functionality
 * https://www.youtube.com/watch?v=A8k4A7TuhDY&t=588s
 * https://github.com/ksekwamote/password_recovery/tree/master
 */
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { MY_EMAIL, MY_PASSWORD } = require("./config");
const { NotFoundError } = require("./expressError");
const basicRoutes = require("./routes/basic");
const { PORT } = require("./config");
const { authenticateJWT } = require("./middleware/jwt");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const videosRoutes = require("./routes/videos");
const playlistsRoutes = require("./routes/playlists");

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/", basicRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/videos", videosRoutes);
app.use("/playlists", playlistsRoutes);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/*app.get("/", (req, res) => {
  res.send("Hello World!");
});*/
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      //service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "lunasaturni74@gmail.com",
        pass: "mugq jusl hybq uxto",
      },
    });

    const mail_configs = {
      from: "lunasaturni74@gmail.com",
      to: recipient_email,
      subject: "PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Koding 101 Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

app.get("/", (req, res) => {
  console.log(MY_EMAIL);
});

/*app.post("/send_recovery_email", (req, res) => {
  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});*/

app.post("/send_recovery_email", async (req, res) => {
  try {
    const response = await sendEmail(req.body);
    res.send(response.message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
