// post:  /signup           201(created, lh:/user/:id/info),  409(conflict),500(serverError)
// post:  /signin           200(ok,lh:/user/:id/trx), 400(badrequest) 404(notFound)
// get:   /user/:id/report  200(ok, json), 401(Unauthorized, lh:/sigin)
// get:   /user/:id/info    200(ok, json), 401(Unauthorized, lh:/sigin)
// post:  /user/:id/trx     200(ok, json), 401(Unauthorized, lh:/sigin)
// put:   /user/:id/info    200(ok),       200(ok)
// delete: usrVerTemps

//load all the required module
var express    = require("express");      //main web framework module for node
var app        = express();
var bodyParser = require("body-parser");  // help in parsing the request,response header
var morgan     = require("morgan");       // used for logging
var mongoose   = require("mongoose");     // mongo database driver or module
var sConfig    = require('./config/server');     // holds all the important config var mainly server related
var pubRouter  = express.Router();        //this is public router used for public resources
var privRouter = express.Router();        //this is private router used for private resources
var utilMeth   = require('./method/util');
var logger     = utilMeth.logger;


//use middleware stack, these are executed in declared order whenever any req, res occur
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(utilMeth.setPreReq);
app.use(express.static("app"));
app.use('/user', privRouter);
app.use('/', pubRouter);
privRouter.use('/:userId', utilMeth.processAuthAccessReq); //Middleware for private router to validate the token

//-----------------------------------------------------------------------------------------------
//post('/signin')
//@param: {req.body.[email,password]}
//@response-error:   {res.statusCode: [400,500], res.body.data: "appropriate error msg" }
//@response-success: {res.statusCode: 200, res.body.data: token, locHeader: /usr/:userId/trx}
//------------------------------------------------------------------------------------------------
pubRouter.post('/signin', utilMeth.processSigninReq);


//----------------------------------------------------------------------------------------
//post('/forgotPwd')
//@param: {req.body.email}
//@response-error
//@response-success
//----------------------------------------------------------------------------------------
pubRouter.post('/forgotPwd', utilMeth.sendPwdToEmail);



//-----------------------------------------------------------------------------------------------
//post('/signup')
//@param: {req.body.[email,password]}
//@response-error:   {res.statusCode: [400,500], res.body.data: "appropriate error msg" }
//@response-success: {res.statusCode: 200, res.body.data: token, locHeader: /usr/:userId/trx}
//------------------------------------------------------------------------------------------------
pubRouter.post('/signup', utilMeth.processSignupReq);


//-----------------------------------------------------------------------------------------------
//get('/user/:userId/info')
//@param: {req.param.[userId]}
//@response-error:   {res.statusCode: 400, res.body.data: "No Data Found" }
//@response-success: {res.statusCode: 200, res.body.data: "userInfo"}
//------------------------------------------------------------------------------------------------
privRouter.get('/:userId/info',utilMeth.readUserInfo);

//--------------------------------------------------------------------------------------------
//put('/user:userId/info')
//@param: {req.param.[userId], req.body.updatecode and [1/2/3/4/5/6/7], req.body.updateitem}
//@response-error:   {res.statusCode: 400, res.body.data: "User not found" }
//@response-success: {res.statusCode: 200, res.body.data: "Account Info Updated successfully"}
//1:expenseSource 2:incomeSource 3:moneyAccount 4:password 5:email  6:phone 7:fullname
//------------------------------------------------------------------------------------------
privRouter.put('/:userId/info', utilMeth.updateUserInfo);


//-----------------------------------------------------------------------------------------------
//get('/user/:userId/info')
//@param: {req.param.[userId]}
//@response-error:   {res.statusCode: 400, res.body.data: "No Data Found" }
//@response-success: {res.statusCode: 200, res.body.data: "userReport"}
//----------------------------------------------------------------------------------------------
privRouter.get('/:userId/trx/', utilMeth.readUserPrsTrx);

//-----------------------------------------------------------------------------------------------
//post('/user/:userId/trx')
//@param: {req.param.[userId], req.body.[amount,type,source,destination,description]}
//@response-error:   {res.statusCode: 400, res.body.data: "Invalid transaction data" }
//@response-success: {res.statusCode: 201, res.body.data: "Trx saved successfully"}
//----------------------------------------------------------------------------------------------
privRouter.post('/:userId/trx',utilMeth.createUserPrsTrx);

