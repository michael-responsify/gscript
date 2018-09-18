function getData(){
  
  var global = globals();
  
  var clients = [];
  var content_types = [];
  var roles = [];
  var users = [];
  
  var client_data = global.companies.getDataRange().getValues();
  var roles_data = global.roles.getDataRange().getValues();
  var users_data = global.users.getDataRange().getValues();
  
  var client_head = headers.company_headers();
  var roles_head = headers.role_headers();
  var users_head = headers.user_headers();
  
  var i;

  for (i=0;i<client_data.length;i++){
    if (i==0){continue;}
    clients.push( {
      "id": client_data[i][client_head.company_id],
      "name": client_data[i][client_head.company_name]
    } )
  }
  
  for (i=0;i<roles_data.length;i++){
    if (i==0){continue;}
    roles.push( {
      "id": roles_data[i][roles_head.role_id],
      "name": roles_data[i][roles_head.role_name]
    } )
  }
  
  
  for (i=0;i<users_data.length;i++){
    if (i==0){continue;}
    users.push ( {
      "id": users_data[i][users_head.user_id],
      "name": users_data[i][users_head.user_name]
    } )
  }
  
  return {"clients": clients, "content_types": content_types, "roles": roles, "users": users};
  
}

function storeCampaign(info){
  
  var global = globals();
  
  var campaign = info.campaign;
  var content = info.content;
  var assignees = info.assignees;
  var company = info.company;
  
  var campaign_headers = headers.campaign_headers();
  var content_headers = headers.content_headers();
  
  var row = [];
  row[campaign_headers.campaign_name] = campaign.campaign_name;
  row[campaign_headers.campaign_goal] = campaign.campaign_goal;
  row[campaign_headers.campaign_description] = campaign.campaign_description;
  row[campaign_headers.persona_link] = campaign.persona_link;
  row[campaign_headers.style_link] = campaign.style_guide_link;
  row[campaign_headers.brand_link] = campaign.brand_identity_link;
  row[campaign_headers.company_id] = company.company_id;
  row[campaign_headers.persona_name] = campaign.persona_name;
  row[campaign_headers.buyers_stage] = campaign.buyers_stage;
  row[campaign_headers.is_active] = false;
  row[campaign_headers.completed] = false;
  row[campaign_headers.buyers_journey] = campaign.buyers_journey;
  row[campaign_headers.writing_tone_1] = campaign.writing_tone_1;
  row[campaign_headers.writing_tone_2] = campaign.writing_tone_2;
  row[campaign_headers.writing_tone_3] = campaign.writing_tone_3;
   var i;
   var length = row.length;
   for (i=0;i<length;i++) {
     var z = row[i];
     if (!z && z !== false && z !== 0) {
       row.splice(i,1,null);
     }
   }
  global.campaigns.appendRow(row);
  
  var row = global.campaigns.getLastRow();
  var col = campaign_headers.campaign_id + 1;
  
  var id_cell = global.campaigns.getRange(row, col);
  id_cell.setFormulaR1C1("=SUM(R[-1]C[0],1)");
  var campaign_id = id_cell.getValue();
  id_cell.setValue(campaign_id)
  
  var i;
  length = Object.keys(content).length;
  for (i=1;i<=length;i++){
    var x = '_'+i;
    var item = content[x];
    
    if (!item || !item.title || item.title == '') {
      continue;
    }
    var row = [];
    row[content_headers.content_name] = item.title;
    row[content_headers.primary_keyword] = item.primary_keyword;
    row[content_headers.type] = item.type;
    row[content_headers.stage_id] = 0;
    row[content_headers.campaign_id] = campaign_id;
    row[content_headers.outline_approved] = false;
    row[content_headers.content_approved] = false;
    row[content_headers.is_published] = false;
    row[content_headers.email_subject] = item.email_subject;
    row[content_headers.social] = item.social;
    row[content_headers.company_id] = company.company_id;
     var y;
     var length = row.length;
     for (y=0;y<length;y++) {
       var z = row[y];
       if (!z && z !== false && z !== 0) {
         row.splice(y,1,null);
       }
     }
    global.content.appendRow(row)
      row = global.content.getLastRow();
      col = content_headers.content_id + 1;
      
      var c_id_cell = global.content.getRange(row, col);
      c_id_cell.setFormulaR1C1("=SUM(R[-1]C[0],1)");
      var content_id = c_id_cell.getValue();
      c_id_cell.setValue(content_id);
  }
  for (i=1;i<=Object.keys(assignees).length;i++){
    var x = '_'+i;
    var item = assignees[x];
    
    if (!assignees[x] || !assignees[x].role.id || assignees[x].role.id == ""){
      continue;
    }
    global.assignees.appendRow([campaign_id,assignees[x].role.id,assignees[x].user.id])
  }
  
  var launch = global.launch.getDataRange().getValues();
  var launch_headers = headers.launch_headers();
  var i;
  var length = launch.length;
  var check = null;
  for(i=0;i<length;i++) {
    var lch = launch[i];
    if (lch[launch_headers.launch_id] == 111) {
      var row = i+1;
      var check = 1;
      global.launch.deleteRow(row);
      break;
    }
  }
  if (!check) {
    throw 'Oops something went wrong. Please refresh your browser and try again.';
  }
}

