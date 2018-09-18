//Workflow Declaration and Methods
function complete_task(id) { 
  var info = change_workflow(id, 1);
  var status = "completed";
  forward(id, info, status);  
  stage_transition(id);
}

// ******************** add this eventually *********************

      //function approve_task_by_internal(id, temp) {
      //  var info = change_workflow(id, 1);
      //  var status = "approved_internal";
      //  forward(id, info,status);
      //}

// **************************************************************

function approve_task(id) {
  var info = change_workflow(id, 1);
  var status = "approved";
  forward(id, info,status);
  stage_transition(id);
}

function reject_task(id) {
  
  var info = change_workflow(id, -1);
  var status = "rejected";
  backward(id, info,status);
  stage_transition(id);
}


function uhghgh(){
  complete_task('1ANqeCuksoi0-KXOW2brAXMHq522ZJI5ocRtdOs6e80c')
}
function forward(id, info, status) {
  var global = globals();

  var z = global.workflow_stages.getLastRow();
  var last_stage = global.workflow_stages.getRange(z,1).getValue();


  if (!info || info == undefined) {
    throw 'No users were found or this is not a valid task.';
  } else if (info.completed.stage_id != last_stage) {    
    
    // check task as completed on flow 
    
    var completed_task = new FlowPut(391260, info.completed.workspace_id, null, info.completed.task_id.toString(), true, []);
    var options = createOptions("PUT", global.headers, completed_task);
    var url = www(global.flow, "tasks/"+info.completed.task_id.toString());
    urlFetch(url, options);
    
    
    // assign next task in flow
    
    var assigned_task = new FlowPut(391260, info.next.workspace_id, info.next.owner_id, info.next.task_id.toString(), false, []);
    options = createOptions("PUT", global.headers, assigned_task);
    url = www(global.flow, "tasks/"+info.next.task_id.toString());
    urlFetch(url, options);
    
    
    
    if (status == 'approved') {
    
   //   var payload = get_info_for_email(info.doc, info.writer);
   //   gmail('talent','notification','approved',payload);
      
    } else if (status == 'completed') {
    
  //    var payload = get_info_for_email(info.doc, info.completed);
  //    gmail('talent','notification','completed',payload);
      
    }
  
    var payload = get_info_for_email(info.doc, info.next);
    gmail('talent','notification','assigned',payload);
    
    var tasks = global.tasks.getDataRange().getValues();
    var task_headers = get_headers('tasks', 'name')
    var i;
    var length = tasks.length;
    for (i=0;i<length;i++) {
      var task = tasks[i];
      var t_id = task_headers.task_id;
      if (task[t_id] == info.completed.task_id) {
//        global.tasks.getRange(i+1,t_id+1).setValue();
          Logger.log(task);
      }
      if (task[t_id] == info.next.task_id) {
        
      }
    }
    
  } else {
    // end of content

  }

}


function backward(id, info,status) {
  var global = globals(); 
  
  //change this to info.writer to be sent to writer.
  var payload = get_info_for_email(info.doc, info.next);
  gmail('talent','notification', 'rejected', payload);
  
 // var payload = get_info_for_email(info.doc, info.next);
 // gmail('talent','notification','assigned',payload);
    
  var assigned_task = new FlowPut(391260, info.next.workspace_id, info.next.owner_id, info.next.task_id.toString(), false, ['needs reworked']);
  var options = createOptions("PUT", global.headers, assigned_task);
  var url = www(global.flow, "tasks/"+info.next.task_id.toString());
  urlFetch(url, options);
  
}

