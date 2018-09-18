//Global Declarations
function globals() {
  var global = {};
  
  global.headers = JSON.parse('{"Authorization":"Bearer 2a7042d415f7308291a4a7553282c68cb4c1a357c8c5732ab1a955fec004701e", "Accept":"application/vnd.flow.v2+json"}')
  global.flow = "https://api.getflow.com/v2/";
  global.workspaces = 'workspaces?organization_id=391260&include=accounts';
  global.memberships = 'memberships?organization_id=391260&include=accounts';
  global.flowTasks = 'tasks?organization_id=391260';
  global.wh = 'integration_webhooks?organization_id=391260';
  global.lists = 'lists?organization_id=391260&include=sections&workspace_id=393318';
  global.ss = SpreadsheetApp.openById('1Pr23wfKpwTXeytorbal5tM2VxnK4itc1DfcGWLMwtm0');
  global.alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  global.ws_id = 'workspace_id=393318';
  global.webhook = "https://script.google.com/macros/s/AKfycbxEn59RDHZmCUoa4lGu-io7h-q1m2gFWAbvjF5Z7cQxTfsS0Ro/exec";
  global.gdoc = "https://docs.google.com/document/d/";
  global.campaigns = global.ss.getSheetByName('Campaigns');
  global.content = global.ss.getSheetByName('Content');
  global.users = global.ss.getSheetByName('Users');
  global.companies = global.ss.getSheetByName('Companies');
  global.assignees = global.ss.getSheetByName('Assignees');
  global.roles = global.ss.getSheetByName('Roles');
  global.workflow_stages = global.ss.getSheetByName('Workflow Stages');
  global.tasks = global.ss.getSheetByName('newTasks');
  global.chatbox = global.ss.getSheetByName('Messages');
  global.launch = global.ss.getSheetByName('LaunchForm');
  
  return global;
}

function Sheets() {

  var ss = SpreadsheetApp.openById('1Pr23wfKpwTXeytorbal5tM2VxnK4itc1DfcGWLMwtm0');
  
  this.campaigns = ss.getSheetByName('Campaigns').getDataRange().getValues();
  this.content = ss.getSheetByName('Content').getDataRange().getValues();
  this.users = ss.getSheetByName('Users').getDataRange().getValues();
  this.companies = ss.getSheetByName('Companies').getDataRange().getValues();
  this.assignees = ss.getSheetByName('Assignees').getDataRange().getValues();
  this.roles = ss.getSheetByName('Roles').getDataRange().getValues();
  this.workflow_stages = ss.getSheetByName('Workflow Stages').getDataRange().getValues();
  this.tasks = ss.getSheetByName('newTasks').getDataRange().getValues();
  this.chatbox = ss.getSheetByName('Messages').getDataRange().getValues();
  
}

var headers = {
  "task_headers" : function(){ return get_headers('tasks', 'name'); },
  "content_headers" : function(){ return get_headers('content','name') },
  "campaign_headers" : function(){ return get_headers('campaigns','name') },
  "company_headers" : function(){ return get_headers('companies','name') },
  "workflow_headers" : function(){ return get_headers('workflow_stages','name') },
  "user_headers" : function(){ return get_headers('users', 'name'); },
  "role_headers" : function(){ return get_headers('roles','name') },
  "assignee_headers" : function(){ return get_headers('assignees','name') },
  "message_headers" : function(){ return get_headers('chatbox','name') },
  "launch_headers" : function(){ return get_headers('launch', 'name') },
  
  "task_indices" : function(){ return get_headers('tasks', 'index'); },
  "content_indices" : function(){ return get_headers('content','index') },
  "campaign_indices" : function(){ return get_headers('campaigns','index') },
  "company_indices" : function(){ return get_headers('companies','index') },
  "workflow_indices" : function(){ return get_headers('workflow_stages','index') },
  "user_indices" : function(){ return get_headers('users', 'index'); },
  "role_indices" : function(){ return get_headers('roles','index') },
  "assignee_indices" : function(){ return get_headers('assignees','index') },
  "message_indices" : function(){ return get_headers('chatbox','index') }
}

function get_headers(sheet, type) {
    var global = globals();
    
    var headers = {};
    
    var data = global[sheet].getDataRange().getValues()[0];
    
    if (type == 'name') {
      for (var i=0;i<data.length;i++) {
        headers[data[i]] = i;
      }
    } else if (type == 'index') {
      for (var i=0;i<data.length;i++) {
        headers[i] = data[i];
      }
    }
    
    return headers;
}