function launchCampaign(info) {
  
  var global = globals();
  
  var campaign_name;
  var campaign_id;
  var flow_id;
  var launch_date;
  
  var i;
  for (i=0;i<info.length;i++){ //Grabbing information from the form
    if(info[i].name == 'campaign_name'){campaign_name = info[i].title;
                                        campaign_id = info[i].value;}
    if(info[i].name == 'flow_id'){flow_id = info[i].value}
    if(info[i].name == 'launch_date'){launch_date = new Date(info[i].value)}
  }
  
  //Sheet and Variable Declarations
  var campaigns = global.campaigns.getDataRange().getValues();
  var content = global.content.getDataRange().getValues();
  var workflow = global.workflow_stages.getDataRange().getValues();
  var assignees = global.assignees.getDataRange().getValues();
  var roles = global.roles.getDataRange().getValues();
  var usersRange = global.users.getDataRange().getValues();
  var companiesRange = global.companies.getDataRange().getValues();
  
  var camp_head = headers.campaign_headers();
  var cont_head = headers.content_headers();
  var wf_head = headers.workflow_headers();
  var ass_head = headers.assignee_headers();
  var users_head = headers.user_headers();
  var comp_head = headers.message_headers();
  
  var company_name;
  var company_id;
  
  var campaign_goal;
  var campaign_description;
  var personaLink;
  var styleLink;
  var brandLink;
  var company_solutions;
  var writing_tones;
      
  var i;    
  for (i=0; i < campaigns.length; i++){  //Grabbing relevant campaign information
    var campaign = campaigns[i];
    if (campaign_id == campaign[camp_head.campaign_id]){
      company_id = campaign[camp_head.company_id];
      campaign_goal = campaign[camp_head.campaign_goal];
      campaign_description = campaign[camp_head.campaign_description];
      personaLink = campaign[camp_head.persona_link];
      styleLink = campaign[camp_head.style_link];
      brandLink = campaign[camp_head.brand_link];
      writing_tones = campaign[camp_head.writing_tone_1]+" "+campaign[camp_head.writing_tone_2]+" "+campaign[camp_head.writing_tone_3];
    }
  }
  
  for (i=0;i<companiesRange.length;i++){ //Grabbing the company name
    var company = companiesRange[i];
    if (company[comp_head.company_id] == company_id) {
      company_name = company[comp_head.company_name];
      company_solutions = company[comp_head.company_solutions];
    }
  }
  
  //Making get request to flow to begin adding to workflows
  var options = createOptions("GET", global.headers);
  var url = www(global.flow, "lists/"+flow_id+"?organization_id=391260&workspace_id=393318&include=sections");
  var res = urlFetch(url, options);
  var sections = res.sections;

  //Folder Navigation
  var folders = checkExistingCompany(company_name, campaign_name);

  var companyFolder = folders[0];
  var campaignFolder = folders[1];
  
  
  var dateCounter = 0; //Used to offset the Dates
  var position = 0; //IDK if we need this
  var contentCounter = {} //Used to assign the correct column in flow to the correct type
  
  
  var x;
  var contentNumCounter = 0;
  for (x=0;x<content.length;x++){ //Begin content loop
    
    var item = content[x];
    
    if (item[cont_head.campaign_id] == campaign_id && item[cont_head.stage_id] == 0) {
      contentNumCounter += 1;
      var content_id = item[cont_head.content_id];
      var content_name = item[cont_head.content_name];
      var content_type = item[cont_head.type];
      var primary_keyword = item[cont_head.primary_keyword];
      var alt_keyword = item[cont_head.alt_keyword];
      var content_link = item[cont_head.content_link];
      
      var outline_due_date = "XX/XX/XX";
      var final_due_date = "XX/XX/XX";
      
      var word_count = (content_type == "Blog Post" ? "800-1200" : (content_type == "eBook" ? "2500-5000" : null));
      var outline_word_count = (content_type == "Blog Post" ? "200-300" : (content_type == "eBook" ? "500-800" : null));
      
      if (!(content_type in contentCounter)){
        var contentFolder = DriveApp.getFolderById(campaignFolder.getId()).createFolder(content_type);
        var outlinesFolder = DriveApp.getFolderById(contentFolder.getId()).createFolder('Outlines');
        var writingsFolder = DriveApp.getFolderById(contentFolder.getId()).createFolder('Writings');
        contentCounter[content_type] = 1;
      }
      else{
        contentCounter[content_type] += 1;
      }  
      var desiredName = content_type + " " + contentCounter[content_type];
      
      // ******************************* Creating Document and Creating NDash Assignment ************************************     
      
      var blog = DriveApp.getFileById("1VpK-Rw84SlVanvoK8bjbewQjG8CLDkgXE1SPpJFFt0M").makeCopy(content_name, outlinesFolder).getId();
      
      global.content.getRange(x+1,cont_head.doc_id+1).setValue(blog.toString());
      
      var groupID = "5b6898ce7ba892001400d406";
      var base = "https://go.ndash.co/webAPI/company/5b670559405c330014960eb7/group/"+groupID+"/createAssignment?json=";
      var json = {
        "title": campaign_name, 
        "type": content_type,
        "campaign": content_name,
        "summary": "Hi! We are looking for a concise and informative "+word_count+" word "+content_type+" post to be written from the information we have provided. Requirements are as followed: (1) As part of the solutions you include, please integrate applicable solutions listed on this page"+ company_solutions +"(2) Use these writing tones: "+writing_tones+", tailored to the Persona we provided. (3) Provide 3 or more credible links and embed them into the text. (4) Please use the keyword "+primary_keyword+" at least 3 times within the final "+content_type+" text. Please note that this assignment needs to be completed in 2 steps. Step 1: Please submit a "+outline_word_count+" word outline of the "+content_type+" for our review. Be sure to include all sections, solutions, and external links you plan to use in your "+content_type+". Please note that step 1 is due to us on "+outline_due_date+". Step 2: Once we have confirmed your outline, you may begin work on the "+content_type+" itself. The final "+content_type+" is due on "+final_due_date+". We hope to get to work with you on this assignment. Thanks and let us know if you have any questions!",
        "wordCount": word_count,
        "sourceLinks": [personaLink],
        "notes": "NOTE: Please follow the instructions carefully. Thanks!", 
        "saveAsDraft": true 
      };
      var encoded =  encodeURIComponent(JSON.stringify(json));
      var ndash = base + encoded;
      
      global.content.getRange(x+1,cont_head.ndash+1).setValue(ndash.toString());
      
      // ******************************** Assigning the Correct Section ID ************************************************
      
      
      var section_id = -1;
      for (var i = 0; i < sections.length; i++){
        if (sections[i].name == desiredName){
          section_id = sections[i].id;
        }
        if (sections[i].name == "Premium Offer"){
          var excess = sections[i].id;
        }
      }
      
      if (section_id == -1){
        section_id = excess;
      }
      
      var date = add_business_days(launch_date,5*dateCounter);
      
      
      // ******************************** Looping through all of the workflow stages for each piece of content ******************************** 
      
      
      
      for (var i = 1; i < workflow.length; i++){
        
        if (workflow[i][wf_head.stage_id].toString() == "1") {
          var setup = 552783;
        } else {setup=null}
        var task_name = workflow[i][wf_head.task_name]; 
        var role_id = workflow[i][wf_head.role_id];
        var stage_id = workflow[i][wf_head.stage_id];
        var duration = workflow[i][wf_head.duration];
        var startDate = date;
        date = add_business_days(date,duration);
        var d = date.toDateString();
        for (var y = 0; y < assignees.length; y++){
          if (assignees[y][ass_head.campaign_id] == campaign_id && assignees[y][ass_head.role_id] == role_id){
            var user_id = assignees[y][ass_head.user_id];
          }
        }
        
        var html = '<a href="'+DriveApp.getFileById(blog).getUrl()+'">Click to see this assignment</a>'; 
        
        
        
        
        // ******************************** Grabbing Username for Tags ****************************************************************
        
        
        
        for (var g = 0; g < usersRange.length; g++){
          if (usersRange[g][users_head.user_id] == user_id){
            var userName = usersRange[g][users_head.user_name];
            var userEmail = usersRange[g][users_head.contact_email];
            var owner_id = usersRange[g][users_head.flow_id];
          }
        }
   
        
        // ******************************** Adding to Flow ******************************************************************************
        
        
        var data = {'task':{"name":task_name,"workspace_id":393318, "list_id":new Number(flow_id), "section_id":section_id,"due_on":new Date(d), "owner_id":setup, "note_mime_type":"text/html","note_content":html}};
        options = createOptions("POST", global.headers, data);
        url = www(global.flow, global.flowTasks);
        Logger.log(data + "\n\n\n")
        var res = urlFetch(url, options);
        Logger.log(res)
        // ******************************** Appending to Google Sheet ****************************************************************  
        
        var task_id = res.task.id.toString();
        
          if (workflow[i][wf_head.stage_id] == 1){var active = true} else {var active = false}
        var arr = [task_name,active,d,false,stage_id,content_id,flow_id,393318,owner_id,user_id,task_id]; 
        global.tasks.appendRow(arr);
        var taskObject = {
          name: task_name,
          cName: content_name,
          date: d,
          campaign_name: campaign_name,
          link: "https://script.google.com/a/responsify.com/macros/s/AKfycbzsb0qIV71PiyvS0BnYFvyxS_4CqnEdyvyJgqekFp37e87B9bhP/exec",
        }
      }
      
      dateCounter+=1;
      position += 1; //necessary?
      global.content.getRange(x+1,cont_head.stage_id+1).setValue(1);
    }
  }
  
  var i;
  for (i=0;i<campaigns.length;i++){
    if (campaigns[i][camp_head.campaign_id] == campaign_id){
      global.campaigns.getRange(i+1,camp_head.is_active+1).setValue(true);
      break;
    }
  }
  
  campaign_launch_email(campaign_id);
  
}

