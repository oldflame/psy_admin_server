let firebaseAdmin = require('firebase-admin'),
    mongoose = require('mongoose');
let stream = require('stream');
let fs = require('fs')

let imageService = {
    addImage: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            console.log("Req", req.body.intensity)
            if (!req.body.name || !req.body.name.trim()) {
                return res.status(400).json({
                    msg: "Name is required"
                });
            }

            if (!req.body.fileName || !req.body.fileName.trim()) {
                return res.status(400).json({
                    msg: "File Name is required"
                });
            }

            if (!req.body.fileType || !req.body.fileType.trim()) {
                return res.status(400).json({
                    msg: "File Type is required"
                });
            }

            if (!req.body.category || !req.body.category.toString().trim()) {
                return res.status(400).json({
                    msg: "Image Category is required"
                });
            }

            if (!req.body.intensity || !req.body.intensity) {
                return res.status(400).json({
                    msg: "Image Intensity is required"
                });
            }

            if (req.body.imageType == null) {
                return res.status(400).json({
                    msg: "Image type is required"
                });
            }

            if (!req.body.content) {
                return res.status(400).json({
                    msg: "Image content is required"
                });
            }
            workflow.emit('addMetaDataToDB');
        });

        workflow.on('addMetaDataToDB', () => {
            let imageMetaData = {
                name: req.body.name,
                description: req.body.description,
                tags: req.body.tags,
                category: req.body.category,
                intensity: req.body.intensity,
                imageType: req.body.imageType
            }
            req.app.db.models.Image.create(imageMetaData, (err, imageData) => {
                if (err) {
                    console.log("err", err)
                    return res.status(400).json({
                        msg: "Failed to add image. Try again!"
                    })
                }

                workflow.emit('uploadImageToBucket', imageData)
            })
        })

        workflow.on('uploadImageToBucket', imageData => {
            if (req.body.content.indexOf('base64') != -1) {
                req.body.content = req.body.content.split("base64,")[1]
            }


            let bufferStream = new stream.PassThrough();
            bufferStream.end(new Buffer.from(req.body.content, 'base64'));
            const defaultBucket = firebaseAdmin.storage().bucket('pysch-changiz.appspot.com');

            var tempDir = 'temp';

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            // Temporarily create image file on filesystem
            fs.writeFile(`temp/${req.body.category}_${imageData._id}_${req.body.fileName}`, req.body.content, 'base64', (err, res) => {
                if (err) {
                    console.log("fs err", err)
                }
            });

            defaultBucket.upload(`temp/${req.body.category}_${imageData._id}_${req.body.fileName}`, {
                destination: `images/${req.body.category}_${imageData._id}_${req.body.fileName}`,
                gzip: true,
                contentType: req.body.fileType,
                public: true,
                metadata: {
                    contentType: req.body.fileType,
                }
            }).then((files) => {
                console.log("File uploaded", files[0].metadata.mediaLink)
                workflow.emit('addImageURLToDB', {
                    imageData,
                    url: files[0].metadata.mediaLink
                });
            }).catch((err) => {
                console.log("File upload err", err)
                res.status(400).json({
                    msg: "Failed to add image"
                })
            })
        });

        workflow.on('addImageURLToDB', (imageObject) => {
            req.app.db.models.Image.findOneAndUpdate({
                _id: imageObject.imageData._id
            }, {
                $set: {
                    url: imageObject.url
                }
            }, {
                new: true
            }, (err, image) => {
                if (err) {
                    console.log("Update image url err", err);
                    return res.status(400).json({
                        msg: "Failed to add image. Try again!"
                    })
                }

                // Delete image temporarily stored on filesystem
                fs.rmdir(`temp/${req.body.category}_${imageObject.imageData._id}_${req.body.fileName}`, (err, res) => {
                    if (err) {
                        console.log("fs err", err)
                    }
                })
                return res.status(200).json(image)
            })
        });

        workflow.emit('validateData');
    },

    getAllImages: (req, res) => {
        req.app.db.models.Image.find({}, (err, images) => {
            if (err) {
                console.log('Get images err', err);
                res.status(400).json({
                    msg: "Failed to fetch images. Try again!"
                })
            }

            return res.status(200).json(images);
        }).skip(parseInt(req.params.skip)).limit(parseInt(req.params.limit)).populate('category')
    },
    getActiveImages: (req, res) => {
        req.app.db.models.Image.find({
            isDeleted: false
        }, (err, images) => {
            if (err) {
                console.log('Get images err', err);
                res.status(400).json({
                    msg: "Failed to fetch images. Try again!"
                })
            }

            return res.status(200).json(images);
        }).skip(parseInt(req.params.skip)).limit(parseInt(req.params.limit)).populate('category')
    },
    deleteImage: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.params.imageID || !req.params.imageID.toString().trim()) {
                return res.status(400).json({
                    msg: "Image ID is required"
                });
            }

            workflow.emit('deleteImage');
        });

        workflow.on('deleteImage', () => {
            req.app.db.models.Image.update({
                _id: req.params.imageID
            }, {
                $set: {
                    isDeleted: !(req.params.doRestore == "restore")
                }
            }).exec((err, deleted) => {
                if (err) {
                    console.log("Delete image err", err);
                    return res.status(400).json({
                        msg: "Failed to delete image. Try again!"
                    });
                }

                if (!deleted) {
                    console.log("Delete image err", err);
                    return res.status(400).json({
                        msg: "Failed to delete image. Try again!"
                    });
                }

                return res.status(200).json();
            })
        });

        workflow.emit('validateData');
    },

    sampleImagesByCategory: (req, res) => {
        console.log("params",[
            {
              '$match': {
                'category': mongoose.Types.ObjectId(req.params.categoryId), 
                'imageType': parseInt(req.params.type)
              }
            }, 
            {
              '$sample': {
                'size': parseInt(req.params.count)
              }
            }
          ])
        req.app.db.models.Image.aggregate([
            {
              '$match': {
                'category': mongoose.Types.ObjectId(req.params.categoryId),
                'imageType': parseInt(req.params.type)
              }
            }, 
            {
              '$sample': {
                'size': parseInt(req.params.count)
              }
            }
          ]).exec((err, images) => {
            if (err) {
                console.log("Error", err);
                return res.status(400).json({
                    msg: "Failed to fetch images"
                });
            }

            console.log("Images", images)
            if (images.length == 0) {
                return res.status(400).json({
                    msg: "No images found for this category"
                })
            }

            return res.status(200).json(images);
        })
    }
}
module.exports = imageService;