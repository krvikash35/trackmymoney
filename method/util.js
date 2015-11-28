var errConfig   = require('../config/error')
var sConfig     = require('../config/server')
var valMeth     = require('./val')
var tmcdb       = require('../models/trackmymoney')
var nodemailer  = require('nodemailer');
var bcrypt      = require('bcrypt');
var jwt         = require("jsonwebtoken")
var usrAccts    = tmcdb.usrAccts;
var usrVerTemps = tmcdb.usrVerTemps;
var usrPrsTrxs  = tmcdb.usrPrsTrxs;








var processUserPrsTrx = function(req, res){
  console.log(req.body);
  var userPrsnlTrx            = new usrPrsTrxs();
  userPrsnlTrx.amount         = req.body.amount;
  userPrsnlTrx.type           = req.body.type;
  userPrsnlTrx.source         = req.body.source;
  userPrsnlTrx.destination    = req.body.destination
  userPrsnlTrx.description    = req.body.description;
  console.log(req.params.userId);
  userPrsnlTrx.userId         = req.params.userId;
  userPrsnlTrx.save(function(err, data){
    if(err){
      res.status(500)
      return res.send(errConfig.E120);
    }
    res.status(201);
    return res.send(errConfig.S103);

  });
}

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

var getUserPrsTrx = function(req, res){
  usrPrsTrxs.find({userId: req.params.userId}, function(err, userPrsTrx){
    if(err){
      res.status(500)
      return res.send(errConfig.E120);
    }
    if(userPrsTrx.length==0){
      res.status(400);
      return res.send(errConfig.E130)
    }
    res.status(200);
    return res.send(userPrsTrx);
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
  var mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: htmltext // plaintext body    html: '<b>Hello world ✔</b>' // html body
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      res.send(errConfig.E118)
    }else {
      res.send(errConfig.S100)
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

var usrInfoUpdate = function(req, res){

  usrAccts.findById(req.params.userId, function(err, user){
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
      console.log(req.body);
      user.sourceOfMoneyTrx.incomeSource=req.body.updateitem;
      user.save(function(err){
        if(err){
          console.log(err);
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

  }


var processSignupReq = function(req, res){
    console.log(req.body);
    switch (req.body.signupCode) {
      case 1:
      return checkEmailForSignup(req, res);
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
              var emilVerCodeText= sConfig.emailverText+"<br>"+usrVerRec.verCode;
              sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, emilVerCodeText, res);
            }
          })
        }else {
          usr.verCode = Math.floor(1000 + Math.random() * 9000);
          usr.save(function(err, data){
            if (err){
              res.status(500);
              return res.send(errConfig.E121);
            }else {
              var emilVerCodeText= sConfig.emailverText+"<br>"+usr.verCode;
              sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, emilVerCodeText, res);
            }
          });
        }
      });
      break;

      case 2:
      return checkEmailForSignup(req, res);
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
    return checkEmailForSignup(req, res);
    console.log(req.body);
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
  getUserInfo:             getUserInfo,
  getUserPrsTrx:           getUserPrsTrx,
  processUserPrsTrx:       processUserPrsTrx,
  usrInfoUpdate:           usrInfoUpdate
}





// module.exports
