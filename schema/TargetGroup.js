"use strict";

exports = module.exports = function (app, mongoose) {
    var TargetGroupSchema = new mongoose.Schema({
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
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        trainings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Training'
        }]
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("TargetGroup", TargetGroupSchema);
};