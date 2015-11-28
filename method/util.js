var errConfig   = require('../config/error')
var sConfig     = require('../config/server')
var valMeth     = require('./val')
var tmcdb       = require('../models/trackmymoney')
var nodemailer  = require('nodemailer');
var usrAccts     = tmcdb.usrAccts;
var usrVerTemps  = tmcdb.usrVerTemps;
var bcrypt     = require('bcrypt');
var jwt        = require("jsonwebtoken")

var getUserInfo = function(req, res){
  usrAccts.findById(req.params.userId, function(err, user){
    if(err){
      res.status(500)
      return res.send(errConfig.E120);
    }
    if(!user){
      res.status(400);
      return res.send(errConfig.E129)
    }
    res.status(200);
    return res.send(user);
  })
}


var mailTrns = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: sConfig.mailSerUser,
    pass: sConfig.mailSerUserPwd
  }
})

var sendEmail = function sendEmail(transporter,from, to, subject, text){
  var mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text // plaintext body    html: '<b>Hello world ✔</b>' // html body
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return false;
    }else {
      return true;
    }
  });
}

var processAuthAccessReq = function processAuthAccessReq(req, res, next){
  res.status(401);
  var bearerHeader = req.headers["authorization"]; //Authorization :'Bearer token'
  if ( bearerHeader ) {
    var bearer = bearerHeader.split(" ");
    var bearerToken = bearer[1];
    if( bearerToken ){
      jwt.verify(bearerToken, sConfig.serverSecret, function(err, decoded){
        if(err){
          if( err.name === 'TokenExpiredError'){
            return res.send(errConfig.E114)
          }else {
            return res.send(errConfig.E115)
          }
        }
        if(req.params.userId !== decoded.userId){
          return res.send(errConfig.E116)
        }
        req.userId = decoded.userId;
        next();
      });
    }else{
      return res.send(errConfig.E112)
    }
  }else{
    return res.send(errConfig.E113);
  }
}

var checkEmailForSignup = function checkEmailForSignup(req, res){
  console.log(req.body);
  usrAccts.count({'account.email': req.body.email}, function(err, count){
    if (err){
      console.log(err);
      res.status(500);
      return res.send(errConfig.E120);
    }
    if( count > 0 ){
      console.log("inside checkEmailForSignup");
      res.status(400);
      return res.send(errConfig.E124);
    }
  });
}


var setPreReq = function setPreReq(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*'); //used to allow same user request from any client
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  // if(mongoose.connection.readyState==0){
  //   res.status(500);
  //   return  res.send(errConfig.E117);
  // }
  next();
}

var processSigninReq = function processSigninReq(req, res){
  console.log(req.body);
  if( !req.body.email || !req.body.password){
    res.status(400);
    return res.send(errConfig.E119);
  }
  usrAccts.findOne({"account.email": req.body.email}, function(err, data){
    if(err){
      res.status(500);
      return res.send(errConfig.E120);
    }
    if(!data){
      res.status(400);
      return res.send(errConfig.E122);
    }
    if(!bcrypt.compareSync(req.body.password, data.account.password)){
      res.status(400);
      return res.send(errConfig.E123)
    }
    var token = jwt.sign({ "userId": data._id }, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
    res.setHeader("Location", "user/"+data._id+"/trx");
    res.status(200);
    res.send(token);
  })
}

var processSignupReq = function(req, res){
  console.log(req.body);
  switch (req.body.signupCode) {
    case 1:
    checkEmailForSignup(req, res);
    usrVerTemps.findOne({email: req.body.email}, function(err, usr){
      if (err){
        res.status(500)
        return res.send(errConfig.E120);
      }
      var usrEmail = req.body.email;
      if(!usr){
        usrVerRec = new usrVerTemps();
        usrVerRec.email = usrEmail;
        usrVerRec.verCode = Math.floor(1000 + Math.random() * 9000);
        usrVerRec.save(function(err, data){
          if (err){
            res.status(500);
            return res.send(errConfig.E121);
          }else{
            // sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, sConfig.emailverText);
            res.status(200)
            return res.send(errConfig.S100)
          }
        })
      }else {
        usr.verCode = Math.floor(1000 + Math.random() * 9000);
        usr.save(function(err, data){
          if (err){
            res.status(500);
            res.send(errConfig.E121);
          }else {
            // sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, sConfig.emailverText);
            res.status(200);
            return  res.send(errConfig.S101);
          }
        });
      }
    });
    break;

    case 2:
    checkEmailForSignup(req, res);
    var email = req.body.email;
    usrVerTemps.findOne({email: email}, function(err, usr){
      if (err){
        res.status(500);
        return res.send(errConfig.E121);
      }
      if(!usr){
        res.status(400);
        return res.send(errConfig.E128);
      }
      if(usr.verCode != req.body.verCode){
        res.status(400);
        return res.send(errConfig.E125)
      }
      usr.verStatus = 1;
      usr.save(function(err, data){
        if (err){
          res.status(500);
          return res.send(errConfig.E121);
        }
        res.status(200);
        return res.send(errConfig.S102);
      }
    );
  });
  break;

  case 3:
  checkEmailForSignup(req, res);
  usrVerTemps.findOne({email: req.body.email}, function(err, usrTemp){
    if(err){
      res.status(500);
      return res.send(errConfig.E121);
    }
    if(!usrTemp || usrTemp.verStatus != 1){
      res.status(400);
      return res.send(errConfig.E127);
    }
    var hashpwd  = bcrypt.hashSync(req.body.password, 10);
    var usrAcctRec  = new usrAccts();
    usrAcctRec.account.email      = req.body.email;
    usrAcctRec.account.phone      = req.body.phone;
    usrAcctRec.account.fullname   = req.body.fullname;
    usrAcctRec.account.password   = hashpwd;
    usrAcctRec.account.creatDate  = new Date().toISOString();
    usrAcctRec.moneyAccount       = sConfig.initMoneyAccount;
    usrAcctRec.sourceOfMoneyTrx.incomeSource =sConfig.initIncomeSource;
    usrAcctRec.sourceOfMoneyTrx.expenseSource =sConfig.initExpenseSource;
    usrAcctRec.save(function(err, user){
      if(err){
        res.status(500);
        return res.send(errConfig.E121);
      }
      var token = jwt.sign({ "userId": user._id }, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
      res.status(201);
      res.setHeader("Location","user/"+user._id+"/info");
      return res.send(token);
    });
  });

  break;

  default:
  res.status(400);
  return res.send(errConfig.E126);
}
}












module.exports ={
  sendEmail:               sendEmail,
  processAuthAccessReq :   processAuthAccessReq,
  setPreReq :              setPreReq,
  processSigninReq :       processSigninReq,
  processSignupReq :       processSignupReq,
  getUserInfo:             getUserInfo
}





// module.exports
