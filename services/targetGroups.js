let targetGroupsService = {
    addTargetGroup: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.body.name || !req.body.name.trim()) {
                return res.status(400).json({
                    msg: "Name is required"
                });
            }

            if (!req.body.location || !req.body.location.trim()) {
                return res.status(400).json({
                    msg: "Location ID is required"
                });
            }

            workflow.emit('writeTargetGroupToDB');
        });

        workflow.on('writeTargetGroupToDB', () => {
            const targetGroup = {
                name: req.body.name,
                description: req.body.description,
                tags: req.body.tags,
                location: req.body.location,
                trainings: req.body.trainings ? [req.body.trainings] : [],
            }
            req.app.db.models.TargetGroup.create(targetGroup, (err, targetGroup) => {
                if (err) {
                    console.log("Create target group err", err);
                    return res.status(400).json({
                        msg: "Failed to add target group. Try again!"
                    })
                }

                return res.status(200).json(targetGroup);
            })
        })

        workflow.emit('validateData')
    },

    getAllTargetGroups: (req, res) => {
        req.app.db.models.TargetGroup.find({}).exec((err, targetGroups) => {
            if (err) {
                console.log("Get target groups err", err);
                return res.status(400).json({
                    msg: "Failed to fetch target groups. Try again!"
                });
            }

            return res.status(200).json(targetGroups);
        })
    },


    getActiveTargetGroups: (req, res) => {
        req.app.db.models.TargetGroup.find({isDeleted: false}).exec((err, targetGroups) => {
            if (err) {
                console.log("Get target groups err", err);
                return res.status(400).json({
                    msg: "Failed to fetch target groups. Try again!"
                });
            }

            return res.status(200).json(targetGroups);
        })
    },

    deleteTargetGroup: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.params.targetGroupID || !req.params.targetGroupID.toString().trim()) {
                return res.status(400).json({
                    msg: "Target Group ID is required"
                });
            }

            workflow.emit('deleteTargetGroup');
        });

        workflow.on('deleteTargetGroup', () => {
            req.app.db.models.TargetGroup.update({
                _id: req.params.targetGroupID
            }, {
                $set: {
                    isDeleted: !(req.params.doRestore == "restore")
                }
            }).exec((err, deleted) => {
                if (err) {
                    console.log("Delete target group err", err);
                    return res.status(400).json({
                        msg: "Failed to delete target group. Try again!"
                    });
                }

                if (!deleted) {
                    console.log("Delete target group err", err);
                    return res.status(400).json({
                        msg: "Failed to delete target group. Try again!"
                    });
                }

                return res.status(200).json();
            })
        });

        workflow.emit('validateData');
    },

    assignTraining: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.params.targetGroupID || !req.body.targetGroupID.trim()) {
                return res.status(400).json({
                    msg: "Target Group ID is required"
                });
            }

            // if (!req.body.trainingID || !req.body.trainingID.trim()) {
            //     return res.status(400).json({
            //         msg: "training ID is required"
            //     });
            // }

            workflow.emit('addTrainingToTargetGroup');
        });

        workflow.on('addTrainingToTargetGroup', () => {
            req.app.db.models.TargetGroup.findOneAndUpdate({_id: req.params.targetGroupID}, {$push: {trainings: req.params.trainingID}}, {new: true}).exec((err, targetGroup) => {
                if (err) {
                    console.log("Assign training to target group err", err);
                    return res.status(400).json({
                        msg: "Failed to assign training to target group. Try again!"
                    })
                }

                return res.status(200).json(targetGroup);
            })
        })

        workflow.emit('validateData');
    }
}
module.exports = targetGroupsService;
