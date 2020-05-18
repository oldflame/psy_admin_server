let imageCategory = {
    addNewCategory: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.body.name || !req.body.name.trim()) {
                return res.status(400).json({
                    msg: "Name is required"
                });
            }

            workflow.emit('checkNameAvailable');
        });

        workflow.on('checkNameAvailable', () => {
            req.app.db.models.ImageCategory.findOne({
                name: req.body.name
            }).exec((err, imageCategory) => {
                if (err) {
                    console.log("Img category check name err", err);
                    return res.status(400).json({
                        msg: "Failed to add image category. Try again!"
                    })
                }

                if (imageCategory) {
                    return res.status(400).json({
                        msg: `Image category: ${req.body.name} already exists. Try again with a different name!`
                    })
                }

                workflow.emit('writeImageCategoryToDB');
            })
        })

        workflow.on('writeImageCategoryToDB', () => {
            const imageCategory = {
                name: req.body.name,
                description: req.body.description || ""
            }

            req.app.db.models.ImageCategory.create(imageCategory, (err, imgCategory) => {
                if (err) {
                    console.log("Img category add to db err", err);
                    return res.status(400).json({
                        msg: "Failed to add image category. Try again!"
                    })
                }

                return res.status(200).json(imgCategory);
            })
        })

        workflow.emit('validateData');
    },

    getAllImageCategories: (req, res) => {
        req.app.db.models.ImageCategory.find({}, (err, imgCategories) => {
            if (err) {
                console.log("Get all image categories err", err);
                return res.status(400).json({
                    msg: "Failed to fetch image categories. Try again!"
                })
            }

            return res.status(200).json(imgCategories);
        })
    },

    getActiveImageCategories: (req, res) => {
        req.app.db.models.ImageCategory.find({isDeleted: false}, (err, imgCategories) => {
            if (err) {
                console.log("Get all image categories err", err);
                return res.status(400).json({
                    msg: "Failed to fetch image categories. Try again!"
                })
            }

            return res.status(200).json(imgCategories);
        })
    },

    deleteImageCategory: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.params.imageCategoryID || !req.params.imageCategoryID.toString().trim()) {
                return res.status(400).json({
                    msg: "Image Category ID is required"
                });
            }

            workflow.emit('deleteImage Category');
        });

        workflow.on('deleteImage Category', () => {
            req.app.db.models.ImageCategory.update({
                _id: req.params.imageCategoryID
            }, {
                $set: {
                    isDeleted: !(req.params.doRestore == "restore")
                }
            }).exec((err, deleted) => {
                if (err) {
                    console.log("Delete imageCategory err", err);
                    return res.status(400).json({
                        msg: "Failed to delete imageCategory. Try again!"
                    });
                }

                if (!deleted) {
                    console.log("Delete imageCategory err", err);
                    return res.status(400).json({
                        msg: "Failed to delete image category. Try again!"
                    });
                }

                return res.status(200).json();
            })
        });

        workflow.emit('validateData');        
    }
}

module.exports = imageCategory;