function change_workflow(id, x) {
  var global = globals();

  var tasks = global.tasks.getDataRange().getValues();
  var content = global.content.getDataRange().getValues();
  var workflow_stages = global.workflow_stages.getDataRange().getValues();
  
  var tasks_headers = get_headers('tasks', 'name');
  var content_headers = get_headers('content', 'name');
  var workflow_headers = get_headers('workflow_stages', 'name');

// query the content
  var doc = get_content_info(id);
  var new_stage = doc.content.stage_id + x;
  var completed_stage = doc.content.stage_id;
  
  var duration;
  
  var i;
  for (i=0;i<workflow_stages.length;i++) {
    var stage = workflow_stages[i];
    if (stage[workflow_headers.stage_id] == new_stage) {
      duration = stage[workflow_headers.duration];
      break;
    }
  }
// get info about completed stage and next stage
  var info = {};

  for (i=0;i<content.length;i++){
    var item = content[i];
    if (item[content_headers.doc_id] == id) {
      global.content.getRange(i+1, content_headers.stage_id+1).setValue(new_stage);
      break;
    }
  }
 

  for (i=0;i<tasks.length;i++) {
    var task = tasks[i];
    if (task[tasks_headers.content_id] == doc.content.content_id) {
      if (task[0].indexOf('Review') == -1 && task[0].indexOf('Setup') == -1 && (task[0].indexOf('Writ') != -1 || task[0].indexOf('Outlin') != -1)) {
        info.writer = {
          "name": task[0], 
          "due_date":task[2],
          "stage_id":task[4],
          "content_id":task[5],
          "user_id":task[9],
          'owner_id': task[8],
          "workspace_id": task[7], 
          "task_id": task[10].toString()
        }
      }
      if (task[tasks_headers.stage_id] == completed_stage) {
        if (x === 1){
          global.tasks.getRange(i+1, tasks_headers.completed+1).setValue(true);
          global.tasks.getRange(i+1, tasks_headers.completed_on+1).setValue(new Date().toDateString());
        }
        global.tasks.getRange(i+1, tasks_headers.is_active+1).setValue(false);
        
        info.completed = {
          'name': task[0], 
          "due_date":task[2],
          'stage_id': task[4],
          "content_id":task[5],
          'user_id': task[9],
          'owner_id': task[8],
          'workspace_id': task[7],
          'task_id': task[10].toString()
        }
      }
      if (task[tasks_headers.stage_id] == new_stage) {
        var row = i+1;
        global.tasks.getRange(row, tasks_headers.is_active+1).setValue(true);
        if (global.tasks.getRange(row, tasks_headers.completed+1).getValue() == true){
          global.tasks.getRange(row, tasks_headers.completed+1).setValue(false);
        }
        
        var old_date = new Date();
        var due = add_business_days(old_date, new Number(duration));
        global.tasks.getRange(row, tasks_headers.due_date+1).setValue(due.toDateString());
        
        if ( row >= tasks.length) { 
          Logger.log('tooooooo far');
        } else {
          info.next = {
            "name": task[0],  
            "due_date":task[2],
            "stage_id":task[4],
            "content_id":task[5],
            'owner_id': task[8],
            "user_id":task[9],
            "workspace_id": task[7], 
            "task_id": task[10].toString()
          }
        }
      }
    }
  }
  info.doc = doc;
  return info;

}

function migrate_check_off(id, name, value){
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  
  var content_headers = global.content.getDataRange()
                    .offset(0, 0, 1)
                    .getValues()[0];
      
  var col = (content_headers.indexOf(name) != -1) ? content_headers.indexOf(name) : null;
  
  if (col) {
    for (var x=0;x<content.length;x++){
      if (content[x][7] == id) {
        global.content.getRange(x+1, col+1).setValue(value);
      }
    }
  }
  return col
}

function get_migrate_checklist(id, field_names_array){
  
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  
  var content_headers = get_headers('content', 'name');
  
  var checks = {};
  
  for (var x=0;x<content.length;x++){
    if (content[x][7] == id) {
      for (var y=0;y<field_names_array.length;y++){
        checks[field_names_array[y]] = content[x][content_headers[field_names_array[y]]];
      }
    }
  }
  
  return checks;
      
}

function auto_complete_client_tasks() {
  
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var tasks = global.tasks.getDataRange().getValues();
  var users = global.users.getDataRange().getValues();

  var content_headers = get_headers('content', 'name');
  var tasks_headers = get_headers('tasks', 'name');  
  var user_headers = get_headers('users', 'name');
  
  
  var today = new Date();
  today.setHours(0,0,0,0)
  
  var overdue = {};
  
  var i;
  for (i=0;i<tasks.length;i++){
  
    var task = tasks[i];
    
    var is_active = task[tasks_headers.is_active];
    var due_date = new Date(task[tasks_headers.due_date]);
    due_date.setHours(0,0,0,0)
    
    if (is_active && (due_date - today) < 0) {
      var user_id = task[tasks_headers.user_id];
      var x;
      for (x=0;x<content.length;x++) {
        var item = content[x];
        if (item[content_headers.content_id] == task[tasks_headers.content_id]) {
          var doc_id = item[content_headers.doc_id];
        }
      }
      for (x=0;x<users.length;x++) {
        var user = users[x];
        var is_client = user[user_headers.is_client];
        if (user[user_headers.user_id] == user_id && is_client) {
          var comments = Drive.Comments.list(doc_id).items;
          if (comments.length > 0) {
            var aaa = -1;
            var y;
            for (y=0;y<comments.length;y++) {
              var comment = comments[y];
              if (comment.status != 'resolved') {
                aaa = 0;
                reject_task(doc_id);
                global.tasks.getRange(i+1, tasks_headers.auto_completed+1).setValue(true);
                return;
              }
            }
          }
          if (aaa == -1) {
            approve_task(doc_id);
            global.tasks.getRange(i+1, tasks_headers.auto_completed+1).setValue(true);
            return;
          }
        }
      }
    }
  }
}

