var trainingSessionService = {
    startSession: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        let training, session;
        workflow.on('getTraining', () => {
            req.app.db.models.Trainings.findOne({}).populate({
                path: 'questionData.category'
            }).populate({
                path: 'imageData.category'
            }).exec((err, trainingData) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        msg: "Failed to get training. Try again!",
                    });
                }

                training = trainingData;
                workflow.emit('createSession');
            })
        })

        workflow.on('createSession', () => {
            req.app.db.models.TrainingSessions.create({
                trainingId: training._id,
                userId: req.user._id
            }, (err, trainingSession) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        msg: "Failed to start session. Try again!"
                    })
                }

                session = trainingSession;
                workflow.emit('setOngoingSessionToUser');
            })
        })

        workflow.on('setOngoingSessionToUser', () => {
            req.app.db.models.User.findOneAndUpdate({
                _id: req.user._id
            }, {
                $set: {
                    ongoingSession: session._id
                }
            }, {
                new: true
            }, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        msg: "Failed to start session. Try again!"
                    })
                }

                return res.status(200).json({
                    training,
                    session
                });
            })
        })

        workflow.emit('getTraining');
    },

    updateSessionResponse: (req, res) => {
        req.app.db.models.TrainingSessions.findOneAndUpdate({
            _id: req.params.sessionId
        }, {
            $set: {
                responses: req.body.responses
            }
        }, {
            new: true
        }, (err, trainingSession) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    msg: "Failed to update response. Try again!"
                })
            }

            return res.status(200).json(trainingSession);
        })
    },

    endSession: (req, res) => {
        req.app.db.models.User.findOneAndUpdate({
            _id: req.user._id
        }, {
            $set: {
                ongoingSession: null
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    msg: "Failed to end session. Try again!"
                })
            }

            return res.status(200).json({});
        })
    },

    findById: (req, res) => {
        req.app.db.models.TrainingSessions.findOne({
            _id: req.params.sessionId
        }, (err, session) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    msg: "Failed to get training session. Try again!",
                });
            }

            res.status(200).json(session);
        })
    }

}

module.exports = trainingSessionService;