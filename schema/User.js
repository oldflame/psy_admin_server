"use strict";

exports = module.exports = (app, mongoose) => {
    let UserSchema = new mongoose.Schema({
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Authentication'
        },
        mobile: {
            type: String,
            required: true,
        },
        birthdate: {
            type: Date,
            required: true
        },
        ethnicity: {
            type: string
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    UserSchema.index({
        email: 1,
        phone: 1
    }, {
        unique: true
    });
    app.db.model("User", UserSchema);
};