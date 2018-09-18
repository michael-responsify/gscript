//Chatbox Creation and Methods
function postMessage(id, message){

  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var content_headers = headers.content_headers();

  var c_id;
  for (var i=0;i<content.length;i++){
    if (content[i][content_headers.doc_id] == id){
      c_id = content[i][content_headers.content_id];
      break;
    }
  }
  
  global.chatbox.appendRow([global.chatbox.getLastRow(), id, c_id, message.user, message.timestamp, message.content, true]);

  return message;
}

function getMessages(id){

  var global = globals();
  
  var chatboxRange = global.chatbox.getDataRange().getValues();
  var messages = [];
  var message_headers = headers.message_headers();
  var i;
  for (i=0;i<chatboxRange.length;i++) {
      if (chatboxRange[i][message_headers.doc_id].toString() == id.toString()) {
        messages.push({
          "message_id":chatboxRange[i][message_headers.message_id],
          "doc_id":chatboxRange[i][message_headers.doc_id],
          "content_id":chatboxRange[i][message_headers.content_id],
          "user":chatboxRange[i][message_headers.user_posting],
          "timestamp":chatboxRange[i][message_headers.timestamp],
          "content":chatboxRange[i][message_headers.content_id],
          "unread":chatboxRange[i][message_headers.unread]
        })
      }
  }

  return JSON.stringify(messages);
  
}

function unread_overall() {
  var global = globals();
  
  var chatbox = global.chatbox.getDataRange().getValues();
  var message_headers = headers.message_headers();
  var unread = {};
  var messages = [];
  
  unread.messages = messages;
  
  for (var i=0;i<chatbox.length;i++) {
    if (chatbox[i][message_headers.unread] == true) {
      var message = {
        "message_id": chatbox[i][message_headers.message_id],
        "doc_id": chatbox[i][message_headers.doc_id],
        "content_id": chatbox[i][message_headers.content_id],
        "user_posting": chatbox[i][message_headers.user_posting],
        "timestamp": chatbox[i][message_headers.timestamp],
        "content": chatbox[i][message_headers.content]
      };
      unread.messages.push(message);
    }
  }
  unread.count = unread.messages.length;

  return JSON.stringify(unread);
}

function unread_by_content() {
  var global = globals();
  
  var chatbox = global.chatbox.getDataRange().getValues();
  var message_headers = headers.message_headers();
  var unread = {};
  
  for (var i=0;i<chatbox.length;i++) {
    if (chatbox[i][message_headers.unread] == true) {
      var c_id = '_'+chatbox[i][message_headers.content_id];
      if (!unread[c_id]){
        unread[c_id] = [];
      }
      var message = {
        "message_id": chatbox[i][message_headers.message_id],
        "doc_id": chatbox[i][message_headers.doc_id],
        "user_posting": chatbox[i][message_headers.user_posting],
        "timestamp": chatbox[i][message_headers.timestamp],
        "content": chatbox[i][message_headers.content]
      };
      unread[c_id].push(message);
    }
  }

  return JSON.stringify(unread);
}

function unread_single(id) { //Consider taking out

}

function remove_unread(id) {
  var global = globals();
  
  var content = global.content.getDataRange().getValues();
  var chatbox = global.chatbox.getDataRange().getValues();

  var content_headers = headers.content_headers();
  var message_headers = headers.message_headers();
  
  var i;
  
  for (i=0;i<content.length;i++) {
    if (content[i][content_headers.doc_id].toString() == id){
      var c_id = content[i][content_headers.content_id];
    }
  }
  
  for (i=0;i<chatbox.length;i++) {
    if (chatbox[i][message_headers.content_id] == c_id) {
      global.chatbox.getRange(i+1,message_headers.unread+1).setValue(false);
    }
  }
}
