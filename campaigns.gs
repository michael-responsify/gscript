//Campaign Declaration and Methods
function new_campaign(row){
  var global = globals();
  
  var campaign = {};
  
  var campaigns_headers = headers.campaign_indices();
  
  var i;
  var length = row.length;
  for (i=0;i<length;i++){
    campaign[campaigns_headers[i]] = row[i];
  }
  
  return campaign;
}

function add_campaign_launch(company_id) {
  var global = globals();
  
  global.launch.appendRow([null,'New Campaign',company_id]);
  var row = global.launch.getLastRow();
  
  var id_cell = global.launch.getRange(row, 1);
  id_cell.setFormulaR1C1("=SUM(R[-1]C[0],1)");
  var company_id = id_cell.getValue();
  id_cell.setValue(company_id)
  return id_cell.getValue();
}

function get_campaign_by_id(id, info) {
  var global = globals();
  
  var campaigns = global.campaigns.getDataRange().getValues();
  var campaigns_headers = headers.campaign_headers();
  
  var col = campaigns_headers.campaign_id;                  
  
  var i;
  var length = campaigns.length;
  for (i=0;i<length;i++) {
    var row = campaigns[i];
    if (row[col] == id) {
      var campaign = new_campaign(row);
      if (!info) {
        return campaign;
      }
      info['campaign'] = {};
      info.campaign = campaign;
      return info;
    }
  }
}

function get_campaigns_by_company(id) {
  var global = globals();
  
  var campaigns = global.campaigns.getDataRange().getValues();

  var campaigns_headers = headers.campaign_headers();
                    
  var company_campaigns = {};
  
  var all = [];
  var ids = [];
  
  var col = campaigns_headers.company_id;
  
  var i;
  var length = campaigns.length;
  for (i=0;i<length;i++) {
    var campaign = campaigns[i];
    if (campaign[col] == id) {
      var cmp = new_campaign(campaign);
      all.push(cmp);
      ids.push(campaign[campaigns_headers.campaign_id]);
    }
  }
  
  company_campaigns.all = all;
  company_campaigns.ids = ids;
  
  return company_campaigns;
}

function get_launch_campaigns(selected) {
  var global = globals();
  
  var launch = global.launch.getDataRange().getValues();
  var launch_headers = headers.launch_headers();
  
  var camps = [];

  var x;  
  var length = launch.length;
  for (x=0;x<length;x++) {
    var row = launch[x];
      
    var company = row[launch_headers.company_id];
    var campaign = row[launch_headers.campaign_name];
    var launch_id = row[launch_headers.launch_id];
    
    if (company == selected) {
      camps.push({'launch_id':launch_id,'campaign_name':campaign})
    }
  }
  
  return camps;
}