//-----------------------------------------------------------------------------------------------
//delete('/user/:userId/trx')
//@param: {req.param.[userId], req.body.[amount,type,source,destination,description]}
//@response-error:   {res.statusCode: 400, res.body.data: "Invalid transaction data" }
//@response-success: {res.statusCode: 201, res.body.data: "Trx saved successfully"}
//----------------------------------------------------------------------------------------------
privRouter.delete('/:userId/trx/:trxId', utilMeth.deleteUserPrsTrx)



//----------------------------------------------------------
//CreateGroup by admin
//post('/user/:userId/group') and token
//@req.body: {grName}
//@response-error: appropriate error Code
//@response-success: group details is returned (200)
//------------------------------------------------------------
privRouter.post('/:userId/group', utilMeth.createUserGroup);

privRouter.get('/:userId/group', utilMeth.readUserGroup);


//------------------------------------------------------
//update group
//1-sendMemAddInvite, 2-addGrMem, 3-deleteGrMem
//put('/user/:userId/group/')
//@req.body.[updateTypeCode, groupId, inviteeEmail]
//1- updateTypeCode, groupId, inviteeEmail, token
//2- updateTypeCode, notificationId, token
//3- updateTypeCode, groupId, grMemEmail, token
//@response-error:
//@response-success:
//---------------------------------------------------
privRouter.put('/:userId/group', utilMeth.updateUserGroup)

//----------------------------------------------
//delete usergroup
//
//-----------------------------------------------
privRouter.delete('/:userId/group/:groupId',utilMeth.deleteUserGroup)



//------------------------------------------------------
//read notification
//@req token
//@response-error:
//@response-success:
//---------------------------------------------------
privRouter.get('/:userId/notification', utilMeth.readNotification)


//------------------------------------------------------
//update notification
//@req token, updateTypeCode
//1-markasread, 2-deleteAll, 3-deleteUnread
//1, notificationId
//@response-error:
//@response-success:
//---------------------------------------------------
privRouter.put('/:userId/notification', utilMeth.updateNotification)

//------------------------------------------------------
//Create Group Transaction
//@req token, grId, gtAmount, gtDate, gtMem, gtItem, gtDesc
//@response-error:
//@response-success:
//---------------------------------------------------
privRouter.post('/:userId/group/trx', utilMeth.createGrpTrx)

privRouter.get('/:userId/group/trx', utilMeth.readGrpTrx);

//--------------------------------------------------
//Delete Group transaction
//#req grpTrxId
//--------------------------------------------------
privRouter.delete('/:userId/group/trx/:grpTrxId', utilMeth.deleteGrpTrx)






logger.debug("choosing env")
if(sConfig.runEnv === 'dev') {
  mongoDBUrl = sConfig.devUrl.dbUrl;
  appPort       = sConfig.devUrl.appPort;
  appUrl      = sConfig.devUrl.appUrl;
} else {
  if(sConfig.runEnv === 'prod'){
    mongoDBUrl  = sConfig.prodUrl.dbUrl;
    appPort        = sConfig.prodUrl.appPort;
    appUrl      = sConfig.prodUrl.appUrl;
  }
  else{
    return logger.error("Invalid run env: "+sConfig.runEnv)
  }
}
logger.info("using env: "+sConfig.runEnv)

logger.debug("connecting to Database")
mongoose.connect(mongoDBUrl, function(err){
  if(err){
    return logger.error("failed to connect to: "+mongoDBUrl+" "+err)
  }else{
    logger.info("connected to "+mongoDBUrl)
    logger.debug("checking sConfigInit env value");
    if(!utilMeth.isSconfigEnvValid()){
      return logger.error("Invalid sConfigInit env value")
    }
    logger.debug("Starting app server")
    app.listen(appPort, appUrl, function () {
      logger.info("Listening on " + appUrl + ", server_port " + appPort)
    });
  }
});

process.on('uncaughtException', function(err) {
  logger.error("uncaughtException: "+err+"/n1"+err.stack)
});
