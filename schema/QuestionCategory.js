"use strict";

exports = module.exports = function (app, mongoose) {
    var QuestionCategorySchema = new mongoose.Schema({
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
        responseType : {
            type: String,
            required: true,
            trim: true
        },
        startLabel: {
            type: String
        },
        endLabel: {
            type: String
        }

    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("QuestionCategory", QuestionCategorySchema);
};