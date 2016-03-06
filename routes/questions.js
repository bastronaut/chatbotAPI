// handles all /questions calls
var question = require('../model/question')
// console.log(questionmodel);



module.exports = function(router) {
  // console.log(questionmodel)
  // var question = new questionmodel;

  router.route('/:q_nr')
  // handle HTTP calls for /questions/:q_nr
  .put(function(req, res, next) {
    // update question
    question.updateQuestion('reqparams', function(err, updateResult) {
      if (err) {
        res.send({'results' : error});
      } else {
        res.send({'results' : updateResult});
      }
    })
  })
  .delete(function (req, res, next) {
    // delete question
    // TODO get request params
    if (err) {
      res.send({'results' : 'error'});
    } else {
      res.send({'results' : deleteResult});
    }
  });

  router.route('/')
  // handle HTTP calls for /questions/
  .get(function(req, res, next) {
    question.getQuestions(function(err, questions) {
      if (err) {
        res.send({'results' : 'error'})
      } else {
        res.send({'results' : questions})
      }
    })
  })
  .post(function(req, res, next) {
    console.log(req.body);
    question.insertQuestion(function(err, insertResult) {
      if (err) {
        res.send({'results' : 'error'})
      } else {
        res.send({'results' : insertResult});
      }
    })
  })
}
