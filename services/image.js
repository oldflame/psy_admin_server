var firebaseAdmin = require('firebase-admin');
var stream = require('stream');
var fs = require('fs')

var imageService = {
    addImage: (req, res) => {
        var workflow = req.app.utility.workflow(req, res);
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

            if (!req.body.imageType) {
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
            var imageMetaData = {
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
            let bufferStream = new stream.PassThrough();
            bufferStream.end(new Buffer.from(req.body.content, 'base64'));
            const defaultBucket = firebaseAdmin.storage().bucket('pysch-changiz.appspot.com');

            fs.writeFile(`temp/${req.body.category}_${imageData._id}_${req.body.fileName}`, req.body.content, 'base64', (err, res) => {
                if (err) {
                    console.log("fs err", err)
                }
            });

            defaultBucket.upload(`temp/${req.body.category}_${imageData._id}_${req.body.fileName}`, {
                destination: `images/${req.body.category}_${imageData._id}_${req.body.fileName}`,
                gzip: true,
                contentType: "image/jpg",
                public: true,
                metadata: {
                    contentType: "image/jpg"
                }
            }).then((files) => {
                console.log("File uploaded", files[0].metadata.mediaLink)
                workflow.emit('addImageURLToDB', {imageData, url: files[0].metadata.mediaLink});
            }).catch((err) => {
                console.log("File upload err", err)
                res.status(400).json({
                    msg: "Failed to add image"
                })
            })
        });

        workflow.on('addImageURLToDB', (imageObject) => {
            req.app.db.models.Image.findOneAndUpdate({_id: imageObject.imageData._id}, {$set: {url: imageObject.url}},{new: true}, (err, image) => {
                if (err) {
                    console.log("Update image url err", err);
                    return res.status(400).json({
                        msg: "Failed to add image. Try again!"
                    })
                }
                return res.status(200).json(image)
            })
        });

        workflow.emit('validateData');
    }
}
module.exports = imageService;