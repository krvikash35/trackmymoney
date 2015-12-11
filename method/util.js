var errConfig   = require('../config/error')
var sConfig     = require('../config/server')
var valMeth     = require('./val')
var tmcdb       = require('../models/trackmymoney')
var nodemailer  = require('nodemailer');
var bcrypt      = require('bcrypt');
var jwt         = require("jsonwebtoken") // this module used for token based authentication
var usrAccts    = tmcdb.usrAccts;
var usrVerTemps = tmcdb.usrVerTemps;
var usrPrsTrxs  = tmcdb.usrPrsTrxs;
var serverInfo  = tmcdb.serverInfo;
var mongoose   = require("mongoose");
var winston     = require("winston");
var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: 'logs/all-logs1.log',
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 2,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'debug',
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});




var isSconfigEnvValid = function(){
  var result=[{"serverSecret": sConfig.serverSecret}, {"mailSerUserPwd": sConfig.mailSerUserPwd}];
  logger.info("sConfigInit env "+JSON.stringify(result))
  if(!sConfig.serverSecret)
  return false;
  if(!sConfig.mailSerUserPwd)
  return false;
  return true;
}

var getServerInfo = function(){
  return serverInfo.findOne().exec();
}

var setServerInfo = function(){
  serInfo = new serverInfo();
  serInfo.serverSecret = sConfig.serverSecret;
  serInfo.mailSerUserPwd = sConfig.mailSerUserPwd;
  serInfo.save();
}



var processUserPrsTrx = function(req, res){
  logger.info("process prsnlTrx request "+ JSON.stringify(req.body))
  var userPrsnlTrx            = new usrPrsTrxs();
  userPrsnlTrx.amount         = req.body.amount;
  userPrsnlTrx.type           = req.body.type;
  userPrsnlTrx.source         = req.body.source;
  userPrsnlTrx.destination    = req.body.destination
  userPrsnlTrx.description    = req.body.description;
  userPrsnlTrx.userId         = req.userId;
  userPrsnlTrx.save(function(err, data){
    if(err)
    return res.status(500).send(errConfig.E120);
    return res.status(201).send(errConfig.S103);
  });
}

var getUserInfo = function(req, res){
  logger.info("get userInfo request "+ JSON.stringify(req.headers))
  usrAccts.findById(req.userId, function(err, user){
    if(err)
    return res.status(500).send(errConfig.E120);
    if(!user)
    return res.status(400).send(errConfig.E129)
    return res.status(200).send(user);
  })
}

var getUserPrsTrx = function(req, res){
  logger.info("get PrsnlTrx request "+ JSON.stringify(req.headers))
  usrPrsTrxs.find({userId: req.userId}, function(err, userPrsTrx){
    if(err)
    return res.status(500).send(errConfig.E120);
    return res.status(200).send(userPrsTrx);
  });
}

var mailTrns = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: sConfig.mailSerUser,
    pass: sConfig.mailSerUserPwd
  }
})

var sendEmail = function sendEmail(transporter,from, to, subject, htmltext, res){
  logger.debug("Inside emailSend ")
  var mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: htmltext // plaintext body    html: '<b>Hello world ✔</b>' // html body
  };
  //  return setTimeout(function(){ res.status(500).send(htmltext); }, 2000);
  return transporter.sendMail(mailOptions, function(error, info){
    logger.info("mailOptions "+JSON.stringify(mailOptions))
    if(error){
      logger.error("error while sending mail "+" error "+ error)
      return res.status(500).end(errConfig.E118)
    }else {
      logger.info("email sent")
      return res.status(200).send(errConfig.S100)
    }
  });
}

var processAuthAccessReq = function processAuthAccessReq(req, res, next){
  logger.debug("Inside Priviledge Area Request")
  var bearerHeader = req.headers["authorization"]; //Authorization :'Bearer token'
  if( !bearerHeader || bearerHeader.split(" ")[1] ){
    logger.warn("Invalid Auth header "+JSON.stringify(req.headers))
    return res.status(401).send(errConfig.E115)
  }
  jwt.verify(bearerToken, sConfig.serverSecret, function(err, decoded){
    if(err){
      if( err.name == 'TokenExpiredError')
      return res.status(401).send(errConfig.E114)
      logger.warn("Invalid token "+JSON.stringify(req.headers))
      return res.status(401).send(errConfig.E115)
    }
    req.userId = decoded.userId;
    next();
  });
}

var isEmailAlreadyVerReg = function isEmailAlreadyVerReg(usrAcctModel, email, callback){
  usrAcctModel.count({'account.email': email}, function(err, count){
    if (err){
      return callback(err)
    }
    if( count > 0 ){
      return callback(null, true);
    }else {
      return callback(null, false);
    }
  });
}


var setPreReq = function setPreReq(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*'); //used to allow same user request from any client
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  if(mongoose.connection.readyState==0){
    res.status(500);
    return  res.send(errConfig.E117);
  }
  next();
}

