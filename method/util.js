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
mongoose.Promise = require("bluebird")
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

var readUserGroup = function(req, res){
  logger.debug("Inside readUserGroup")
  logger.info("readUserGroup Request by: "+ req.email)
  userGroup.find({'grMember.grMemEmail': req.email}, function(err, userGroupData){
    if(err){
      logger.error(JSON.stringify(err))
      return res.status(500).end(errConfig.E120)
    }else{
      console.log(userGroupData);
      return res.status(200).send(userGroupData)
    }
  })
}

var createUserGroup = function(req, res){
  logger.info("createUserGroup Request By: "+req.email+" req: "+JSON.stringify(req.body))
  console.log(req.fullname);
  var err;
  if(err=valMeth.valGrName(req.body.grName)){
    return res.status(400).send(err);
  }
  usrGp = new userGroup();
  usrGp.grName = req.body.grName;
  usrGp.grAdmin  = req.email;
  usrGp.grMember.push({grMemName: req.fullname, grMemEmail:req.email})
  usrGp.grCreateDate = new Date()
  usrGp.grTemplate = sConfig.grTemplate;
  usrGp.save(function(err, usrGpData){
    if(err){
      logger.error(JSON.String(err));
      return res.status(500).send(errConfig.E120);
    }else {
      return res.status(201).send(errConfig.S109);
    }
  })
}

var deleteUserGroup = function(req, res){
  logger.debug("Inside deleteUserGroup")
  logger.info("deleteUserGroup request by: "+req.email)
  if ( !(mongoose.Types.ObjectId.isValid(req.params.groupId)) ) {
    return res.status(400).send(errConfig.E143);
  }

  userGroup.findById({_id: req.params.groupId }, function(err, userGroup){
    if(err)
    res.status(500).send(errConfig.E120);
    if(userGroup.grAdmin !== req.email)
    return res.status(400).send(errConfig.E157)
    userGroup.remove()
    return res.status(200).send(errConfig.S110)
  })
}



//1-add 2-delete
var updateUserGroup = function(req, res){
  logger.debug("inside updateUserGroup");
  logger.info("updateUserGroup Request By: "+ req.email+" req: "+JSON.stringify(req.body))


  switch (req.body.updateTypeCode) {
    case "1":
    var gData;
    if ( !(mongoose.Types.ObjectId.isValid(req.body.groupId)) ) {
      return res.status(400).send(errConfig.E143);
    }
    userGroup.findOne({_id: req.body.groupId, grAdmin: req.email, 'grMember.grMemEmail': req.email}, {grName:1, 'grMember.$':1}).exec()
    .then(function isGroupCreatedByAdmin(gData){
      if(!gData){
        throw ({name: "BadRequestError", message: errConfig.E151})
      }
      this.gData=gData;
    })
    .then(function getInviteeDetails(){
      return usrAccts.findOne({'account.email': req.body.inviteeEmail}).exec()
    })
    .then(function isInviteeIsRegisterd(iData){
      if(!iData){
        throw ({name: "BadRequestError", message: errConfig.E122})
      }
    })
    .then(function isInviteeAlreadyAdded(){
      return userGroup.findOne({_id: req.body.groupId, 'grMember.grMemEmail': req.body.inviteeEmail}).exec()
    })
    .then(function isInviteeAlreadyAdded(iData){
      if(iData)
      throw ({name: "BadRequestError", message: errConfig.E150})
    })
    .then(function isInviteAlreadySend(){
      return userNoti.find({notiType:1, notiIsRead: false, notiUser: req.body.inviteeEmail, 'notiParam.pValue': req.body.groupId} ).exec()
    })
    .then(function(data){
      if(data.length!=0)
      throw ({name: "BadRequestError", message: errConfig.E158})
    })
    .then(function prepareNoti(){
      var noti={};
      grName    = this.gData.grName;
      gAdminEmail = this.gData.grMember[0].grMemEmail;
      gAdminName = this.gData.grMember[0].grMemName;
      noti.nSub=sConfig.addToGrNotiSub;
      noti.nText = "["+ gAdminEmail+"] has invited you to join group "+grName
      noti.nUsers = [{"grMemEmail": req.body.inviteeEmail}]
      noti.notiDate = new Date();
      noti.nParams =[{pName: "groupId", pValue: req.body.groupId}];
      noti.nType = sConfig.nType.reqToAddGrpMem;
      return createNotification(noti)

    })
    .then(function(noti){
      return res.status(201).send(noti)
    })
    .catch(function(err){
      if(err.name === "BadRequestError"){
        logger.warn(JSON.stringify(err))
        return res.status(400).send(err.message)
      }
      logger.error(JSON.stringify(err))
      return res.status(500).send(err.message)
    })
    break;

    case "2":
    var nData;
    if ( !(mongoose.Types.ObjectId.isValid(req.body.notificationId)) ) {
      return res.status(400).send(errConfig.E153);
    }
    userNoti.findOne({_id: req.body.notificationId, notiUser: req.email}).exec()
    .then(function(data){
      if(!data){
        throw ({name: "BadRequestError", message: errConfig.E153})
      }else {
        return data
      }
    })
    .then(function(nData){
      if(nData.notiType != 1 || nData.notiIsRead){
        throw ({name: "BadRequestError", message: errConfig.E154})
      }else {
        this.nData=nData
        return userGroup.findOne({_id: nData.notiParam[0].pValue})
      }
    })
    .then(function(gData){
      if(!gData)
      throw ({name: "BadRequestError", message: errConfig.E159})
      gData.grUpdateDate = new Date();
      gData.grMember.push({grMemName: req.fullname, grMemEmail: req.email})
      return gData.save();
    })
    .then(function(upGData){
      this.nData.notiIsRead=true;
      this.nData.save()
      userGroupTrx.remove({grId:this.nData.notiParam[0].pValue}).exec()
      return res.status(200).send(errConfig.S105)
    })
    .catch(function(err){
      if(err.name === "BadRequestError"){
        logger.warn(JSON.stringify(err))
        return res.status(400).send(err.message)
      }
      logger.error(JSON.stringify(err))
      return res.status(500).send(err.message)
    })
    break;

    case "3":
    var gData;
    if ( !(mongoose.Types.ObjectId.isValid(req.body.groupId)) ) {
      return res.status(400).send(errConfig.E143);
    }
    userGroup.findOne({_id: req.body.groupId, grAdmin: req.email, 'grMember.grMemEmail': req.email}, {grName:1, 'grMember.$':1}).exec()
    .then(function isGroupCreatedByAdmin(gData){
      if(!gData){
        throw ({name: "BadRequestError", message: errConfig.E151})
      }
      if(req.email === req.body.grMemEmail)
      throw ({name: "BadRequestError", message: errConfig.E156})
    })
    .then(function(){
      userGroup.update({_id: req.body.groupId}, {$pull: {grMember: {grMemEmail: req.body.grMemEmail}}}).exec()
    })
    .then(function(){
      userGroupTrx.remove({grId:req.body.groupId}).exec()
      return res.status(200).send(errConfig.S108)
    })
    .catch(function(err){
      if(err.name === "BadRequestError"){
        logger.warn(JSON.stringify(err))
        return res.status(400).send(err.message)
      }
      logger.error(JSON.stringify(err))
      return res.status(500).send(err.message)
    })
    break;

    case "4":
      userGroup.update({_id: req.body.groupId, 'grMember.grMemEmail': req.email}, {grTemplate: req.body.grTemplate})
      .then(function(data){
        return res.status(200).send(errConfig.S111)
      })
      .catch(function(err){
        return res.status(200).send(err.message)
      })
    break;
    default:
    return res.status(400).send(errConfig.E145)
  }


}

