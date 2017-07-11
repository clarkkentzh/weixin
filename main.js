var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongo = require("mongodb").MongoClient;
var fs = require("fs");
var bodypa = require("body-parser");
var assert = require("assert");

app.use(bodypa.json({limit: '1mb'}));
app.use(bodypa.urlencoded({
  extended: true
}))
// var query = require("querystring");
var url = "mongodb://localhost:27017/zhao"

var uname,pawd,uname1,pawd1,name;

// app.use(express.static(__dirname + "/public"));
app.set("views",__dirname + '/views');
app.set("view engine",'ejs');

app.get("/",function(req,res){
  // res.render("index");
    if(req.query.username1 && req.query.passwd1){
      uname1 = req.query.username1;
      pawd1 = req.query.passwd1;
      mongo.connect(url,function(err,db){
        var zhuce = db.collection("denglu");
        if(err){
          console.log(err);
        }
        zhuce.find({"name":uname1}).each(function(err,result){
          if(result !== null) {
            res.render("already");
            db.close();
            return;
          }else {
            zhuce.insert({"name":uname1,"passwd":pawd1},function(err,result){
              if(err) {
                console.log(err);
                return;
              }
            })

            res.render("index");
          }
        })
      })
    }else if(req.query.username2){
      var query = {"name":req.query.username2};
      var update = {$set:{"passwd":req.query.passwd2}};
      console.log(req.query.username2,req.query.passwd2);
      mongo.connect(url,function(err,db){
        var zhuce = db.collection("denglu");
        if(err){
          console.log(err);
        }
        zhuce.update(query,update,function(err,result){
          if(err) {
            console.log(err);
            db.close();
          }
        })
        res.render("index");
      })
    }else {
      res.render("index");
    }
});

app.post("/success",function(req,res){
  if(req.body.username){
    uname = req.body.username;
    mongo.connect(url,function(err,db){
      assert.equal(err,null);
      var denglu = db.collection("denglu");
      denglu.find({"name":uname}).each(function(err,result){
        // assert.equal(err,null);
        if(result !== null){
          name = result.name;
          pawd = result.passwd;
          console.log(name,pawd);
          if(req.body.passwd === pawd){
            res.render("liaotian");
            return;
          }else {
            res.render("error");
            return;
          }
        }else {
          res.render("error");
          db.close();
          return ;
        }
        return;
      })
      db.close();
    })
  }else {
    res.render("error");
  }
});

app.get("/pass",function(req,res){
  res.render("input2");
})

app.get("/use",function(req,res){
  res.render("input1");
});

// app.get("/liaotian",function(req,res){
//   res.render("liaotian");
//   // res.sendFile(__dirname + "/liaotian.html");
// });

io.on("connection",function(socket){
  const nameleft = name;
  socket.emit("na",nameleft);
  socket.broadcast.emit('guangbo',nameleft);
  socket.on("in server",function(data){
    io.emit("in web",nameleft,data);
    socket.emit("class");
    socket.emit("li");
    socket.emit("color");
  });
});

// app.listen(2500);
http.listen(3000,function(){
  console.log("listening 3000!");
});
