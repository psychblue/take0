exports.joinUser = function(mysqlDb){
  return function(req, res, next){
    var encryptedPassword = require('./login').encryptPassword(req);
    var insertUser = "INSERT INTO takeUser values\(\"" + req.body.username + "\", \"" + encryptedPassword + "\"\)";
    mysqlDb.query(insertUser, function(err, rows, fields){
        if(err){
          res.send('Error');
        }else{
          var user = {'username': req.body.username};
          req.login(user, function(err){
            if(err){
              return res.send(err);
            }else{
              return res.redirect('/');
            }
          });
        }
    });
  }
}

exports.withdrawUser = function(mysqlDb){
  return function(req, res, next){
    var deleteUser = "DELETE FROM takeUser WHERE username =\'" + req.user.username + "\'";
    console.log("%s", deleteUser);
    mysqlDb.query(deleteUser, function(err, rows, fields){
      if(err){
        res.send('Error');
      }else{
        req.logout();
        res.redirect('/withdraw_success');
      }
    });
  }
}
