"use strict";

exports = module.exports = function (app, mongoose) {
    var ImageSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        tags: [String],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'ImageCategory'
        },
        intensity: {
            type: Number,
            required: true
        },
        imageType: {
            type: Number,
            required: true
        },
        url: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false
        }

    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("Image", ImageSchema);
};