const _ = require('lodash');

var userService = {
  checkOngoingTraining: (req, res) => {
    req.app.db.models.User.findOne(
      {
        _id: req.user._id,
      },
      "ongoingSession",
      (err, session) => {
        if (err) {
          console.log("err", err);
          return res.status(400).json({
            msg: "Failed to fetch ongoing session. Try again!",
          });
        }

        return res.status(200).json(session);
      }
    ).populate("ongoingSession");
  },

  getUser: (req, res) => {
    req.app.db.models.User.findOne(
      {
        _id: req.params.userId
      },
      (err, users) => {
        if (err) {
          console.log("err", err);
          return res.status(400).json({
            msg: "Failed to fetch user. Try again!",
          });
        }
        return res.status(200).json(users);
      }
    );
  }, 

  getUsersList: (req, res) => {
    return req.app.db.models.User.find(
      {},
      "_id birthdate createdAt isActive firstName lastName",
      (err, users) => {
        if (err) {
          console.log("Find users err", err);
          return res.status(400).json({
            msg: "Failed to fetch users. Try Again!",
          });
        }
        return res.status(200).json(users);
      }
    );
  },

  getImageResponseTimeAndAccuracyTrend: (req, res) => {
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("findTrainingSessionsForUser", () => {
      req.app.db.models.TrainingSessions.find(
        { userId: req.params.userId },
        (err, trainingSessions) => {
          if (err) {
            console.log("Get training sessions err", err);
            return res.status(400).json({
              msg: "Failed to collect training data. Try again!",
            });
          }

          if (trainingSessions && trainingSessions.length > 0) {
            workflow.emit("findImageResponses", trainingSessions);
          } else {
            return res.status(200).json([]);
          }
        }
      );
    });

    workflow.on("findImageResponses", (trainingSessions) => {
      let imageResponses = trainingSessions.map((session) =>
        session.responses
          .filter((response) => response.actionType == 0)
          .map((imageRes) => imageRes.responses)
      );

      imageResponses = imageResponses.map(res => _.flatten(res));
      workflow.emit("processTrends", imageResponses);
    });

    workflow.on("processTrends", (imageResponses) => {
        const trends = [];
        imageResponses.forEach(res => {
           trends.push({
               meanResponseTime: _.meanBy(res, 'time'),
               accuracy: _.sumBy(res, (o) => o.isCorrect ? 1 : 0) * 100 / res.length
           }) 
        });

        console.log('Trends', trends);
        return res.status(200).json(trends);
    });

    workflow.emit("findTrainingSessionsForUser");
  },
};

module.exports = userService;