function checkExistingCompany(company, campaign, client) {
  var campaign_folders = DriveApp.getFolderById("1NSaEIG6B7V_L3xKXAoNcDy9OfBw0v6Uk").getFolders();
  while (campaign_folders.hasNext()) {
    var folder = campaign_folders.next();
    if (folder.getName() == company){
      var companyFolder = folder.getId();
      var campaignFolder = DriveApp.getFolderById(companyFolder).createFolder(campaign);
      return [companyFolder, campaignFolder];
    }
  }
  var companyFolder = DriveApp.getFolderById("1NSaEIG6B7V_L3xKXAoNcDy9OfBw0v6Uk").createFolder(company).getId();
  var campaignFolder = DriveApp.getFolderById(companyFolder).createFolder(campaign);
  
  
  return [companyFolder, campaignFolder];
}

function get_launch_ids() {
    var global = globals();
    var launch = global.launch.getDataRange().getValues();
    var launches = [];
    var i;
    for (i=1;i<launch.length;i++) {
      var lch = launch[i];
      launches.push({"id":lch[0], 'campaign_name':lch[1]});
    }
    return launches;
}

function get_campaign_create(id, field_names_array) {
  var global = globals();
  
  
  var launch = global.launch.getDataRange().getValues();
  var launch_headers = headers.launch_headers();
  
  var checks = {};
  
  for (var x=0;x<launch.length;x++){
    var lch = launch[x];
    if (lch[launch_headers.launch_id] == id) {
      for (var y=0;y<field_names_array.length;y++){
        checks[field_names_array[y]] = launch[x][launch_headers[field_names_array[y]]];
      }
    }
  }
  
  return checks;
}

function change_campaign_create(id, name, value) { 
  var global = globals();
  
  
  var launch = global.launch.getDataRange().getValues();
  var launch_headers = headers.launch_headers();
      
  var col = (!!launch_headers[name]) ? launch_headers[name] : null;
  
  if (col) {
    for (var x=0;x<launch.length;x++){
      var lch = launch[x];
      if (lch[launch_headers.launch_id] == id) {
         global.launch.getRange(x+1, col+1).setValue(value);
         return [id,value];
      }
    }
  }
}
