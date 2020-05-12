var questionCategoryService = {
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
    req.app.db.models.QuestionCategory.find({isDeleted:false}, (err, questionCategories) => {
      if (err) {
        console.log("Error", err);
        return res.json([]);
      }
      console.log("All Question Categories: ", questionCategories);
      return res.status(200).json(questionCategories);
    });
  },

  deleteQuestionCategory: (req, res) => {
    req.app.db.models.QuestionCategory.update(
      { _id: req.params.questionCategoryId },
      {
        $set: {
          isDeleted: true,
        },
      }
    ).exec((err, deleted) => {
      if (err) {
        console.log("Delete imageCategory err", err);
        return res.status(400).json({
          msg: "Failed to delete imageCategory. Try again!",
        });
      }

      if (!deleted) {
        console.log("Delete imageCategory err", err);
        return res.status(400).json({
          msg: "Failed to delete image category. Try again!",
        });
      }

      return res.status(200).json();
    });
  },
};

module.exports = questionCategoryService;