function generate_email_from_template(id) {
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  
  var content_headers = global.content.getDataRange()
                    .offset(0, 0, 1)
                    .getValues()[0];
                    
  var doc = get_content_info(id);
  var prev_content = get_prev_content_ids(doc.content.doc_id, doc.campaign.campaign_id);
  
  if (prev_content.length != 0) {
    var current = {};
    if (prev_content.length > 1) {
      var past = get_content_by_id(prev_content[1]);
      var html = HtmlService.createTemplateFromFile('three_posts_min');
    } else {
      var html = HtmlService.createTemplateFromFile('two_posts_min');
    }
    var prev = get_content_by_id(prev_content[0]);
  } else {
    var html = HtmlService.createTemplateFromFile('one_post_min');
  }
  
  var current = doc.content;
  var company = doc.company;
  var campaign = doc.campaign;
  
    html.welcome_img_url = company.welcome_img_url;
    html.content_welcome_intro_headline = company.content_welcome_intro_headline;
    html.welcome_info_headline = company.welcome_info_headline;
    html.welcome_info_01_img_url = company.welcome_info_01_img_url;
    html.welcome_info_02_img_url = company.welcome_info_02_img_url;
    html.welcome_info_check_img_url = company.welcome_info_check_img_url;
    html.font_body_familyname = company.font_body_familyname;
    html.font_body_url = company.font_body_url;
    html.font_headline_familyname = company.font_headline_familyname;
    html.font_headline_url = company.font_headline_url;
    html.color_highlight_hex = company.color_highlight_hex;
    html.color_base_hex = company.color_base_hex;
    html.color_headline_hex = company.color_headline_hex;
    html.color_headline_hover_hex = company.color_headline_hover_hex;
    html.color_card_shadow_hex = company.color_card_shadow_hex;
    html.cta_headline = company.cta_headline;
    html.content_button_default_img_url = company.content_button_default_img_url;
    html.content_button_hover_img_url = company.content_button_hover_img_url;
    html.cta_button_default_img_url = company.cta_button_default_img_url;
    html.cta_button_hover_img_url = company.cta_button_hover_img_url;
    html.cta_button_landing_page_url = company.cta_button_landing_page_url;
    
    html.current = current;
    html.prev = !prev ? null : prev;
    html.past = !past ? null : past;
    
    html.email_header_img_url = 'https://www.ethosce.com/wp-content/uploads/2018/03/email_header_medicalassociations.png';
    html.email_header_alttext = null;

  var email = html.evaluate().getContent();
  
  var colA = content_headers.indexOf('doc_id');
  var colB = content_headers.indexOf('email_template_evaluated');
  
  for (var i=0;i<content.length;i++){
    var item = content[i];
    if (item[colA] == current.doc_id) {
      global.content.getRange(i+1,colB+1).setValue(email);
    }
  }
}


function error() {
  stage_transition('1aQM7aqPQuMWYKTmEytOloG60SccKJqOwEsANGj-D_3U')
}


function stage_transition(id) {
  var global = globals();
  
  var workflow = global.workflow_stages.getDataRange().getValues();
  var workflow_headers = get_headers('workflow_stages', 'name');
                    
  var content = get_content_by_id(id);
  var content_headers = get_headers('content', 'name');
                    
  var stage_id = content.stage_id;
  
  var col = workflow_headers.stage_id;
  var colB = workflow_headers.stage;
  
  var i;
  for (i=0;i<workflow.length;i++){
    if (workflow[i][col] == stage_id) {
      var stage = workflow[i][colB];
    }
  }
  
  if (stage == "setup") {
    
    
  } else if (stage == 'outline'){
    
    
  } else if (stage == 'edit'){
    
    // run script that adds an extra revision to the process
    
  } else if (stage == 'review'){
     
    // run script that adds an additional review to content and tracks the comments made for each review stage / maxes out at 2 reviews then auto pushes forward or restricts rejection
    
  } else if (stage == 'write'){
    
    // run function to check off the completion of the outline and then also store it in db for easy retrieval
    
    var html = generate_html_markup(id);
    col = content_headers.outline_html_markup + 1;
    global.content.getRange(content.row, col).setValue(html);
    col = content_headers.outline_approved + 1;
    global.content.getRange(content.row, col).setValue(true);
    
    var parents = DriveApp.getFileById(id).getParents();
    
    while (parents.hasNext()) {
      var parent = parents.next();
      var supers = parent.getParents();
      while (supers.hasNext()) {
        var super = supers.next();
        var children = super.getFolders();
        while (children.hasNext()) {
          var child = children.next();
          if (child.getName() == 'Outlines') {
            var outlinesFolder = child;
          } else if (child.getName() == 'Writings') {
            var writingsFolder = child;
          }
        }
      }
    }
    
    var blog = DriveApp.getFileById('18K3KnacKi-oVg4KQCphn74kks3PxWLWynW7dIfHIobg').makeCopy(content.content_name, writingsFolder).getId();
    
    global.content.getRange(content.row, content_headers.doc_id+1).setValue(blog);
    
  } else if (stage == 'migrate'){
    
    // generate doc2html. present it to the producer as the closest to correct formatting for migration.
    var html = generate_html_markup(id);
    col = content_headers.content_html_markup+1;
    global.content.getRange(content.row, col).setValue(html);
    col = content_headers.content_approved + 1;
    global.content.getRange(content.row, col).setValue(true);
    
  } else if (stage == 'publish'){
    
    // send out campaign completion
    
    
  } else if (stage == 'promote_via_email'){
  
    // send out campaign completion email


    // generate email tempalte
    var email = generate_email_from_template(id);
    
  } else if (stage == 'promote social'){
      
    // run social media function. get iesha/social_promoter the relevant information necessary to complete this stage
    
  }
  
}

