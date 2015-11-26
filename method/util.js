var errConfig   = require('../config/error')
var sConfig     = require('../config/server')
var valMeth     = require('./val')
var tmcdb       = require('../models/trackmymoney')
var nodemailer  = require('nodemailer');

var mailTrns = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: sConfig.mailSerUser,
    pass: sConfig.mailSerUserPwd
  }
})

module.exports ={

  sendEmail: function(transporter,from, to, subject, text){
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
  },

  processAuthAccessReq : function processAuthAccessReq(req, res, next){
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
  },

  checkEmailForSignup : function(req, res){
    tmcdb.usrAcct.count({'account.email': req.body.email}, function(err, count){
      if (err){
        res.status(500);
        return res.send(errConfig.E120);
      }
      if( count > 0 ){
        res.status(400);
        return res.send(errConfig.E124);
      }
    });
  },


  setPreReq : function setPreReq(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*'); //used to allow same user request from any client
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    if(mongoose.connection.readyState==0){
      res.status(500);
      return  res.send(errConfig.E117);
    }
    next();
  },

  processSigninReq : function processSigninReq(req, res){
    if( !req.body.email || !req.body.password){
      res.status(400);
      return res.send(errConfig.E119);
    }
    tmcdb.usrAcct.findOne({"account.email": req.body.email}, function(err, data){
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
      var usr   = { "userId": data._id };
      var token = jwt.sign(usr, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
      var loc   = "user/"+data._id+"/trx"
      res.setHeader("Location", loc);
      res.status(200);
      res.send(token);
    })
  },

  processSignupReq : function(req, res){
    switch (req.body.signupCode) {
      case 1:
      checkEmailForSignup(req, res);
      tmcdb.usrVerTemp.find({email: 'req.body.email'}, function(err, usr){
        if (err){
          res.status(500)
          return res.send(errConfig.E120);
        }
        var usrEmail = req.body.email;
        if(!usr){
          tmcdb.usrVerTemp.email = usrEmail;
          tmcdb.usrVerTemp.verCode = Math.floor(1000 + Math.random() * 9000);
          tmcdb.usrVerTemp.save(function(err, data){
            if (err){
              res.status(500);
              return res.send(errConfig.E121);
            }else{
              sendEmail(mailTrns, sConfig.mailSerUser, usrEmail, sConfig.emailVerSubject, sConfig.emailverText);
              res.status(200)
              res.status(errConfig.S101)
            }
          })
        }else {
          usr.verCode = Math.floor(1000 + Math.random() * 9000);
          usr.save(function(err, data){
            if (err){
              res.status(500);
              res.send(errConfig.E121);
            }else {
              res.status(200);
              res.send(errConfig.S101);
            }
          });
        }
      })
      break;

      case 2:
      checkEmailForSignup(req, res);
      var email = req.body.email;
      tmcdb.usrVerTemp.find({email: email}, function(err, usr){
        if (err){
          res.status(500);
          res.send(errConfig.E121);
        }else {
          if(usr.verCode !== req.body.verCode){
            res.status(400);
            res.status(errConfig.E125)
          }else{
            usr.verStatus = 1;
            usr.save(function(err, data){
              if (err){
                res.status(500);
                res.send(errConfig.E121);
              }else {
                res.status(200);
                res.send(errConfig.S101);
              }
            })
          }
        }
      })
      break;

      case 3:
      checkEmailForSignup(req, res);
      tmcdb.usrVerTemp.find({email: req.body.email}, function(err, usrEmail){
        if (err){
          res.status(500);
          res.send(errConfig.E121);
        }else {
          if(usrEmail.verStatus !== 1){
            res.status(500);
            res.send(errConfig.E127);
          }else{
            var hashpwd  = bcrypt.hashSync(req.body.password, 10);
            var usrAcct  = new usrAcct();
            usrAcct.account.email      = req.body.email;
            usrAcct.account.phone      = req.body.phone;
            usrAcct.account.fullname   = req.body.fullname;
            usrAcct.account.password   = hashpwd;
            usrAcct.account.creatDate  = new Date().toISOString();
            usrAcct.moneyAccount       = sConfig.initMoneyAccount;
            usrAcct.sourceOfMoneyTrx.incomeSource =sConfig.initIncomeSource;
            usrAcct.sourceOfMoneyTrx.expenseSource =sConfig.initExpenseSource;
            usrAcct.save(function(err, data){
              if(err){
                res.send(500);
                return res.send(errConfig.E121)
              }else{
                var usr   = { "userId": data._id };
                var token = jwt.sign(usr, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
                var loc="user/"+data._id+"/info";
                res.status(201);
                res.setHeader("Location",loc);
                return res.send(token);
              }
            });
          }
        }
      })
      break;
      default:
      res.send(400);
      return res.send(errConfig.E126);
    }
  }

}


// module.exports
