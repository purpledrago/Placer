const express = require("express");
const axios = require("axios");
require("dotenv").config();
const fs = require("fs");
const simpleOAuth2Reddit = require("@jimmycode/simple-oauth2-reddit");

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

const port = process.env.PORT || 8080;

const reddit = simpleOAuth2Reddit.create({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: `https://reddit-placer.herokuapp.com/auth/callback`,
  state: "random-unique-string",
  authorizeOptions: { duration: "permanent" },
});

fs.open("accounts.json", "r", function (err, fd) {
  if (err) {
    fs.writeFile("accounts.json", "{}", function (err) {
      if (err) {
        console.log(err);
      }
      console.log("accounts.json file created successfully");
    });
  }
});

app.listen(port, () =>
  console.log(`Served successfully at port http://localhost:${port}`)
);

app.get("/", async (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    Buffer.from(
      "<ul><li><a href='/auth'>Auth</a></li><li><a href='/export'>Export</a></li></ul>"
    )
  );
});

app.get("/auth", reddit.authorize);

app.get("/auth/callback", reddit.accessToken, async (req, res) => {
  let token = req.token.token;

  let { data } = await axios({
    url: "https://oauth.reddit.com/api/v1/me",
    method: "GET",
    headers: {
      "User-Agent": "Placer bot by Project r/place",
      Authorization: "Bearer " + token.access_token,
      token: token.access_token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  var id;
  var username;
  username = data.name;
  id = data.id;

  let accounts = JSON.parse(fs.readFileSync("accounts.json"));

  if (!id || accounts.hasOwnProperty(id)) {
    res.status(409);
    res.send("Account already exists!");
  } else {
    accounts[id] = { username: username, token: token };
    fs.writeFileSync("accounts.json", JSON.stringify(accounts));
    res.status(200);
    res.send("Account successfully configured.");
  }
});

app.get("/export", async (req, res) => {
  if (req.query.key == process.env.ADMIN_KEY) {
    let accounts = JSON.parse(fs.readFileSync("accounts.json"));
    res.status(200);
    res.json(accounts);
  } else {
    res.status(401);
    res.send("Admin key is incorrect!");
  }
});
