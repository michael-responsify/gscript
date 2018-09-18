//Flow Operations and Fetches
function FlowPut(org_id, wksp_id, owner_id, task_id, completed, tags) {
  this.organization_id = org_id ? org_id : null;
  this.task = {};
  this.task.workspace_id = wksp_id ? wksp_id : null;
  this.task.owner_id = owner_id ? owner_id : null;
  this.task.id = task_id ? task_id : null;
  this.task.completed = completed ? completed : false;
  this.task.tags = [];
  this.task.tags = tags? tags : null;
}

function createOptions(method, headers,data){ //method switch
  
  if ( method == "POST" ||  method == "PUT" ) {
    var options = {
      'method' : method,
      'contentType': 'application/json',
      'muteHttpExceptions': true,
      'headers': headers,
      'payload':JSON.stringify(data)
    }
    return options;
  } else if (method == "GET" || method == "DELETE") {
    var options = {
      'method' : method,
      'contentType': 'application/json',
      'muteHttpExceptions': true,
      'headers': headers,
    }
    return options;
  }
}

function www(www, path){
  return www+path;
}

function urlFetch(url, options) {
  if (!options) {
    var res = JSON.parse(UrlFetchApp.fetch(url)) || '{"x":null}';
  } else {
    var res = JSON.parse(UrlFetchApp.fetch(url,options) || '{"x":null}');
  }
  return res;
}
