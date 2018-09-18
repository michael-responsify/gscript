//User Declaration and Methods
function new_user(row){

  var user = {}
  
  var user_headers = headers.user_indices();
 
  var x;
  var length = row.length;
  for (x=0;x<length;x++){
    user[user_headers[x]] = row[x];
  }
  
  return user;
}

function get_user_by_id(id, info) {
  var global = globals();
  
  var users = global.users.getDataRange().getValues();
  var user_headers = headers.user_headers();
  var col = user_headers.user_id;                  
   
  var i;
  var length = users.length;
  for (i=0;i<length;i++) {
    var row = users[i];
    if (row[col] == id) {
      var user = new_user(row);
      
      if (!info) {
        return user;
      }
      info['user'] = {};
      info.user = user;
      return info;
    }
  }
}

function get_user_by_email(email) {
  
  var global = globals();
  
  var usersRange = global.users.getDataRange().getValues();
  var user_headers = headers.user_headers();               
  var col = user_headers.user_email;
  
  var i;
  var length = usersRange.length;
  for (i=0;i<length;i++) {
    var row = usersRange[i];
    if (row[col] == email) {
      var user = new_user(row);
      break;
    }
  }
  
  return user;
}

