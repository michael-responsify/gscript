function doGet(e) {
  
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var tasks = global.tasks.getDataRange().getValues();
  var companies = global.companies.getDataRange().getValues();
   
  var task_headers = headers.task_headers();
  var content_headers = headers.content_headers();
  var company_headers = headers.company_headers();
   
  var campaign_name;
  var campaign_id; 
  var stage_name;
  var stage_id;
  var stage;
  var due_date;
  var type_id;
  var primary_keyword;
  var secondary_keyword;
  var campaign_goal;
  var campaign_description;
  var persona_link;
  var style_link;
  var brand_link;
//  var ndash;
  var setup; 
  var beyond_outline;
  var content_type; 
  var client_id;
  var client_name; 
  var c_id; 


  var params = e.parameters;
  
  var id = ( !params.id ? null : params.id );
  var client = ( !params.client ? null : params.client[0] );
  if (params.sloth == 'mega'){
    return HtmlService.createHtmlOutputFromFile('sloth')
  }
  var user_email = Session.getActiveUser().getEmail();
  
  if (user_email.indexOf('responsify.com') == -1) {
    return ContentService.createTextOutput('No Access.');
  }
    
  var user = get_user_by_email(user_email);
  
  if (!user || user == undefined) {
    return ContentService.createTextOutput('No Access.');
  }
  
  var is_client = user.is_client;
  var is_admin = user.is_admin;
  var first_name = user.user_name.split(" ")[0];
  
  var doc_exists = false;
  
  for (var y=0;y<content.length;y++){ //INDEX
    var ct = content[y];
    if (ct[content_headers.doc_id] == id){
      doc_exists = true;
      
      var title = DocumentApp.openById(id).getName();
      break;
    }
  }
   
  if (params.manage == 'create' && is_admin) {
// ********* display create dashbaord ************
    
    return HtmlService.createHtmlOutputFromFile('create').setTitle('CREATE Campaign');
  }
  if (params.manage == 'launch' && is_admin) {
// ********* display launch dashbaord ************
      
      var campaigns = global.campaigns.getDataRange().getValues();
      var campaign_headers = headers.campaign_headers();
      
      var info = [];
      var i;
      for (i=2;i<campaigns.length;i++){ //INDEX
        var campaign = campaigns[i];
        if (!campaign[campaign_headers.is_active]) {
          var item = {};
          item.name = campaign[campaign_headers.campaign_name];
          item.id = campaign[campaign_headers.campaign_id];
          info.push(item);
        }
      }
      var html = HtmlService.createTemplateFromFile('launch');
      html.campaigns = info;
      return html.evaluate().setTitle('LAUNCH Campaign');
  }
  if (!id || id == "" || !doc_exists) {
  
    if (is_client) {
    
// ********* display client dashboard *********
    
      var check = new RegExp ("^"+user_email.slice(0,user_email.indexOf('@'))+"$", 'i');
      var i;
      var length = companies.length;
      for (i=0;i<length;i++){
        var company = companies[i];
        if (check.test(company[company_headers.company_name])) {
          client_id = company[company_headers.company_id];
          client_name = company[company_headers.company_name];
          break;
        }
      }
      
      var active_workflows = [];
      var tsks = [];
      
      length = tasks.length;
      for (i=0;i<length;i++){
        var task = tasks[i];
        if (task[task_headers.user_id] == user.user_id && task[task_headers.is_active]){
          if (tsks.indexOf(task[task_headers.stage_id]) != -1) {
            continue;
          }
          active_workflows.push({'task_name':task[task_headers.task_name], "task_name_mod":task[task_headers.task_name].toLowerCase().replace(/\s/g,'_')});
          tsks.push(task[task_headers.stage_id]);
        }
      }
      
      var html = HtmlService.createTemplateFromFile('client');
      
      html.user = JSON.stringify(user);
      html.client_name = client_name;
      html.client_id = client_id;
      html.first_name = first_name;
      html.active_workflows = active_workflows;
      
      return html.evaluate().setTitle('Content Overview');
      
    } else if (is_admin) {
     
// ********* display admin dashboard ********* 
     
      var clients = [];
      var cont = {};
      var comps = {};
      
      length = tasks.length;
      for (i=0;i<length;i++){
        var task = tasks[i];
        if (task[task_headers.user_id] == user.user_id && task[task_headers.is_active]){
          if (cont[task[task_headers.content_id]] != null) {
            continue; 
          }
          cont[task[task_headers.content_id]] = task[task_headers.content_id];
        }
     }
     length = content.length;
     for (i=0;i<length;i++) {
       var item = content[i];
       if (cont[item[content_headers.content_id]] != null) {
         if (comps[item[content_headers.company_id]] != null) {
           continue;
         }
         comps[item[content_headers.company_id]] = item[content_headers.company_id];
       }
     }
     
     length = companies.length;
     for (i=1;i<length;i++) {
       var cmp = companies[i];
       if (comps[cmp[company_headers.company_id]] != null) {
         clients.push({'client_name': cmp[company_headers.company_name], 'client_name_mod': cmp[company_headers.company_name].toLowerCase().replace(/\s/g,'_')});
       }
     }
     
     

      
     var html = HtmlService.createTemplateFromFile('responsify');
      
      html.user = JSON.stringify(user);
      html.first_name = first_name;  
      html.is_admin = true;
      html.clients = clients;
      html.comps = comps;
      html.cont = cont;
      return html.evaluate().setTitle('Admin Dashboard');
      
    } else {
    
// ********* display talent dashboard *********
          var clients = [];
      var cont = {};
      var comps = {};
      
      length = tasks.length;
      for (i=0;i<length;i++){
        var task = tasks[i];
        if (task[task_headers.user_id] == user.user_id && task[task_headers.is_active]){
          if (cont[task[task_headers.content_id]] != null) {
            continue; 
          }
          cont[task[task_headers.content_id]] = task[task_headers.content_id];
        }
     }
     length = content.length;
     for (i=0;i<length;i++) {
       var item = content[i];
       if (cont[item[content_headers.content_id]] != null) {
         if (comps[item[content_headers.company_id]] != null) {
           continue;
         }
         comps[item[content_headers.company_id]] = item[content_headers.company_id];
       }
     }
     
     length = companies.length;
     for (i=1;i<length;i++) {
       var cmp = companies[i];
       if (comps[cmp[company_headers.company_id]] != null) {
         clients.push({'client_name': cmp[company_headers.company_name], 'client_name_mod': cmp[company_headers.company_name].toLowerCase().replace(/\s/g,'_')});
       }
     }
      var html = HtmlService.createTemplateFromFile('responsify');
      
      html.user = JSON.stringify(user);
      html.first_name = first_name;  
      html.is_admin = false;
      
      html.clients = clients;
      html.comps = comps;
      html.cont = cont;
      
      return html.evaluate().setTitle('Responsify Dashboard');
    }
    
  } else {
  
  // ********** display content dashboard **************
  
  
  // if (not currently assigned user) { no access }
  // *
  // ^^^^^^^^^ NEEDS IMPLEMENTED^^^^^^^^^^^  
    
    var workflow_stages = global.workflow_stages.getDataRange().getValues();
    var workflow_headers = headers.workflow_headers();
    
    var i;
    length = content.length;  
    for (i=0;i<length;i++){
      var item = content[i];
      if (item[content_headers.doc_id] == id){
        stage_id = item[content_headers.stage_id];
        break;
      }
    }

    length = workflow_stages.length;
    for (i=0;i<length;i++){
      var workflow = workflow_stages[i];
      if (workflow[workflow_headers.stage_id] == stage_id){
        stage = workflow[workflow_headers.stage];
        break;
      }
    }
    
    var html = HtmlService.createTemplateFromFile('content-dash');
      html.id = id;
      html.stage = stage;
    return html.evaluate().setTitle('Content Dashboard').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}


function doPost(e) {
  if (e.parameter == 'launch_email') {
    var something = e.paramaters;
    
    return HtmlService.createHtmlOutput('hey its a me a mario');
  }
  return ContentService.createTextOutput(JSON.stringify(e.parameters));
}
