const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const ejwt = require('express-jwt');
const bodyParser = require('body-parser');
const auth = require('basic-auth');
require('dotenv').config(); //annoying

app.use(bodyParser.json());
const token = process.env.TOKEN || "somethingsomethingsuperdupertricky";

var users = [
  {
    username: "demo",
    password: "password",
    role: "admin"
  }
];

app.post("/signup", (req, res) => {
  var {username, password} = req.body;
  if(!username || !password) res.send({success:false, msg:"Need both username and password!"});
  else {
    users.push(req.body);
    res.send({success: true, msg:"Successfully created new user."});
  }
});

app.post("/signin", (req, res) => {
  var {username, password} = req.body;
  var user = users.find(u => { return u.username === username && u.password == password });
  if(user){
    var signed = jwt.sign({username: user.username, role: user.role}, token);
    res.send({success: true, token: "JWT " + signed });
  } else {
    res.sendStatus(401);
  }
});

app.get("/movies", (req, res) => {
  var {headers, query} = req;
  res.send({status: 200, message: "GET movies", headers, query, env: token});
});

app.post("/movies", (req, res) => {
  var {headers, query} = req;
  res.send({status: 200, message: "Movie saved", headers, query, env: token});
});

app.put("/movies", ejwt({ secret: token, algorithms: ['HS256'] }), (req, res) => {
  var {headers, query} = req;
  res.send({status: 200, message: "Movie updated", headers, query, env: token});
});

app.delete("/movies", (req, res) => {
  var user = auth(req);
  if(users.find(u => { return u.username === user.name && u.password === user.pass} )){
    var {headers, query} = req;
    res.send({status: 200, message: "movie deleted", headers, query, env: token});
  } else {
    res.sendStatus(401);
  }
});

app.all('*', function(req, res){
   res.status(403).end();
});

app.listen(process.env.PORT || 8008, () => {
  console.log("listening, token is " + token);
});
