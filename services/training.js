var trainingService = {
  getAllTrainings: (req, res) => {
    req.app.db.models.Trainings.find({}, (err, trainings) => {
      if (err) {
        console.log("Error", err);
        return res.json([]);
      }
      console.log("All trainings: ", trainings);
      return res.status(200).json(trainings);
    }).populate({path: 'questionData.category'}).populate({path: 'imageData.category'})
  },

  findById: (req, res) => {
    req.app.db.models.Trainings.findOne(
      { _id: req.params.trainingId },
      (err, training) => {
        if (err) {
          console.log("Error", err);
          return res.json(null);
        }
        console.log("training by ID: ", training);
        return res.status(200).json(training);
      }
    ).populate({path: 'questionData.category'}).populate({path: 'imageData.category'});
  },

  addNewTraining: (req, res) => {
    var workflow = req.app.utility.workflow(req, res);
    workflow.on(
      "validateData",
      () => {
        if (!req.body.name || !req.body.name.toString().trim()) {
          return res.status(400).json({
            msg: "Training Name is required",
          });
        }
        workflow.emit("writeTrainingToDB");
      },
      workflow.on("writeTrainingToDB", () => {
        req.app.db.models.Trainings.create(req.body, (err, training) => {
          if (err) {
            console.log(err);
            return res.status(400);
          }
          console.log("Submitted Training: ", training);
          return res.status(200).json(training);
        });
      })
    );
    workflow.emit("validateData");
  },

  deleteTraining: (req, res) => {
    req.app.db.models.Trainings.update(
      { _id: req.params.trainingId },
      {
        $set: {
          isDeleted: !(req.params.doRestore == "restore"),
        },
      }
    ).exec((err, deleted) => {
      if (err) {
        console.log("Delete Training err", err);
        return res.status(400).json({
          msg: "Failed to delete Training. Try again!",
        });
      }

      if (!deleted) {
        console.log("Delete Training err", err);
        return res.status(400).json({
          msg: "Failed to delete Training. Try again!",
        });
      }

      return res.status(200).json();
    });
  },

  addQuestionsToTraining: (req, res) => {
    req.app.db.models.Trainings.update(
      { _id: req.params.trainingId },
      {
        $push: {
          questionData: req.body,
        },
      }
    ).exec((err, updatedQuestions) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to udpate Training. Try again!",
        });
      }

      if (!updatedQuestions) {
        console.log("Update Training err", err);
        return res.status(400).json({
          msg: "Failed to update Training. Try again!",
        });
      }
      return res.status(200).json();
    });
  },

  removeQuestionsFromTraining: (req, res) => {
    req.app.db.models.Trainings.update(
      { _id: req.params.trainingId },
      {
        $pull: {
          questionData: {_id: req.params.questionDataId},
        },
      }
    ).exec((err, updatedQuestions) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to udpate Training. Try again!",
        });
      }

      if (!updatedQuestions) {
        console.log("Update Training err", err);
        return res.status(400).json({
          msg: "Failed to update Training. Try again!",
        });
      }
      return res.status(200).json();
    });
  },

  addImagesToTraining: (req, res) => {
    req.app.db.models.Trainings.update(
      { _id: req.params.trainingId },
      {
        $push: {
          imageData: req.body,
        },
      }
    ).exec((err, updatedImages) => {
      if (err) {
        console.log("Update Training err", err);
        return res.status(400).json({
          msg: "Failed to Update Training. Try again!",
        });
      }

      if (!updatedImages) {
        console.log("Update Training err", err);
        return res.status(400).json({
          msg: "Failed to Update Training. Try again!",
        });
      }

      return res.status(200).json();
    });
  },

  removeImagesFromTraining: (req, res) => {
    req.app.db.models.Trainings.update(
      { _id: req.params.trainingId },
      {
        $pull: {
          imageData: {_id: req.params.imageDataId},
        },
      }
    ).exec((err, updatedQuestions) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to udpate Training. Try again!",
        });
      }

      if (!updatedQuestions) {
        console.log("Update Training err", err);
        return res.status(400).json({
          msg: "Failed to update Training. Try again!",
        });
      }
      return res.status(200).json();
    });
  },

  // User app services

  getRandomTraining: (req, res) => {
    req.app.db.models.Trainings.aggregate([{ $sample: {size: 1} }], (err, trainings) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to get training. Try again!",
        });
      }

      return res.status(200).json(trainings[0]);
    });
  }
};
module.exports = trainingService;
 