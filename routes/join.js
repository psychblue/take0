/*
Functions for User Join & Withdraw Page
*/

//Modules
logger = require('winston');

/*
User Join Function
*/
exports.joinUser = function(mysqlDb){
  return function(req, res, next){
    //Password Encryption
    var encryptedPassword = require('./login').encryptPassword(req);
    //Check Submitted Fields
    if(isAvailField(req, res)){
      //Query for Insert User
      var insertUser = "INSERT INTO takeUser values\(\"" + req.body.username + "\", \"" + encryptedPassword + "\"\)";
      //Inserting to User DB
      mysqlDb.query(insertUser, function(err, rows, fields){
        //DB Error Case
        if(err){
          logger.error(err);
          //User is Already Exist
          if(err.code == "ER_DUP_ENTRY"){
            res.send("Username is Already Exist");
          }
          else{
            res.send("Error");
          }
        }else{
          var user = {'username': req.body.username};
          //Session Login
          req.login(user, function(err){
            //Session Error Case
            if(err){
              logger.error(err);
              return res.send(err);
            }else{
              //Redirect to Main Page
              return res.redirect('/');
            }
          });
        }
      });
    }
    //Fields Error
    else{
      logger.error("[User Login] Submitted Field Error");
    }
  }
}

/*
User Withdraw Function
*/
exports.withdrawUser = function(mysqlDb){
  return function(req, res, next){
    //Query for Delete User
    var deleteUser = "DELETE FROM takeUser WHERE username =\'" + req.user.username + "\'";
    //Deleting From User DB
    mysqlDb.query(deleteUser, function(err, rows, fields){
      //DB Error Case
      if(err){
        res.send('Error');
      }else{
        //Session Logout
        req.logout();
        //Redirecting to Success Page
        res.redirect('/withdraw/success');
      }
    });
  }
}

/*
User Join Field Availability Check Function
*/
function isAvailField(req, res){
  if(!req.body.password || !req.body.username){
    res.send("Enter Username or Password");
    return 0;
  }
  else{
    return 1;
  }
}
