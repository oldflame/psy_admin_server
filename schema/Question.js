"use strict";

exports = module.exports = function (app, mongoose) {
    let QuestionSchema = new mongoose.Schema({
        questionName: {
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
        questionCategory : {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: 'QuestionCategory'
        },

    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("Questions", QuestionSchema);
};