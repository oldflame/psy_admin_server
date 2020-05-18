let questionCategoryService = {
  addQuestionCategory: (req, res) => {
    req.app.db.models.QuestionCategory.create(
      req.body,
      (err, questionCategory) => {
        if (err) {
          console.log(err);
          return res.status(400);
        }
        console.log("Submitted Question Category: ", questionCategory);
        return res.status(200).json(questionCategory);
      }
    );
  },

  getAllQuestionCategories: (req, res) => {
    req.app.db.models.QuestionCategory.find({},
      (err, questionCategories) => {
        if (err) {
          console.log("Error", err);
          return res.json([]);
        }
        console.log("All Question Categories: ", questionCategories);
        return res.status(200).json(questionCategories);
      }
    );
  },

  deleteQuestionCategory: (req, res) => {
    req.app.db.models.QuestionCategory.update(
      { _id: req.params.questionCategoryId },
      {
        $set: {
          isDeleted: !(req.params.doRestore == "restore"),
        },
      }
    ).exec((err, deleted) => {
      if (err) {
        console.log("Delete Question Category err", err);
        return res.status(400).json({
          msg: "Failed to delete Question Category. Try again!",
        });
      }

      if (!deleted) {
        console.log("Delete Question Category err", err);
        return res.status(400).json({
          msg: "Failed to delete Question Category. Try again!",
        });
      }

      return res.status(200).json();
    });
  },
};

module.exports = questionCategoryService;
