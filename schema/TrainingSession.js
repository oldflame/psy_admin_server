"use strict";

exports = module.exports = function (app, mongoose) {
    var TrainingSessionSchema = new mongoose.Schema({
       userId: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        ref: 'User'
       },
       trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        ref: 'Trainings'
       },
       responses: [Object]
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("TrainingSessions", TrainingSessionSchema);
};