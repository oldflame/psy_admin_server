"use strict";

exports = module.exports = function (app, mongoose) {
    var TrainingSchema = new mongoose.Schema({
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
        isDeleted: {
            type: Boolean,
            default: false
        },
        keywords : {
            type: [String],
            required: true,
            trim: true,
        },
        
        questionData: {
            category: {
                type: mongoose.Schema.Types.ObjectId,
                trim: true,
                ref: 'QuestionCategory'
            },
            order: Number
        },
        imageData: {
            category: {
                type: mongoose.Schema.Types.ObjectId,
                trim: true,
                ref: 'ImageCategory'
            },
            count: Number,
            duration: Number,
            imageType: Number
        },
        scheduleFor: Date,

    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("Trainings", TrainingSchema);
};