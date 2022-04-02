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
  clientSecret: process.env.SECRET_KEY,
  callbackURL: `http://localhost:${port}/auth/reddit/callback`,
  state: "random-unique-string",
  authorizeOptions: { duration: "permanent" },
});

app.listen(port, () => console.log(`Served successfully at port ${port}!`));

app.get("/auth/reddit", reddit.authorize);

app.get("/auth/reddit/callback", reddit.accessToken, async (req, res) => {
  let token = req.token.token;
  res.status(200).json(req.token);

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

  let rawfile = fs.readFileSync("accounts.json");
  let accounts = JSON.parse(rawfile);

  if (!id || id in accounts) {
    return "Account already exists!";
  } else {
    accounts.id = { username: username, token: token };
    fs.writeFileSync("accounts.json", JSON.stringify(accounts));
    return JSON.stringify(token, null, 2);
  }
});

app.get("/export", async (req, res) => {
  res.sendFile("accounts.json", { root: __dirname });
});
