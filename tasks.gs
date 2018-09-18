//Task Methods and Declarations
function new_task(row){
  var global = globals();
  
  var task = {};
  
  var tasks_headers = headers.task_indices();
  var i;
  var length = row.length;
  for (i=0;i<length;i++){
    task[tasks_headers[i]] = row[i];
  }
  
  task.content_name = null;
  task.content_id = null;
  task.content_type = null;
  task.campaign_name = null;
  task.campaign_id = null;
  task.doc_link = null;
  
  return task;
}

function get_task_by_id(id) {
  var global = globals();
  
  var tasks = global.tasks.getDataRange().getValues();
  var tasks_headers = headers.task_headers();
  
  var col = tasks_headers.task_id;
  
  var i;
  var length = tasks.length;
  for (i=0;i<length;i++) {
    var row = tasks[i];
    if (row[col] == id) {
      var task = new_task(row);
      
      if (!info) {
        return task;
      }
      info['task'] = {};
      info.task = task;
      return info;
    }
  }
}

function get_tasks_by_user(id) {
  var global = globals();
  
  var tasks = global.tasks.getDataRange().getValues();
  var tasks_headers = headers.task_headers();
  
  var user_tasks = {};
  
  var active = [];
  var active_ids = [];
  var completed = [];
  var completed_ids = [];
  var unassigned = [];
  var unassigned_ids = [];
  
  var today = new Date();
  today.setHours(0,0,0,0);
  
  var i;
  var length = tasks.length;
  for (i=0;i<length;i++) {
    var task = tasks[i];

    if (task[tasks_headers.user_id] == id ) {
      if (task[tasks_headers.is_active] == true) {
        var due = new Date(task[tasks_headers.due_date]);
        due.setHours(0,0,0,0);
        
        var diff = convertMS(due - today).day;
        var status;
        
        if (today === due && diff < 0) {
          status = 'overdue';
        } else if (diff === 0) {
          status = 'due_today';
        } else if (diff === 1) {
          status = 'due_tomorrow';
        } else if (diff >= 2) {
          status = 'upcoming';
        }
        
        task.push(status);
        active.push(task);

        active_ids.push(task[tasks_headers.task_id].toString());
        
      } else if (task[tasks_headers.completed] == true) {
        var obj = {};
       // obj[task[tasks_headers.task_id]] = task;
       // completed.push(obj);
        completed_ids.push(task[tasks_headers.task_id].toString());
      } else {
        var obj = {};
       // obj[task[tasks_headers.task_id]] = task;
       // unassigned.push(obj);
        unassigned_ids.push(task[tasks_headers.task_id].toString() );
      }
    }
  }

  user_tasks.active = active;
  user_tasks.active_ids = active_ids;
  user_tasks.completed = completed;
  user_tasks.completed_ids = completed_ids;
  user_tasks.unassigned = unassigned;
  user_tasks.unassigned_ids = unassigned_ids;
  
  var help = get_now(active);
  return JSON.stringify(help);
  
}

function get_now(active){
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var campaigns = global.campaigns.getDataRange().getValues();
  var companies = global.companies.getDataRange().getValues();
  
  var task_head = headers.task_headers();
  var cont_head = headers.content_headers();
  var camp_head = headers.campaign_headers();
  var comp_head = headers.company_headers();
  
  var tasks = [];
  
  var i;
  for (i=0;i<active.length;i++){
    var task = active[i];
    
    var status = task[task.length-1];
    
    var c_id = task[task_head.content_id];
    var x;

    for (x=0;x<content.length;x++){
      var item = content[x];
      if (item[cont_head.content_id] == c_id) {
        var content_name = item[cont_head.content_name];
        var content_type = item[cont_head.type];
        var campaign_id = item[cont_head.campaign_id];
        var doc_link = item[cont_head.doc_id];
        var company_id = item[cont_head.company_id];
      }
    }
    for (x=0;x<campaigns.length;x++){
      var campaign = campaigns[x];
      if (campaign[camp_head.campaign_id] == campaign_id) {
        var campaign_name = campaign[camp_head.campaign_name];
      }
    }
    for (x=0;x<companies.length;x++) {
      var company = companies[x];
      if (company[comp_head.company_id] == company_id) {
        var company_name = company[comp_head.company_name];
      }
    }  
    var due_date = task[task_head.due_date];
    var task_name = task[task_head.task_name];
    
    var line = {
      "task_name": task_name,
      "content_type": content_type,
      "content_name": content_name,
      "campaign_name": campaign_name,
      "doc_link": doc_link,
      "due_date": parse_date(due_date, 'mmddyy'),
      "status": status,
      "company_name": company_name
    }
    
    tasks.push(line);
  }

  return tasks; 
}