var updateNotification = function(req, res){
  logger.debug("inside updateNotification")
  logger.info("updateNotification request by: "+ req.email+" req: "+JSON.stringify(req.body))

  switch (req.body.updateTypeCode) {
    case "1":
    if ( !(mongoose.Types.ObjectId.isValid(req.body.notificationId)) ) {
      return res.status(400).send(errConfig.E143);
    }
    userNoti.update({_id: req.body.notificationId},{notiIsRead: true}).exec()
    .then(function(){
      return res.status(200).send()
    })
    break;
    case "2":
    userNoti.remove({notiUser: req.email}).exec()
    .then(function(){
      return res.status(200).send()
    })
    break;
    case "3":
    userNoti.remove({notiUser: req.email, notiIsRead:true}).exec()
    .then(function(){
      return res.status(200).send()
    })
    break
    default:
    return res.status(400).send(errConfig.E139)
  }
}

var createNotification = function(noti){
  logger.debug("Inside createNotification")
  return new promise(function(resolve, reject){
    for(var i=0; i<noti.nUsers.length;i++){
      var uNoti = new userNoti();
      uNoti.notiSubject = noti.nSub;
      uNoti.notiText = noti.nText;
      uNoti.notiParam  = noti.nParams;
      uNoti.notiType    = noti.nType;
      uNoti.notiUser = noti.nUsers[i].grMemEmail;
      uNoti.save()
      .then(function(){
        if(i == noti.nUsers.length)
        return resolve(errConfig.S106)
      })
      .catch(function(err){
        return reject(err)
      })

    }

  })
}

var readNotification = function(req, res){
  logger.debug("inside readNotification")
  logger.info("readNotification request by: "+req.email)
  userNoti.find({notiUser: req.email}).exec()
  .then(function(userNoti){
    res.status(200).send(userNoti)
  })
  .catch(function(err){
    res.status(500).send(err.message);
  })
}


