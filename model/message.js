var database = require('../initializers/database');
var validator = require('validator');
var xssFilters = require('xss-filters');


var message = function() {};

message.getMessages = function(callback) {
  var messageList = [];
  var cursor = database.db.collection('messages').find();

  cursor.each(function (err, doc) {
    if (doc !== null) {
      messageList.push(doc);
    } else {
      callback(null, messageList);
    }
  });
};

message.createMessage = function(requestBody, callback) {
  var messageObject;
  console.log('creating new message...', requestBody)

  if (isValidCreateRequest(requestBody)) {
      messageObject = buildMessageObject(requestBody);
      database.db.collection('messages').insertOne(messageObject, function (err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Message inserted successfully');
        }
      });
  } else {
    callback('Not a validRequest', null);
  }
};

message.deleteMessage = function(requestBody, callback) {
  var messageObject;

  if (isValidDeleteRequest(requestBody)) {
    messageObject = buildDeleteMessageObject(requestBody);
    database.db.collection('messages').deleteOne({
      "m_nr" : messageObject.m_nr,
      "conv_id" : messageObject.conv_id,
    }, function(err, results) {
      if (err) {
        callback(err, null);
      } else {
        if (results.result.n > 0) {
          callback(null, 'Message deleted successfully');
        } else {
          callback('No document was found to delete', null);
        }
      }
    });
  } else {
      callback('Not a validRequest', null);
    }
};

message.updateMessage = function(requestBody, callback) {
  var messageObject;

  if (isValidUpdateRequest(requestBody)) {
    messageObject = buildMessageObject(requestBody);
    database.db.collection('messages').updateOne({
      "m_nr" : messageObject.m_nr,
      "conv_id" : messageObject.conv_id
    }, {
      $set : {
        "qtext" : messageObject.qtext,
        "rtext" : messageObject.rtext,
        "is_alternative" : messageObject.is_alternative }
    }, function(err, results) {
      if (err) {
        callback(err, null);
      } else {
        if (results.result.n > 0 ) {
            callback(null, 'Message updated successfully');
        } else {
          callback('No document was found to update', null);
        }
      }
    });
  } else {
      callback('Not a validRequest', null);
    }
};

message.deleteMessagesForConv_idPromise = function(conv_id)  {
  return new Promise(function(resolve, reject) {
    database.db.collection('messages').deleteMany({
      'conv_id': conv_id
    }, function(err, deleteResults) {
      if (err) {
        console.log('error deleting msgs for convid:', err)
        reject(err);
      } else {
        resolve(deleteResults);
      }
    })
  })
}


function isValidCreateRequest(requestBody) {
  if (!isValidM_nr(requestBody.m_nr)) {
    console.log('m_nr not valid'); return false;}
  else if (!isValidText(requestBody.qtext)) {
    console.log('question text not valid'); return false;}
  else if (!isValidText(requestBody.rtext)) {
    console.log('response text not valid'); return false;}
  else if (!isValidConv_id(requestBody.conv_id)) {
    console.log('conv_id not valid'); return false;}
  else if (!isValidIs_Alternative(requestBody.is_alternative)) {
    console.log('is_alternative not valid'); return false;}
  else { console.log('valid request!'); return true;}
}


function isValidDeleteRequest(requestBody) {
  if (!isValidM_nr(requestBody.m_nr)) {
    console.log('m_nr not valid'); return false;}
  else if (!isValidConv_id(requestBody.conv_id)) {
    console.log('conv_id not valid'); return false;}
  else { console.log('valid request!'); return true;}
}


function isValidUpdateRequest(requestBody) {
  if (!isValidM_nr(requestBody.m_nr)) {
    console.log('m_nr not valid'); return false;}
  else if (!isValidText(requestBody.qtext)) {
    console.log('question text not valid'); return false;}
  else if (!isValidText(requestBody.rtext)) {
    console.log('response text not valid'); return false;}
  else if (!isValidConv_id(requestBody.conv_id)) {
    console.log('conv_id not valid'); return false;}
  else if (!isValidIs_Alternative(requestBody.is_alternative)) {
    console.log('is_alternative not valid'); return false;}
  else { console.log('valid request!'); return true;}
}


function isValidM_nr(m_nr) {
  try {
    if (typeof(m_nr) === 'number') {
      return (m_nr > 0 && m_nr < 99999); // arbitrary for safety
    } else if (typeof(m_nr) === 'string') {
      var escapedM_nr = validator.escape(m_nr);
      return validator.isInt(escapedM_nr, { min: 0, max: 99999}); // arbitrary for safety
    } else {
      console.log('m_nr not a string or a number');
      return false;
    }
  } catch (err) {
    console.log('error validating m_nr:', m_nr, err);
    return false;
  }
}


function isValidText(messageText) {
  try {
    var escapedText = validator.escape(messageText);
    return validator.isLength(escapedText, { min: 0, max : undefined});
  } catch (err) {
    console.log('error validating text:', messageText, err);
    return false;
  }
}


function isValidConv_id(conv_id) {
  try {
    if (typeof(conv_id) === 'number') {
      return (conv_id > 0 && conv_id < 99999); // arbitrary for safety
    } else if (typeof(conv_id) === 'string') {
      var escapedConv_id = validator.escape(conv_id);
      return validator.isInt(escapedConv_id, { min: 0, max: 99999}); // arbitrary limit
    } else {
      console.log('conv_id not a string');
    }
  } catch (err) {
    console.log('error validating conv_id:', conv_id, err);
    return false;
  }
}


function isValidIs_Alternative(is_alternative) {
    try {
      if (typeof(is_alternative) === 'string') {
        return validator.isBoolean(is_alternative);
      } else if (typeof(is_alternative) === 'boolean') {
        return true;
      }
    } catch (err) {
      return false;
    }
}


function buildMessageObject(requestBody) {
  messageDocument = {};
  messageDocument.m_nr = returnNumberFromValue(requestBody.m_nr);
  messageDocument.conv_id = returnNumberFromValue(requestBody.conv_id);
  messageDocument.is_alternative = returnBoolFromValue(requestBody.is_alternative);
  messageDocument.qtext = validator.escape(requestBody.qtext);
  messageDocument.rtext = validator.escape(requestBody.rtext);
  return messageDocument;
}


function buildDeleteMessageObject(requestBody) {
  messageDocument = {};
  messageDocument.m_nr = returnNumberFromValue(requestBody.m_nr);
  messageDocument.conv_id = returnNumberFromValue(requestBody.conv_id);
  return messageDocument;
}


// The isValidXRequest verified that value is either a string or an int.
// The 2 functions below wrap the parsing and validation of this value.
function returnNumberFromValue(value) {
  if (typeof(value) === 'string') {
    return parseInt(validator.escape(value));
  } else {
    return value;
  }
}

function returnBoolFromValue(value) {
  if (typeof(value) === 'string') {
      if (String(value) == "true") {
        return true;
      } else {
        return false;
      }
  } else {
    return value;
  }
}


module.exports = message;
