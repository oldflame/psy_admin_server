"use strict";

exports = module.exports = function (app, mongoose) {
    var TrainingSchema = new mongoose.Schema({
        trainingName: {
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
        
        questionData: [{
            question: {
                type: mongoose.Schema.Types.ObjectId,
                trim: true,
                ref: 'Question'
            },
            order: Number
        }],
        imageData: [{
            question: {
                type: mongoose.Schema.Types.ObjectId,
                trim: true,
                ref: 'Question'
            },
            order: Number
        }],
        scheduleFor: Date,

    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("Trainings", TrainingSchema);
};