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
var userGroup   = tmcdb.userGroup;
var userGroupTrx= tmcdb.userGroupTrx;
var userNoti    = tmcdb.userNoti;
var mongoose   = require("mongoose");
var winston     = require("winston");
var promise    = require("bluebird")
var mailTrns = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: sConfig.mailSerUser,
    pass: sConfig.mailSerUserPwd
  }
})
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


var isDBConnectionLive = function(){
  if(mongoose.connection.readyState==0){
    return false
  }else {
    return true;
  }
}

var isSconfigEnvValid   = function(){
  var result=[{"serverSecret": sConfig.serverSecret}, {"mailSerUserPwd": sConfig.mailSerUserPwd}];
  logger.info("sConfigInit env "+JSON.stringify(result))
  if(!sConfig.serverSecret)
  return false;
  if(!sConfig.mailSerUserPwd)
  return false;
  return true;
}

var sendEmail = function sendEmail(to, subject, htmltext){
  logger.debug("Inside emailSend ")
  var mailOptions = {
    from: sConfig.mailSerUser,
    to: to,
    subject: subject,
    html: htmltext
  };

  return new promise(function(resolve, reject){
    mailTrns.sendMail(mailOptions,function(err, info){
      logger.info("mailOptions "+JSON.stringify(mailOptions))
      if(err){
        logger.error("error while sending mail "+" error "+ err)
        reject(errConfig.E118)
      }else{
        logger.info("email sent")
        resolve(errConfig.S100)
      }
    })
  })
}

var getUserByEmail = function(email){
  return new promise(function(resolve, reject){
    if(!isDBConnectionLive()){
      reject(errConfig.E117)
    }
    usrAccts.findOne({"account.email": email}, function(err, data){
      if(err)
      reject(errConfig.E120)
      resolve(data)
    })
  })
}

var getTempUserByEmail = function(email){
  return new promise(function(resolve, reject){
    if(!isDBConnectionLive()){
      reject(errConfig.E117)
    }
    usrVerTemps.findOne({email: email}, function(err, data){
      if(err){
        reject(err)
      }else{
        resolve(data)
      }
    })
  })
}

var getUserGroup = function(userId){
  return new promise(function(resolve, reject){
    userGroup.find({'grMember.grMemId': userId}, function(err, userGroupData){
      if(err){
        logger.error(JSON.stringify(err))
        reject(errConfig.E120)
      }else{
        resolve(userGroupData)
      }
    })
  })
}

var createUserGroup = function(creator, groupName){
  return new promise(function(resolve, reject){
    usrGp = new userGroup();
    usrGp.grName = groupName;
    usrGp.admin  = creator;
    usrGp.grCreateDate = new Date()
    usrGp.save(function(err, usrGpData){
      if(err){
        logger.error(JSON.String(err));
        reject(errConfig.E120);
      }else {
        resolve(usrGpData)
      }
    })
  })
}


//1-add 2-delete
var updateUserGroup = function( updator, groupId,  userEmail, upTypeCode){
  return new promise(function(resolve, reject){
    if ( !(mongoose.Types.ObjectId.isValid(groupId)) ) {
      reject(errConfig.E143)
    }
    getUserByEmail(userEmail)
    .then(function(data){
      if(!data)
      reject(errConfig.E122)
    })
    .catch(function(err){reject(err)})
    userGroup.findOne({_id: groupId, 'grMember.grMemEmail':userEmail}, function(err, usrGpData){
      if(err){
        logger.error(JSON.stringify(err))
        reject(errConfig.E120)
      }else{


        switch (upTypeCode) {
          case "1":
          if(usrGpData){
            reject(errConfig.E147)
          }
          if(userEmail !== updator){
            reject(errConfig.E146)
          }else {
            usrGpData.groupMember.push({grMemEmail: userEmail})
            usrGpData.save(function(err){
              if(err){
                logger.error(JSON.stringify(err))
                reject(errConfig.E120)
              }else {
                resolve(errConfig.S105)
              }
            })
          }
          break;

          case "2":
          if(!usrGpData){
            reject(errConfig.E142)
          }
          if(usrGpData.grAdmin != updator){
            reject(errConfig.E144)
          }else {
            usrGpData.groupMember.pull({grMemEmail: userEmail})
            usrGpData.save(function(err){
              if(err){
                logger.error(JSON.stringify(err))
                reject(errConfig.E120)
              }else {
                resolve(errConfig.S101)
              }
            })
          }
          break;
          default:
          reject(errConfig.E145)
        }
      }
    })
  })
}

