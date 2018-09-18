//function Content(name,primary_keyword,secondary_keyword,current_stage,type,campaign_id,content_id,doc_id,ndash,guidelines,outline,outline_approved,content_approved,content_published,content_featured_img,content_teaser,content_permalink) {
//  this.name = name;
//  this.primary_keyword = primary_keyword;
//  this.secondary_keyword = secondary_keyword;
//  this.stage_id = current_stage;
//  this.current_stage = current_stage;
//  this.type = type;
//  this.campaign_id = campaign_id;
//  this.content_id = content_id;
//  this.doc_id = doc_id;
//  this.ndash = ndash;
//  this.guidelines = guidelines;
//  this.outline = outline;
//  this.outline_approved = outline_approved;
//  this.content_approved = content_approved;
//  this.content_published = content_published;
//  this.campaign_name = null;
//  this.company_id = null;
//  this.company_name = null;
//  this.due_date = null;
//  this.content_featured_img = content_featured_img;
//  this.content_teaser = content_teaser;
//  this.content_permalink = content_permalink;
//}

function new_content(row){
  var global = globals();
  
  var content = {};
  
  var content_headers = headers.content_indices();
  
  var i;
  var length = row.length;
  for (i=0;i<length;i++){
    content[content_headers[i]] = row[i];
  }
  content.row = null;
  
  return content;
}

function get_content_by_id(id, info) {
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var content_headers = headers.content_headers();

  var col = content_headers.doc_id;

  var i;
  var length = content.length;
  for (i=0;i<length;i++) {
    var row = content[i];
    if (row[col] == id) {
      var item = new_content(row)
      item.row = i+1;
      if (!info) {
        return item;
      }
      info['content'] = {};
      info.content = item;
      return info;
    }
  }
}

function get_content_info(id){
  var global = globals();
  
  var tasks = global.tasks.getDataRange().getValues();
  var tasks_headers = headers.task_headers();
  var workflow = global.workflow_stages.getDataRange().getValues();
  var workflow_headers = headers.workflow_headers();
  
  var doc = {};
  
  doc = get_content_by_id(id, doc);
  Logger.log(doc)
  doc = get_campaign_by_id(doc.content.campaign_id, doc);
  Logger.log(doc)
  doc = get_company_by_id(doc.campaign.company_id, doc);
  
  var i;
  var length = tasks.length;
  for (i=0;i<length;i++) {
    var tsk = tasks[i];
    if (doc.content.content_id == tsk[tasks_headers.content_id] && doc.content.stage_id == tsk[tasks_headers.stage_id]){
      doc['due_date'] = null;
      doc.due_date = tsk[tasks_headers.due_date].toDateString();
      break;
    }
  }
  length = workflow.length;
  for (i=0;i<length;i++) {
      var wk = workflow[i];
      if (wk[0] == doc.content.stage_id) {
        doc['current_stage'] = null;
        doc.current_stage = wk[workflow_headers.stage_name];
        break;
      }
  }

  return doc;
}

function get_publish_dates_by_campaign(id) {
  var global = globals();
  
  var campaigns = global.campaigns.getDataRange().getValues();
  var content = global.content.getDataRange().getValues();
  var tasks = global.tasks.getDataRange().getValues();
  
  var camp_head = headers.campaign_headers();
  var cont_head = headers.content_headers();
  var task_head = headers.task_headers();
  var wf_head = headers.workflow_headers();
  
  var publish_sched = {};
  var content_ids = [];
  
  var i;
  var length = content.length;
  for (i=0;i<length;i++){
    var item = content[i];
    if (item[cont_head.campaign_id] == id) {
      content_ids.push(item[cont_head.content_id]);
      var cmp_name = get_campaign_by_id(item[cont_head.campaign_id]).campaign_name;
      publish_sched[item[cont_head.content_id]]  = {'task_name':'Publish','content_name':item[cont_head.content_name],'campaign_name':cmp_name,'doc_link':item[cont_head.doc_id],'content_type':item[cont_head.type],'is_published':item[cont_head.is_published]};
    }
  }
  
  var z = global.workflow_stages.getLastRow();
  var last_stage = global.workflow_stages.getRange(z, wf_head.stage_id+1).getValue();
  var test = [];
  length = tasks.length;
  for (i=0;i<length;i++){
    var task = tasks[i];
    if ((content_ids.indexOf((task[task_head.content_id])) != -1) && (task[task_head.stage_id] == last_stage)){
      publish_sched[task[task_head.content_id]].publish_date = parse_date(task[task_head.due_date], 'mmddyy');
    }
  }
  
  return publish_sched;
}

function get_publish_dates_by_company(id) { //Consider changing
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  
  var i;
  var length = content.length;
  for (i=0;i<length;i++){
    
  }
}

function query_content_type(id) {
  var global = globals();
  
  var content_headers = headers.content_headers();
  var content_types = global.content_types.getDataRange().getValues();
  
  var i;
  for (i=0;i<content_types.length;i++) {
    var row = content_types[i];
    if (row[content_headers.type_id] == id) {
      return row[content_headers.type_name];
    }
  }
}

function get_client_publish_sched(id) {
  var complete_publish_sched = {};
  
  var company_campaigns = get_campaigns_by_company(id);
  
  for (i=0;i<company_campaigns.ids.length;i++) {
    var cc = company_campaigns.ids[i];
    var publish_sched = get_publish_dates_by_campaign(cc);
    complete_publish_sched[cc] = publish_sched;
  }
  
  return JSON.stringify(complete_publish_sched);
}

function get_prev_content_ids(id, campaign_id) {
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var content_headers = global.content.getDataRange()
                    .offset(0, 0, 1)
                    .getValues()[0];
  
  var col = content_headers.indexOf('doc_id');
  var cp_col = content_headers.indexOf('campaign_id');
  
  var content_array = [];
  
  var i;
  for (i=0;i<content.length;i++){
    var item = content[i];
    if (item[cp_col] == campaign_id) {
      content_array.push(item[col]);
      if (item[col] == id) {
        break;
      }
    }
  }
  
  content_array.reverse();

  var res = [];
  
  for (i=1;i<3;i++) {
    if (content_array[i]) {
      res.push(content_array[i]);
    }
  }
  
  return res;
}

