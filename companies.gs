// Company Declarations and Methods
function new_company(row){
  var global = globals();
  
  var company = {};
  
  var companies_headers = headers.company_indices();
  
  var i;
  var length = row.length;
  for (i=0;i<length;i++){
    company[companies_headers[i]] = row[i];
  }
  
  return company
}

function add_company() {
  
}

function get_company_by_id(id, info) {
  var global = globals();
  
  var companies = global.companies.getDataRange().getValues();
  var companies_headers = headers.company_headers();
  
  var col = companies_headers.company_id;                  
  
  var i;
  var length = companies.length;
  for (i=0;i<length;i++) {
    var row = companies[i];
    if (row[col] == id) {
      var company = new_company(row);
      
      if (!info) {
        return company;
      }
      info['company'] = {};
      info.company = company;
      return info;
    }
  }
}

function get_all_companies() {
  var global = globals();
  
  var companies = global.companies.getDataRange().getValues();
  var comp_head = headers.company_headers();
  
  var comps = [];
  
  var x;
  var length = companies.length;
  for (x=1;x<length;x++) {
    var row = companies[x];
    var company_name = row[comp_head.company_name]; 
    var company_id = row[comp_head.company_id];
    
    comps.push({'name':company_name,'id':company_id});
  }
  
  return comps;
}

