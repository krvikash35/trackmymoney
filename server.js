// post:  /signup           201(created, lh:/user/:id/info),  409(conflict),500(serverError)
// post:  /signin           200(ok,lh:/user/:id/trx), 400(badrequest) 404(notFound)
// get:   /user/:id/report  200(ok, json), 401(Unauthorized, lh:/sigin)
// get:   /user/:id/info    200(ok, json), 401(Unauthorized, lh:/sigin)
// post:  /user/:id/trx     200(ok, json), 401(Unauthorized, lh:/sigin)
// put:   /user/:id/info    200(ok),       200(ok)

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
var bcrypt     = require('bcrypt');

//use middleware stack, these are executed in declared order whenever any req, res occur
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); //used to allow same user request from any client
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  if(mongoose.connection.readyState==0){
    res.status(500);
    return  res.send({"data": "We are having problem with connecting to DB..Dont worry, will be back soon!"});
  }
  next();
});
app.use(express.static("app"));
app.use('/user', privRouter);
app.use('', pubRouter);

//Middleware for private router to validate the token
privRouter.use('/:userId',function(req,res,next){


  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    var bearerToken = bearer[1];
    jwt.verify(bearerToken, sConfig.serverSecret, function(err, decoded){
      if(err){
        res.status(401);
        res.setHeader("Location", "");
        return res.send({"data": "Unauthorized to see this page"})
      }
      if(req.params.userId !== decoded.userId){
        res.status(400);
        return res.send({"data": "Invalid Resources"})
      }
      req.userId = decoded.userId;
      next();
    });
  }else{
    res.status(400);
    return res.send({"data": "supported authorization Header not found"});
  }
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

//-----------------------------------------------------------------------------------------------
//post('/signin')
//@param: {req.body.[email,password]}
//@response-error:   {res.statusCode: [400,500], res.body.data: "appropriate error msg" }
//@response-success: {res.statusCode: 200, res.body.data: token, locHeader: /usr/:userId/trx}
//------------------------------------------------------------------------------------------------
pubRouter.post('/signin',function(req, res){
  if(req.body.email === undefined || req.body.email === null ){

    res.status(400);
    return res.send({"data": "Invalid Email length or pattern"});
  }
  usrInfo.findOne({"account.email": req.body.email.toLowerCase()}, function(err, data){
    if(err){
      res.status(500);
      return res.send({"data": err.message});
    }
    if(!data){
      res.status(400);
      return res.send({"data": "This user not found on our system!"});
    }
    if(!bcrypt.compareSync(req.body.password, data.account.password)){
      res.status(400);
      return res.send({"data": "Invalid Password"})
    }
    var usr   = { "userId": data._id };
    var token = jwt.sign(usr, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
    var loc   = "user/"+data._id+"/trx"
    res.setHeader("Location", loc);
    res.status(200);
    res.send({"data": token});
  });
});

//-----------------------------------------------------------------------------------------------
//post('/signup')
//@param: {req.body.[email,password]}
//@response-error:   {res.statusCode: [400,500], res.body.data: "appropriate error msg" }
//@response-success: {res.statusCode: 200, res.body.data: token, locHeader: /usr/:userId/trx}
//------------------------------------------------------------------------------------------------
pubRouter.post('/signup', function(req,res){
  var pwd   = req.body.password;
  var email = req.body.email;
  if(email === undefined || email === null || !email.match(sConfig.emailRegex) ){
    res.status(400);
    return res.send({"data": "Invalid Email length or pattern"});
  }
  if(pwd === undefined || pwd.length<sConfig.pwdLength.min || pwd.length>sConfig.pwdLength.max || pwd ===null){
    res.status(400);
    return res.send({"data": "Invalid password length"});
  }
  usrInfo.findOne({"account.email": req.body.email.toLowerCase()}, function(err, data){
    if(err){
      res.sendStatus(500);
      return res.send({"data": err.message});
    }
    if(data){
      res.status(409);
      return res.send({"data": "This user already exist in our system"});
    }
    var hashpwd                   = bcrypt.hashSync(pwd, 10);
    var usrInfoDoc                = new usrInfo();
    usrInfoDoc.account.email      = req.body.email;
    usrInfoDoc.account.phone      = req.body.phone;
    usrInfoDoc.account.fullname   = req.body.fullname;
    usrInfoDoc.account.password   = hashpwd;
    usrInfoDoc.account.creatDate  = new Date().toISOString();
    usrInfoDoc.moneyAccount       = sConfig.initMoneyAccount;
    usrInfoDoc.sourceOfMoneyTrx.incomeSource =sConfig.initIncomeSource;
    usrInfoDoc.sourceOfMoneyTrx.expenseSource =sConfig.initExpenseSource;
    usrInfoDoc.save(function(err, data){
      if(err){
        res.status(400);
        res.send({"msg": "Invalid signup data"});
        throw new Error(err);
      }else{
        var usr   = { "userId": data._id };
        var token = jwt.sign(usr, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
        var loc="user/"+data._id+"/info";
        res.status(201);
        res.setHeader("Location",loc);
        return res.send({"data": token});;
      }
    });
  });
});

//-----------------------------------------------------------------------------------------------
//get('/user/:userId/info')
//@param: {req.param.[userId]}
//@response-error:   {res.statusCode: 400, res.body.data: "No Data Found" }
//@response-success: {res.statusCode: 200, res.body.data: "userInfo"}
//------------------------------------------------------------------------------------------------
privRouter.get('/:userId/info',function(req, res){
  usrInfo.findById(req.params.userId, function(err, data){
    if(err || data === null){
      res.status(400)
      return res.send("No Data Found");
    }
    res.status(200);
    return res.send({data: data});
  })
});

//--------------------------------------------------------------------------------------------
//put('/user:userId/info')
//@param: {req.param.[userId], req.body.updatecode and [1/2/3/4/5/6/7], req.body.updateitem}
//@response-error:   {res.statusCode: 400, res.body.data: "User not found" }
//@response-success: {res.statusCode: 200, res.body.data: "Account Info Updated successfully"}
//1:expenseSource 2:incomeSource 3:moneyAccount 4:password 5:email  6:phone 7:fullname
//------------------------------------------------------------------------------------------
privRouter.put('/:userId/info', function(req, res){

  usrInfo.findById(req.params.userId, function(err, user){
    if(err){
      res.send({"data": err.message});
    }
    if(user === null){
      res.status(400);
      return res.send({data: 'User not found'});
    }
    switch (req.body.updatecode) {
      case 1:
      user.sourceOfMoneyTrx.expenseSource=req.body.updateitem;
      user.save(function(err){
        if(err){
          res.status(400);
          return res.send({"data": err.message});
        }else{
          res.status(200);
          return res.json({"data": "Updated successfully"});
        }
      })
      break;

      case 2:
      user.sourceOfMoneyTrx.incomeSource=req.body.updateitem;
      user.save(function(err){
        if(err){
          res.status(400);
          return res.send({"data": err.message});
        }else{
          res.status(200);
          return res.json({"data": "Updated successfully"});
        }
      })
      break;

      case 3:
      user.moneyAccount=req.body.updateitem;
      user.save(function(err){
        if(err){
          res.status(400);
          return res.send({"data": err.message});
        }else{
          res.status(200);
          return res.json({"data": "Updated successfully"});
        }})
        break;

        case 4:
        pwd = req.body.updateitem
        if(pwd === undefined || pwd.length<sConfig.pwdLength.min || pwd.length>sConfig.pwdLength.max || pwd ===null){
          res.status(400);
          return res.send({"data": "Invalid password length"});
        }
        var hashpwd = bcrypt.hashSync(pwd, 10);
        user.account.password = hashpwd;
        user.save(function(err){
          if(err){
            res.status(400);
            return res.send({"data": "Invalid length for password"});
          }else{
            res.status(200);
            return res.json({"data": "Updated successfully"});
          }
        })
        break;

        case 5:
        var email=req.body.updateitem;
        if(email === undefined || email === null || !email.match(sConfig.emailRegex) ){
          res.status(400);
          return res.send({"data": "Invalid Email length or pattern"});
        }
        user.account.email=email;
        user.save(function(err){
          if(err){
            res.status(400);
            return res.send({"data": "Invalid length or pattern for email"});
          }else{
            res.status(200);
            return res.json({"data": "Updated successfully"});
          }
        })
        break;

        case 6:
        user.account.phone=req.body.updateitem;
        user.save(function(err){
          if(err){
            res.status(400);
            return res.send({"data": "Invalid length for phone"});
          }else{
            res.status(200);
            return res.json({"data": "Updated successfully"});
          }
        })
        break;

        case 7:
        user.account.fullname=req.body.updateitem;
        user.save(function(err){
          if(err){
            res.status(400);
            return res.send({"data": "Invalid length for fullname"});
          }else{
            res.status(200);
            return res.json({"data": "Updated successfully"});
          }
        })
        break;

        default:
        res.status(400);
        return res.json({"data": "Invalid update Option"});
      }
    })
  });


  //-----------------------------------------------------------------------------------------------
  //get('/user/:userId/info')
  //@param: {req.param.[userId]}
  //@response-error:   {res.statusCode: 400, res.body.data: "No Data Found" }
  //@response-success: {res.statusCode: 200, res.body.data: "userReport"}
  //----------------------------------------------------------------------------------------------
  privRouter.get('/:userId/report', function(req, res){
    usrPrsTrx.find({userId: req.params.userId}, function(err, data){
      if(err || data === null){
        res.status(400);
        return res.send({data: 'No Data Found'});
      }
      res.status(200);
      return res.send({data: data});
    });
  });

  //-----------------------------------------------------------------------------------------------
  //post('/user/:userId/trx')
  //@param: {req.param.[userId], req.body.[amount,type,source,destination,description]}
  //@response-error:   {res.statusCode: 400, res.body.data: "Invalid transaction data" }
  //@response-success: {res.statusCode: 201, res.body.data: "Trx saved successfully"}
  //----------------------------------------------------------------------------------------------
  privRouter.post('/:userId/trx',function(req, res){
    var userPrsnlTrx            = new usrPrsTrx();
    userPrsnlTrx.amount         = req.body.amount;
    userPrsnlTrx.type           = req.body.type;
    userPrsnlTrx.source         = req.body.source;
    userPrsnlTrx.destination    = req.body.destination
    userPrsnlTrx.description    = req.body.description;
    userPrsnlTrx.userId         = req.params.userId;

    userPrsnlTrx.save(function(err, data){
      if(err){
        res.status(400);
        res.send({"data": "Invalid transaction data"});
        throw new Error(err);
      }else{
        res.status(201);
        return res.send({"data": "Transaction saved successfully"});
      }
    });
  });


  //Handle any uncaught Exception, to prevent server from crashing
  process.on('uncaughtException', function(err) {
    console.log("uncaughtException: "+err);
  });


  // Start Server
  app.listen(port, function () {
    console.log( "Express server listening on port " + port);
  });
