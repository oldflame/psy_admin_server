var questionService = {
    getAllQuestions: (req, res) => {
        req.app.db.models.Questions.find({}, (err, questions) => {
            if (err) {
                console.log("Error", err);
                return res.json([]);
            }
            console.log("All Questions: ", questions);
            return res.status(200).json(questions);
        });
    },

    getQuestionsForCategory: (req,res) => {
        const category = req.params['questionCategory'];
        req.app.db.models.Questions.find({questionCategory: category}, (err, questions) => {
            if (err) {
                console.log("Error", err);
                return res.json([]);
            }
            console.log("Questions: ", questions);
            return res.status(200).json(questions);
        });
    },

    addNewQuestion: (req, res) => {
        req.app.db.models.Questions.create(req.body, (err, question) => {
            if (err) {
                console.log(err);
                return res.status(400);
            }
            console.log("Submitted Question: ", question);
            return res.status(200).json(question);
        });
    },

    deleteQuestion: (req, res) => {
        req.app.db.models.Questions.deleteOne(
            { _id: req.params.questionId },
            (err, question) => {
              if (err) {
                console.log("Error", err);
                return res.json([]);
              }
              console.log("Question Deleted", question);
              return res.status(200).json(question);
            }
          );
    }


}
module.exports = questionService;