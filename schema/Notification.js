"use strict";

exports = module.exports = function (app, mongoose) {

    var Notifications = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            trim: true,
        },
        token: {
            type: String,
            trim: true,
            default: ""
        },
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    app.db.model("Notifications", Notifications);
};