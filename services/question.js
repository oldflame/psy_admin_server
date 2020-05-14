var questionService = {
  getAllQuestions: (req, res) => {
    req.app.db.models.Questions.find({ isDeleted: false }, (err, questions) => {
      if (err) {
        console.log("Error", err);
        return res.json([]);
      }
      console.log("All Questions: ", questions);
      return res.status(200).json(questions);
    });
  },

  getQuestionsForCategory: (req, res) => {
    const category = req.params["questionCategory"];
    req.app.db.models.Questions.find(
      { questionCategory: category },
      (err, questions) => {
        if (err) {
          console.log("Error", err);
          return res.json([]);
        }
        console.log("Questions: ", questions);
        return res.status(200).json(questions);
      }
    );
  },

  addNewQuestion: (req, res) => {
    var workflow = req.app.utility.workflow(req, res);
    workflow.on(
      "validateData",
      () => {
        if (
          !req.body.questionName ||
          !req.body.questionName.toString().trim()
        ) {
          return res.status(400).json({
            msg: "Question Name is required",
          });
        }
        if (
          !req.body.questionCategory ||
          !req.body.questionCategory.toString().trim()
        ) {
          return res.status(400).json({
            msg: "Question Category is required",
          });
        }
        workflow.emit("writeQuestionToDB");
      },
      workflow.on("writeQuestionToDB", () => {
        req.app.db.models.Questions.create(req.body, (err, question) => {
          if (err) {
            console.log(err);
            return res.status(400);
          }
          console.log("Submitted Question: ", question);
          return res.status(200).json(question);
        });
      })
    );
    workflow.emit("validateData");
  },

  deleteQuestion: (req, res) => {
    req.app.db.models.Questions.update(
      { _id: req.params.questionId },
      {
        $set: {
          isDeleted: true,
        },
      }
    ).exec((err, deleted) => {
      if (err) {
        console.log("Delete Question err", err);
        return res.status(400).json({
          msg: "Failed to delete Question. Try again!",
        });
      }

      if (!deleted) {
        console.log("Delete Question err", err);
        return res.status(400).json({
          msg: "Failed to delete Question. Try again!",
        });
      }

      return res.status(200).json();
    });
  },
};
module.exports = questionService;
