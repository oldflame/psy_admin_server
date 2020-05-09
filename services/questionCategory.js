var questionCategoryService = {
  addQuestionCategory: (req, res) => {
    req.app.db.models.QuestionCategory.create(req.body, (err, questionCategory) => {
        if (err) {
          console.log(err);
          return res.status(400);
        }
        console.log("Submitted Question Category: ", questionCategory);
        return res.status(200).json(questionCategory);
      });
  },

  getAllQuestionCategories: (req, res) => {
    req.app.db.models.QuestionCategory.find({}, (err, questionCategories) => {
      if (err) {
        console.log("Error", err);
        return res.json([]);
      }
      console.log("All Question Categories: ", questionCategories);
      return res.status(200).json(questionCategories);
    });
  },

  deleteQuestionCategory: (req, res) => {
    req.app.db.models.QuestionCategory.deleteOne(
      { _id: req.params.questionCategoryId },
      (err, questionCategory) => {
        if (err) {
          console.log("Error", err);
          return res.json([]);
        }
        console.log("Question Category Deleted", questionCategory);
        return res.status(200).json(questionCategory);
      }
    );
  },
};

module.exports = questionCategoryService;
