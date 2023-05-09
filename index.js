const express = require("express");
const addMedia = require("./utils");
const app = express();
const port = 5958;

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/addMedia", (req, res) => {
  const { url } = req.body;
  const result = addMedia(url);
  res.json(result);

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