function get_tasks_by_content(id) {
  var global = globals();
  
  var tasks = global.tasks.getDataRange().getValues();
  var content = global.content.getDataRange().getValues();
  var content_headers = headers.content_headers();
  var task_headers = headers.task_headers();
  var content_tasks = {};
  var all = [];
  var current;
  
  var i;
  var length = content.length;
  for (i=0;i<length;i++){
    var item = content[i];
    if (item[content_headers.content_id] == id ) {
      var current_stage = item[content_headers.stage_id];
      break;
    }
  }
  length = tasks.length;
  for (i=0;i<length;i++) {
    var task = tasks[i];
    if (task[task_headers.content_id] == id) {
      all.push(new_task(task));
      if (task[task_headers.stage_id] == current_stage){
        current = new_task(task);
      } 
    }
  }
  
  content_tasks.all = all;
  content_tasks.current = current;
  
  return content_tasks();
}


function get_overdue_tasks() {
  var global = globals();
  
  var tasks = global.tasks.getDataRange().getValues();
  
  var overdue_tasks = [];
  
  var now = new Date();
  
  var i;
  var length = tasks.length;
  for (i=2;i<length;i++) {
    var task = tasks[i];
    var check = new Date(task[task_headers.due_date].setDate(task[task_headers.due_date].getDate()+1));
    if ( check > now ) {
      overdue_tasks.push(new_task(task));
    }
  }
  
  return overdue_tasks;
}

function is_task_overdue(task) {
  if (typeof task != 'object') {
    throw "The parameter passed to 'is_task_overdue' is not an object.";
  } else {
    if (!task.due_date) {
      throw "There is no due date for the parameter passed to 'is_task_overdue'";
    }
    if (typeof task.due_date != 'object'){
      throw "The value stored in 'due_date' field for this task is not a valid Date object.";
    }
    var now = new Date();
    
    var check = new Date(task.due_date.setDate(task.due_date.getDate() + 1));
    
    if (check < now) {
      return true;
    } else {
      return false;
    }
  }
}


function get_overdue_client_tasks() {
  var global = globals();
  
  var tasks = global.tasks.getDataRange().getValues();
  var content = global.content.getDataRange().getValues();
  var campaigns = global.campaigns.getDataRange().getValues();
  var companies = global.companies.getDataRange().getValues();
  
  var content_headers = headers.content_headers();
  var task_headers = headers.task_headers();
  var campaign_headers = headers.campaign_headers();
  var company_headers = headers.company_headers();

  var array = [];
  
  var i;
  var length = tasks.length;
  for (i=0;i<length;i++) {
    var task = tasks[i];
    if (task[task_headers.is_active] == true) {
      var now = new Date();
      now.setHours(0,0,0,0);
      var due = new Date(task[task_headers.due_date]);
      
      if (now > due) {
      
        var tsk = new_task(task);
        var length = content.length;
        for (var x=0;x<length;x++) {
          if (task[task_headers.content_id] == content[x][content_headers.content_id]) {
            tsk.content_name = content[x][content_headers.content_name];
            tsk.content_type = content[x][content_headers.type];
            tsk.campaign_id = content[x][content_headers.campaign_id];
            tsk.doc_link = content[x][content_headers.doc_id];
            break;
          }
        }
        length = campaigns.length;
        for (x=0;x<length;x++){
          if (tsk.campaign_id == campaigns[x][campaign_headers.campaign_id]){
            tsk.campaign_name = campaigns[x][campaign_headers.campaign_name];
            var comp_id = campaigns[x][campaign_headers.company_id];
            break;
          }
        }
        length = companies.length;
        for (x=0;x<length;x++) {
          if (companies[x][company_headers.company_id] == comp_id) {
            tsk.company = companies[x][company_headers.company_name];
            break;
          }
        }
        tsk.due_date = parse_date(tsk.due_date, 'mmddyy');
        array.push(tsk);
      }
    }
  }
  return JSON.stringify(array);
}


function add_task_id_to_content() { 

  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var tasks = global.tasks.getDataRange().getValues();
  var content_headers = headers.content_headers();
  var tasks_headers = headers.task_headers();
  
  var colA = tasks_headers.is_active;
  var colB = tasks_headers.task_id;
  var colC = tasks_headers.content_id;
  
  var i;
  var length = tasks.length;
  for (i=0;i<length;i++){
    var task = tasks[i];
    if (task[colA]){
      var task_id = task[colB];
      var content_id = task[colC];
      var colX = content_headers.content_id;
      for (var x=0;x<content.length;x++){
        var item = content[x];
        if (item[colX] == content_id) {
          global.content.getRange(x+1, content_headers.task_id+1).setValue(task_id);
        }
      }
    }
  }
}