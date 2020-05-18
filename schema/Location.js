"use strict";

exports = module.exports = function (app, mongoose) {
    let LocationSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
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
        address: {
            type: String,
            required: true,
        },
        city: String,
        state: String,
        pincode: String,
        mobile: String,
        email: {
            type: String,
            required: true,
            trim: true
        },
        marker: {
            type: {
                latitude: Number,
                longitude: Number
            },
            required: false
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

    app.db.model("Location", LocationSchema);
};
