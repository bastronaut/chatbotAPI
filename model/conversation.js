

function getConversations(callback) {
  var conversations = [];
  var cursor = db.collection('chatrule').find();

  cursor.each(function (err, doc) {
    if (doc != null) {
      // put chatrule in array
    } else {
      //  callback with return array
    }
  });
}


function insertConversation(conversation, callback) {
  db.collection('conversations').insertOne({});

}

// TODO: add upsert : true to update statement!
function updateConversation(conversation, callback) {
  db.collection('conversations').updateOne({})

}

function deleteConversation(conversation, callback) {
  db.collcetion('conversations').deleteOne({})
}