var deleteUserGroup = function( groupId, updator, userEmail){
  return new promise(function(resolve, reject){
    if ( !(mongoose.Types.ObjectId.isValid(groupId)) ) {
      reject(errConfig.E143)
    }
    getUserByEmail(userEmail)
    .then(function(data){
      if(!data)
      reject(errConfig.E122)
    })
    .catch(function(err){reject(err)})
    userGroup.findOne({_id: groupId, 'grMember.grMemEmail':userEmail}, function(err, usrGpData){
      if(err){
        logger.error(JSON.stringify(err))
        reject(errConfig.E120)
      }else{
        if(!usrGpData){
          reject(errConfig.E142)
        }else {
          if(usrGpData.grAdmin != updator){
            reject(errConfig.E144)
          }else {
            usrGpData.groupMember.pull({grMemEmail: userEmail})
            usrGpData.save(function(err){
              if(err){
                logger.error(JSON.stringify(err))
                reject(errConfig.E120)
              }else {
                resolve(errConfig.S101)
              }
            })
          }
        }
      }
    })
  })
}

var reqToAddGrpMem = function(){

}

var createNotification = function(nSub, nText, nUsers, nParams, nType){
  return new promise(function(resolve, reject){
    for(var i=0; i<nUsers.length;i++){
      var noti = new userNoti();
      noti.notiSubject = nSub;
      noti.notiText = nText;
      noti.nParams  = nParams;
      noti.nType    = nType;
      noti.notiUser = nUsers[i];
      noti.save(function(err){
        logger.error(JSON.stringify(err))
        reject(errConfig.E120)
      })
    }
    resolve(errConfig.S106)
  })
}

var readNotification = function(userEmail){
return new promise(function(resolve, reject){
  userNoti.find({notiUser: userEmail}, function(err, notiData){
    if(err){
      logger.error(JSON.stringify(err))
      reject(errConfig.E120);
    }else{
      resolve(notiData)
    }
  })
})

var deleteNotification = function(userEmail, which){
var q;
switch (which) {
  case "all":
    q={notiUser: userEmail}
    break;
  case "unread":
    q={notiUser: userEmail, notiIsRead: false}
  default:
    q={notiUser: userEmail, notiIsRead: true}
}
return new promise(function(resolve, reject){
  userNoti.remove(q, function(err, uNoti){
    if(err){
      logger.error(JSON.stringify(err))
      reject(errConfig.E120);
    }else{
      resolve(errConfig.S107)
    }
  })
})
}


}

var createGrpTrx = function(){

}

var deleteGrpTrx = function(){

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
      sendEmail(req.body.email, sConfig.emailPwdSubject, emailPwdText)
      .then(function(data){
        return res.status(200).send(data)
      })
      .catch(function(err){
        return res.status(500).send(err)
      })
    })
  })
}

var processAuthAccessReq = function processAuthAccessReq(req, res, next){
  logger.debug("Inside Priviledge Area Request")
  var bearerHeader = req.headers["authorization"]; //Authorization :'Bearer token'
  if( !bearerHeader || !bearerHeader.split(" ")[1] ){
    logger.warn("Invalid Auth header "+JSON.stringify(req.headers))
    return res.status(403).send(errConfig.E115)
  }
  jwt.verify(bearerHeader.split(" ")[1], sConfig.serverSecret, function(err, decoded){
    if(err){
      if( err.name == 'TokenExpiredError')
      return res.status(401).send(errConfig.E114)
      logger.warn("Invalid token "+JSON.stringify(req.headers))
      return res.status(403).send(errConfig.E115)
    }
    if(req.params.userId != decoded.userId){
      return res.status(403).send(errConfig.E116)
    }
    req.userId = decoded.userId;
    next();
  });
}

var setPreReq = function setPreReq(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*'); //used to allow same user request from any client
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
}

