var trainingService = {
    getAllTrainings: (req, res) => {
      req.app.db.models.Trainings.find({ isDeleted: false }, (err, trainings) => {
        if (err) {
          console.log("Error", err);
          return res.json([]);
        }
        console.log("All trainings: ", trainings);
        return res.status(200).json(trainings);
      });
    },

    addNewTraining: (req, res) => {
        var workflow = req.app.utility.workflow(req, res);
        workflow.on(
          "validateData",
          () => {
            if (
              !req.body.trainingName ||
              !req.body.trainingName.toString().trim()
            ) {
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
              isDeleted: true,
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


};
module.exports = trainingService;