var processSigninReq = function processSigninReq(req, res){
  logger.info("SignIn request "+ JSON.stringify(req.body))
  if( !req.body.email || !req.body.password)
  return res.status(400).send(errConfig.E119);
  usrAccts.findOne({"account.email": req.body.email}, function(err, data){
    if(err)
    return res.status(500).send(errConfig.E120);
    if(!data)
    return res.status(400).send(errConfig.E122);
    if(!bcrypt.compareSync(req.body.password, data.account.password))
    return res.status(400).send(errConfig.E123)
    var token = jwt.sign({ "userId": data._id }, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
    res.location("user/"+data._id+"/trx").status(200).send(token);
  })
}

var sendPwdToEmail = function(req, res){
  logger.info("Forgot password request "+ JSON.stringify(req.body))
  if( !req.body.email)
  return res.status(400).send(errConfig.E119);
  usrAccts.findOne({"account.email": req.body.email}, function(err, user){
    if(err)
    return res.status(500).send(errConfig.E120);
    if(!user)
    return res.status(400).send(errConfig.E122);
    var tempPwd = Math.floor(1000 + Math.random() * 9000).toString();
    user.account.password  = bcrypt.hashSync(tempPwd, 10);
    user.save(function(err, usr){
      if(err)
      return res.status(500).send(errConfig.E120);
      var emailPwdText= sConfig.emailPwdText+"<br>"+tempPwd;
      sendEmail(mailTrns, sConfig.mailSerUser, req.body.email, sConfig.emailPwdSubject, emailPwdText, res);
    })
  })
}

var usrInfoUpdate = function(req, res){
  logger.info("Update Request "+ JSON.stringify(req.body))
  usrAccts.findById(req.userId, function(err, user){
    if(err)
    return res.status(500).send(errConfig.E120);
    if(!user)
    return res.status(400).send(errConfig.E137);
    var err;
    switch (req.body.updatecode) {
      case "1":
      user.sourceOfMoneyTrx.expenseSource=req.body.updateitem;
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      case "2":
      user.sourceOfMoneyTrx.incomeSource=req.body.updateitem;
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      case "3":
      user.moneyAccount=req.body.updateitem;
      // return setTimeout(function(){ res.status(500).send(errConfig.E120); }, 2000);
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      case "4":
      if( err=valMeth.valPwd(req.body.updateitem) )
      return res.status(400).send(err);
      var hashpwd = bcrypt.hashSync(req.body.updateitem, 10);
      user.account.password = hashpwd;
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      case "5":
      if( err=valMeth.valEmail(req.body.updateitem) )
      return res.status(400).send(err);
      user.account.email=req.body.updateitem;
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      case "6":
      user.account.phone=req.body.updateitem;
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      case "7":
      if( err=valMeth.valName(req.body.updateitem) )
      return res.status(400).send(err);
      user.account.fullname=req.body.updateitem;
      user.save(function(err){
        if(err)
        return res.status(500).send(errConfig.E120);
        return res.status(200).send(errConfig.E138);
      })
      break;

      default:
      return res.status(400).send(errConfig.E139);
    }
  })
}


var processSignupReq = function(req, res){
  logger.info("Signup request "+ JSON.stringify(req.body))
  var err;
  if( err=valMeth.valEmail(req.body.email) )
  return res.status(400).send(err);
  switch (req.body.signupCode) {
    case "1":
    var usrEmail=req.body.email;
    isEmailAlreadyVerReg(usrAccts, usrEmail, function(err, isEmailReg){
      if (err)
      return res.status(500).send(errConfig.E120);
      if (isEmailReg)
      return res.status(400).send(errConfig.E124)
      usrVerTemps.findOne({email: usrEmail}, function(err, usr){
        if (err)
        return res.status(500).send(errConfig.E120);
        if(!usr){
          usrVerRec = new usrVerTemps();
          usrVerRec.email = usrEmail;
          usrVerRec.verCode = Math.floor(1000 + Math.random() * 9000);
          usrVerRec.save(function(err, data){
            if (err)
            return res.status(500).send(errConfig.E121);
            var emilVerCodeText= sConfig.emailverText+"<br>"+usrVerRec.verCode;
            sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, emilVerCodeText, res);
          })
        }else {
          usr.verCode = Math.floor(1000 + Math.random() * 9000);
          usr.save(function(err, data){
            if (err)
            return res.status(500).send(errConfig.E121);
            var emilVerCodeText= sConfig.emailverText+"<br>"+usr.verCode;
            sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, emilVerCodeText, res);
          })
        }
      })
    })
    break;

    case "2":
    var email = req.body.email;
    usrVerTemps.findOne({email: email}, function(err, usr){
      if (err)
      return res.status(500).send(errConfig.E121);
      if(!usr)
      return res.status(400).send(errConfig.E128);
      if(usr.verCode != req.body.verCode)
      return res.status(400).send(errConfig.E125)
      usr.verStatus = 1;
      usr.save(function(err, data){
        if (err)
        return res.status(500).send(errConfig.E121);
        return res.status(200).send(errConfig.S102);
      }
    );
  });
  break;

  case "3":
  usrVerTemps.findOne({email: req.body.email}, function(err, usrTemp){
    if(err)
    return res.status(500).send(errConfig.E121);
    if(!usrTemp || usrTemp.verStatus != 1)
    return res.status(400).send(errConfig.E127);
    if ( err=valMeth.valPwd(req.body.password) )
    return res.status(400).send(err);
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
      if(err)
      return res.status(500).send(errConfig.E121);
      usrTemp.remove(function(err){console.log("error occured while deleting temp record");});
      var token = jwt.sign({ "userId": user._id }, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
      return res.location("user/"+user._id+"/info").status(201).send(token);
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
  getUserInfo:             getUserInfo,
  getUserPrsTrx:           getUserPrsTrx,
  processUserPrsTrx:       processUserPrsTrx,
  usrInfoUpdate:           usrInfoUpdate,
  sendPwdToEmail:          sendPwdToEmail,
  logger:                  logger,
  isSconfigEnvValid:        isSconfigEnvValid
}





// module.exports
