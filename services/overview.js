let overviewServices = {
    getEntityCounts: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        let adminCount, imageCategoriesCount, imagesCount, locationsCount, questionCategoriesCount, questionsCount, targetGroupsCount, trainingsCount;
        workflow.on('getAdminCount', () => {
            req.app.db.models.Admin.countDocuments({isActive: true}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                adminCount = count;
                workflow.emit('getImageCategoriesCount');
            })
        })

        workflow.on('getImageCategoriesCount', () => {
            req.app.db.models.ImageCategory.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                imageCategoriesCount = count;
                workflow.emit('getImagesCount');
            })
        })

        workflow.on('getImagesCount', () => {
            req.app.db.models.Image.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                imagesCount = count;
                workflow.emit('getLocationsCount');
            })
        })

        workflow.on('getLocationsCount', () => {
            req.app.db.models.Location.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                locationsCount = count;
                workflow.emit('getQuestionCategoriesCount');
            })
        })

        workflow.on('getQuestionCategoriesCount', () => {
            req.app.db.models.QuestionCategory.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                questionCategoriesCount = count;
                workflow.emit('getQuestionsCount');
            })
        })

        workflow.on('getQuestionsCount', () => {
            req.app.db.models.Questions.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                questionsCount = count;
                workflow.emit('getTargetGroupsCount');
            })
        })

        workflow.on('getTargetGroupsCount', () => {
            req.app.db.models.TargetGroup.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                targetGroupsCount = count;
                workflow.emit('getTrainingsCount');
            })
        })

        workflow.on('getTrainingsCount', () => {
            req.app.db.models.Trainings.countDocuments({isDeleted: false}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        msg: "Failed to fetch overview data!"
                    });
                }

                trainingsCount = count;
                workflow.emit('sendResponse');
            })
        })

        workflow.on('sendResponse', () => {
            const counts = {
                admins: adminCount,
                imageCategories: imageCategoriesCount,
                images: imagesCount,
                locations: locationsCount,
                questionCategories: questionCategoriesCount,
                questions: questionsCount,
                targetGroups: targetGroupsCount,
                trainings: trainingsCount || 0
            }

            res.status(200).json(counts);
        })

        workflow.emit('getAdminCount');
    }
}
module.exports = overviewServices;