// ********************************************************************************************************************************************
// ********************************************************************************************************************************************
// ******************************************************* DOCUMENT UTILITY FUNCTIONS *********************************************************
// ********************************************************************************************************************************************
// ********************************************************************************************************************************************


function check_length(text){
  var split = text.split(/\W/);
  var i;
  for (i=0;i<split.length;i++){
    if (split[i] == ""){
      split.splice(i,1);
    }
  }
  var length = split.length;
  if (length === 0) {
    return [false, 0];
  }
  if (length < 800) {
    return [false, length];
  }
  if (length > 2000) {
    return [false, length];
  }
  return [true, length];
}

function check_char_length(type,text){
  
  var charCount = char_count(text);
  if (type == 'seo') {
    if ( charCount == 0 ) {
      return [false, charCount];
    }
    if ( charCount < 40 ) {
      return [false, charCount];
    }
    if ( charCount > 60 ) {
      return [false, charCount];      
    }
    
    return [true, charCount];
  }
  if (type == 'meta') {
    if ( charCount == 0 ) {
      return [false, charCount];
    }
    if ( charCount < 200 ) {
      return [false, charCount];
    }
    if ( charCount > 240 ) {
      return [false, charCount];      
    }
    return [true, charCount];
  }
  if (type == 'social'){
    if (charCount < 120)
      return [false, charCount];
    if (charCount > 160)
      return [false, charCount];
    return [true, charCount];    
  }
}

function char_count(text) {
  var split = text.split('');
  var i;
  
  return split.length;
}


function check_keywords(id) {
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var content_headers = headers.content_headers();
  var i;
  for (i=0;i<content.length;i++){
    if (content[i][content_headers.doc_id] == id){
      var keyword = content[i][content_headers.primary_keyword];
      break;
    }
  }
  
  var text = DocumentApp.openById(id).getBody().getText();
  var check = new RegExp(keyword, 'i');

  if (text.search(check) == -1) {
    return [false, 0];
  } else { 
    
    var a = text.search(check);
    var b = text.slice(a + keyword.length);
    var c = b.search(check);
    
    var how_many = function(str, text, counter) {
      if (!counter){counter = 0}
      var check = new RegExp(str, 'i');
      var a = text.search(check);
      if (a != -1) {
        var c = counter+1;
        var b = text.slice(a + str.length);
        return how_many(str,b,c);
      } else {
        return counter;
      }
    }
    if (how_many(keyword, text) < 3) {
      return [false, how_many(keyword, text)];
    } else {
      return [true, how_many(keyword, text)];
    }
  }
}


// *********************** DATE Functions ****************************
// ******************************************************************* 

function add_business_days(startdate, numDays) {
  var i;
  var x=0;
  for (i=0;i<(numDays+x);i++){
    var d = new Date(startdate);
    var dd = new Date(d.setDate(startdate.getDate()+i));
    var day = dd.getDay();
    if (day > 4) {
      x++;
    }
  }
  var final = new Date(startdate);
  final.setDate(startdate.getDate() + numDays + x);
  return final;
}

function parse_date(date, type) {

  date = new Date(date);
  var fix = date.getYear();
  if (fix < 2000) {
    fix += 1000;
    date.setYear(fix);
  }
  var days_short = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var days_long = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var months_short = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var months_long = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var dayIndex = date.getDay();
  var day_short = days_short[dayIndex];
  var day_long = days_long[dayIndex];
  var dd = date.getDate();
  var monthIndex = date.getMonth();
  var month = monthIndex + 1;
  var month_short = months_short[monthIndex];
  var month_long = months_long[monthIndex];
  var yy = date.getYear().toString().slice(2);
  var yyyy = date.getYear();
  var secX = date.getSeconds();
  var sec = (secX == 0 || secX < 10) ? ('0'+secX) : secX;
  var minX = date.getMinutes();
  var min = (minX == 0 || minX < 10) ? ('0'+minX) : minX;
  var hr = ((date.getHours() > 12) ? (date.getHours() - 12) : date.getHours());
  var ampm = ((date.getHours() > 12) ? 'pm' : 'am')
  
  if (type == 'message') {
    return month + '/' + dd + '/' + yy + ' - ' + hr + ':' + min + ':' + sec + ampm;
  }
  if (type == 'mmddyy') {
    return month + '/' + dd + '/' + yy;
  }
  return date;
}


function convertMS( milliseconds ) {
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return {
        day: day,
        hour: hour,
        minute: minute,
        seconds: seconds
    };
}

// *********************** Doc Functions ****************************
// *******************************************************************



function active_user() {
  return Session.getActiveUser().getEmail();
}

function getGuidelines(id) {
  var global = globals();
  
  var contentRange = global.content.getDataRange().getValues();
  var campaignsRange = global.campaigns.getDataRange().getValues();
  var content_headers = headers.content_headers();
  var campaign_headers = headers.campaign_headers();
  var guidelines = {};
  
  var i;
  for (i=0;i<contentRange.length;i++) {
    if (contentRange[i][content_headers.doc_id] == id) {
      guidelines.keyword = contentRange[i][content_headers.primary_keyword];
      var campaign_id = contentRange[i][content_headers.campaign_id];
    }
  }
  
  for (i=0;i<campaignsRange.length;i++) {
    if (campaignsRange[i][1] == campaign_id) {
      guidelines.goal = campaignsRange[i][campaign_headers.campaign_goal];
      guidelines.description = campaignsRange[i][campaign_headers.campaign_description];
      guidelines.link = campaignsRange[i][campaign_headers.persona_link];
    }
  }
  
  return guidelines;
}

function check_overdue(due, today) {
  var diff = convertMS(due - today).day;
  
  if (today === due && diff < 0) {
    return 'overdue';
  } else if (diff === 0) {
    return 'due_today';
  } else if (diff === 1) {
    return 'due_tomorrow';
  } else if (diff >= 2) {
    return 'upcoming';
  }
}