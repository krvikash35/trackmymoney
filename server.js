// post:  /signup           201(created, lh:/user/:id/info),  409(conflict),500(serverError)
// post:  /signin           200(ok,lh:/user/:id/trx), 400(badrequest) 404(notFound)
// get:   /user/:id/report  200(ok, json), 401(Unauthorized, lh:/sigin)
// get:   /user/:id/info    200(ok, json), 401(Unauthorized, lh:/sigin)
// post:  /user/:id/trx     200(ok, json), 401(Unauthorized, lh:/sigin)

//load all the required module
var express    = require("express");      //main web framework module for node
var app        = express();
var bodyParser = require("body-parser");  // help in parsing the request,response header
var morgan     = require("morgan");       // used for logging
var mongoose   = require("mongoose");     // mongo database driver or module
var jwt        = require("jsonwebtoken"); // this module used for token based authentication
var appdb      = require('./models/trackmymoney');  //js var holding the all the collection of this app db
var sConfig    = require('./config');     // holds all the important config var mainly server related
var pubRouter  = express.Router();        //this is public router used for public resources
var privRouter = express.Router();        //this is private router used for private resources
var usrInfo    = appdb.userInfoDoc;       //this document holds user info
var usrPrsTrx  = appdb.userPrsnlTrxDoc;   //this document holds user personal transaction


//use middleware stack, these are executed in declared order whenever any req, res occur
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); //used to allow same user request from any client
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});
app.use('/user', privRouter);
app.use('', pubRouter);
// app.use(express.static("./app"));
privRouter.use(function(req,res,next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  jwt.verify(token, sConfig.serverSecret, function(err, decoded){
    if(err){
      res.status(401);
      res.setHeader("Location", "/signin");
      res.send({"msg": "Unauthorized to see this page"})
    }
  });
  next();
});




// use config var to run this app: Development or production
if(sConfig.runEnv === 'dev') {
  mongoDBUrl = sConfig.devUrl.dbUrl;
  port       = sConfig.devUrl.appPort;
} else {
  if(sConfig.runEnv === 'prod'){
    mongoDBUrl  = sConfig.prodUrl.dbUrl;
    port        = sConfig.prodUrl.appPort;
  }
  else{
    return console.log(sConfig.errMsg.invalidRunEvn);
  }
}




//connect to mongo db
mongoose.connect(mongoDBUrl, function(err){
  if(err){
    console.log("Could not connect to "+mongoDBUrl);
  }
});





pubRouter.get('/', function(req, res){
  res.json({
    msg: "Welcome Guest"
  })
});

pubRouter.post('/signin',function(req, res){
  usrInfo.findOne({"account.email": req.body.email}, function(err, data){
    if(err){
      res.sendStatus(500);
    }else{
      if(!data){
        res.status(401);
        res.send({"msg": "This user not found on our system!"});
      }else{
        if(req.body.password !== data.account.password){
          res.status(401);
          res.send({"msg": "You Typed Incorrect Password!"});
        }else{
          res.status(200);
          var usr = {
            "email": data.account.email
          };
          var token = jwt.sign(usr, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
          var loc = "user/"+data._id+"/trx"
          res.setHeader("Location", loc);
          res.send({"token": token, email: data.account.email});
        }
      }
    }
  });
});

pubRouter.post('/signup', function(req,res){
  usrInfo.findOne({"account.email": req.body.email}, function(err, data){
    if(err){
      res.sendStatus(500);
    }else{
      if(data){
        res.status(409);
        res.send({"msg": "This user already exist in our system"});
      }else{
        var usrDoc        = new usrInfo();
        usrDoc.account.email      = req.body.email;
        usrDoc.account.phone      = req.body.phone;
        usrDoc.account.fullname   = req.body.fullname;
        usrDoc.account.password   = req.body.password;
        usrDoc.save(function(err, data){
          if(err){
            res.status(400);
            res.send({"msg": "Invalid signup data"});
          }else{
            res.status(201);
            var loc="user/"+data._id+"/info";
            res.setHeader("Location",loc);
            res.send();
          }
        });
      }
    }
  });
});



//Handle any uncaught Exception, to prevent server from crashing
process.on('uncaughtException', function(err) {
  console.log(err);
});


// Start Server
app.listen(port, function () {
  console.log( "Express server listening on port " + port);
});