var processSigninReq  = function processSigninReq(req, res){
  logger.info("SignIn request "+ JSON.stringify(req.body))
  if( !req.body.email || !req.body.password)
  return res.status(400).send(errConfig.E119);
  getUserByEmail(req.body.email)
  .then(function(data){
    if(!data)
    return res.status(400).send(errConfig.E122);
    if(!bcrypt.compareSync(req.body.password, data.account.password))
    return res.status(400).send(errConfig.E123)
    var token = jwt.sign({ "userId": data._id }, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
    res.location("user/"+data._id+"/trx").status(200).send(token);
  })
  .catch(function(err){return res.status(500).send(err);})
}

var processSignupReq  = function(req, res){
  logger.info("Signup request "+ JSON.stringify(req.body))
  var err;
  if( err=valMeth.valEmail(req.body.email) )
  return res.status(400).send(err);
  switch (req.body.signupCode) {
    case "1":
    var usrEmail=req.body.email;
    getUserByEmail(usrEmail)
    .then(function(data){
      if(data){
        return res.status(400).send(errConfig.E124)
      }else {
        getTempUserByEmail(usrEmail)
        .then(function(tempUser){
          if(tempUser){
            tempUser.verCode = Math.floor(1000 + Math.random() * 9000);
            tempUser.save(function(err, data){
              if (err)
              return res.status(500).send(errConfig.E121);
              var emilVerCodeText= sConfig.emailverText+"<br>"+tempUser.verCode;
              sendEmail(usrEmail, sConfig.emailVerSubject, emilVerCodeText)
              .then(function(data){
                return res.status(200).send(data)
              })
              .catch(function(err){
                return res.status(500).send(err)
              })
            })
          }else{
            usrVerRec = new usrVerTemps();
            usrVerRec.email = usrEmail;
            usrVerRec.verCode = Math.floor(1000 + Math.random() * 9000);
            usrVerRec.save(function(err, data){
              if (err)
              return res.status(500).send(errConfig.E121);
              var emilVerCodeText= sConfig.emailverText+"<br>"+usrVerRec.verCode;
              sendEmail(usrEmail, sConfig.emailVerSubject, emilVerCodeText)
              .then(function(data){
                return res.status(200).send(data)
              })
              .catch(function(err){
                return res.status(500).send(err)
              })
            })
          }
        })
        .catch(function(err){return res.status(400).send(err)})
      }
    })
    .catch(function(err){return res.status(500).send(err)})
    break;

    case "2":
    var email = req.body.email;
    getTempUserByEmail(email)
    .then(function(tempUser){
      if(!tempUser){
        return res.status(400).send(errConfig.E128);
      }else {
        if(tempUser.verCode != req.body.verCode)
        return res.status(400).send(errConfig.E125)
        tempUser.verStatus = 1;
        tempUser.save(function(err, data){
          if (err)
          return res.status(500).send(errConfig.E121);
          return res.status(200).send(errConfig.S102);
        })
      }
    })
    .catch(function(err){return res.status(500).send(err);})
    break;

    case "3":
    getTempUserByEmail(req.body.email)
    .then(function(usrTemp){
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
      usrAcctRec.account.creatDate  = new Date();
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
    })
    .catch(function(err){return res.status(500).send(err);})
    break;

    default:
    res.status(400);
    return res.send(errConfig.E126);
  }
}

var updateUserInfo    = function(req, res){
  logger.info("Update Request "+ JSON.stringify(req.body))
  usrAccts.findById(req.userId, function(err, user){
    if(err){
      logger.error(JSON.stringify(err))
      return res.status(500).send(errConfig.E120);
    }
    if(!user)
    return res.status(400).send(errConfig.E137);
    var err;
    user.account.updateDate=new Date();
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

var readUserInfo      = function(req, res){
  logger.info("get userInfo request "+ JSON.stringify(req.headers))
  if ( !(mongoose.Types.ObjectId.isValid(req.userId)) )
  return res.status(400).send(errConfig.E141)
  usrAccts.findById(req.userId, function(err, user){
    if(err){
      logger.error(JSON.stringify(err))
      return res.status(500).send(errConfig.E120);
    }
    if(!user)
    return res.status(400).send(errConfig.E129)
    return res.status(200).send(user);
  })
}

var createUserPrsTrx  = function(req, res){
  logger.info("process prsnlTrx request "+ JSON.stringify(req.body))
  var userPrsnlTrx            = new usrPrsTrxs();
  userPrsnlTrx.amount         = req.body.amount;
  userPrsnlTrx.type           = req.body.type;
  userPrsnlTrx.source         = req.body.source;
  userPrsnlTrx.destination    = req.body.destination
  userPrsnlTrx.description    = req.body.description;
  userPrsnlTrx.userId         = req.userId;
  userPrsnlTrx.date           = req.body.date;
  userPrsnlTrx.save(function(err, data){
    if(err){
      logger.error(JSON.stringify(err))
      return res.status(500).send(errConfig.E120);
    }
    return res.status(201).send(errConfig.S103);
  });
}

var readUserPrsTrx    = function(req, res){
  logger.info("get PrsnlTrx request "+ JSON.stringify(req.headers))
  usrPrsTrxs.find({userId: req.userId}, function(err, userPrsTrx){
    if(err){
      logger.error(JSON.stringify(err))
      return res.status(500).send(errConfig.E120);
    }
    return res.status(200).send(userPrsTrx);
  });
}

var deleteUserPrsTrx  = function(req, res){
  logger.info("delete PrsnlTrx request"+JSON.stringify(req.headers));
  var trxId=req.params.trxId;
  if (mongoose.Types.ObjectId.isValid(req.params.trxId)){
    usrPrsTrxs.findById({_id: trxId}, function(err, trx){
      if(err){
        logger.error(err)
        return res.status(500).send(errConfig.E120);
      }
      if(trx){
        trx.remove();
        return res.status(200).send(errConfig.S104)
      }else{
        return res.status(400).send(errConfig.E140)
      }
    })
  }else {
    return res.status(400).send(errConfig.E140)
  }
}





module.exports ={
  sendEmail:               sendEmail,
  processAuthAccessReq :   processAuthAccessReq,
  setPreReq :              setPreReq,
  processSigninReq :       processSigninReq,
  processSignupReq :       processSignupReq,
  sendPwdToEmail:          sendPwdToEmail,
  logger:                  logger,
  isSconfigEnvValid:       isSconfigEnvValid,
  readUserInfo:            readUserInfo,
  updateUserInfo:          updateUserInfo,
  createUserPrsTrx:        createUserPrsTrx,
  readUserPrsTrx:          readUserPrsTrx,
  deleteUserPrsTrx:        deleteUserPrsTrx
}





// module.exports