var createGrpTrx = function(req, res){
  logger.debug("inside createGrpTrx")
  logger.info("createGrpTrx request by: "+req.email+"Req: "+JSON.stringify(req.body))
  var err;
  var grData;

  userGroup.findOne({_id: req.body.grId, 'grMember.grMemEmail': req.email},{grName:1, 'grMember.grMemEmail': 1}).exec()
  .then(function(grData){
    if(!grData){
      throw ({name: "BadRequestError", message: errConfig.E143})
    }
    if (!(req.body.gtMem instanceof Array))
    throw ({name: "BadRequestError", message: errConfig.E155})

    this.grData=grData;
    var grMemEmail=[];;
    for(var i=req.body.gtMem.length;i--;){
      grMemEmail.push(req.body.gtMem[i].gtMemEmail)
    }
    return userGroup.findOne({_id: req.body.grId, 'grMember.grMemEmail': {$all: grMemEmail}}).exec()
  })
  .then(function(data){
    if(!data)
    throw ({name: "BadRequestError", message: errConfig.E155})
    this.data=data;
  })
  .then(function(){
    if (err = valMeth.valAmount(req.body.gtAmount)){
      throw ({name: "BadRequestError", message: errConfig.E110})
    }
    var grTrx = new userGroupTrx()
    grTrx.grId = req.body.grId
    grTrx.gtAmount = req.body.gtAmount
    grTrx.gtInitiator = req.email
    grTrx.gtDate = req.body.gtDate
    grTrx.gtMem = req.body.gtMem
    grTrx.gtItem = req.body.gtItem
    grTrx.gtDesc = req.body.gtDesc
    return grTrx.save()
  })
  .then(function(){
    return res.status(201).send(errConfig.S103)
  })
  .catch(function(err){
    if(err.name === "BadRequestError"){
      logger.warn(JSON.stringify(err))
      return res.status(400).send(err.message)
    }
    logger.error(JSON.stringify(err))
    return res.status(500).send(err.message)
  })
}

var deleteGrpTrx = function(req, res){
  logger.debug("inside deleteGrpTrx")
  logger.info("deleteGrpTrx request by: "+req.email)
  var notiDetail={};
  if ( !(mongoose.Types.ObjectId.isValid(req.params.grpTrxId)) ) {
    return res.status(400).send(errConfig.E140);
  }
  userGroupTrx.find({_id: req.params.grpTrxId}).exec()
  .then(function(grpTrxData){
    if(grpTrxData.length==0)
    throw ({name: "BadRequestError", message: errConfig.E140})
    notiDetail.amount=grpTrxData[0].gtAmount;
    notiDetail.initiator=grpTrxData[0].gtInitiator;
    notiDetail.gtDate=grpTrxData[0].gtDate;
    return grpTrxData
  })
  .then(function(data){
    return userGroup.find({_id: data[0].grId, grAdmin: req.email}).exec()
  })
  .then(function(data){
    if(data.length==0)
    throw ({name: "BadRequestError", message: errConfig.E157})
    notiDetail.grName=data[0].grName
    notiDetail.grMem=data[0].grMember;
    userGroupTrx.remove({_id: req.params.grpTrxId})
    .then(function(count){
      var noti={};
      noti.nSub=sConfig.delGrTrx;
      noti.nText = "Group record created by "+notiDetail.initiator+" Date: "+notiDetail.gtDate
      +" Amount: "+notiDetail.amount+ " is rejected by "+notiDetail.grName+" admin ";
      noti.nUsers = notiDetail.grMem;
      noti.notiDate = new Date();
      noti.nType = sConfig.nType.delGrTrx;
      createNotification(noti)
      return res.status(200).send()
    })
  })
  .catch(function(err){
    if(err.name === "BadRequestError"){
      logger.warn(JSON.stringify(err))
      return res.status(400).send(err.message)
    }
    logger.error(JSON.stringify(err))
    return res.status(500).send(err.message)
  })
}

var sendPwdToEmail = function(req, res){
  logger.info("Forgot password request "+ JSON.stringify(req.body))
  if( !req.body.email)
  return res.status(400).send(errConfig.E122);
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
    req.email  = decoded.email;
    req.fullname = decoded.fullname;
    console.log("docode fullname"+decoded.fullname);
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
  logger.info("SignIn request: "+ JSON.stringify(req.body))
  if( !req.body.email || !req.body.password)
  return res.status(400).send(errConfig.E119);
  getUserByEmail(req.body.email)
  .then(function(data){
    if(!data)
    return res.status(400).send(errConfig.E122);
    if(!bcrypt.compareSync(req.body.password, data.account.password))
    return res.status(400).send(errConfig.E123)
    var token = jwt.sign({ "userId": data._id, "email": data.account.email, "fullname": data.account.fullname }, sConfig.serverSecret, {expiresIn: sConfig.tokenExpiresInSecond});
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
              return res.send(emilVerCodeText)
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
        usrVerTemps.remove({email: req.body.email}).exec()
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

var readGrpTrx = function(req, res){
  userGroupTrx.find({'gtMem.gtMemEmail': req.email}).exec()
  .then(function(usrGpTrx){
    return res.status(200).send(usrGpTrx)
  })
  .catch(function(err){
    return res.status(500).send(err.message)
  })
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
  deleteUserPrsTrx:        deleteUserPrsTrx,
  createUserGroup:         createUserGroup,
  updateUserGroup:         updateUserGroup,
  readNotification:        readNotification,
  createGrpTrx:            createGrpTrx,
  readUserGroup:           readUserGroup,
  deleteUserGroup:         deleteUserGroup,
  updateNotification:      updateNotification,
  readGrpTrx:              readGrpTrx,
  deleteGrpTrx:           deleteGrpTrx
}





// module.exports
