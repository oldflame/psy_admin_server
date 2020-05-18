"use strict";

exports = module.exports = function (app, mongoose) {
  let AdminSchema = new mongoose.Schema({
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
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    approvedAt: {
      type: Date,
    }
  }, {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  });

  AdminSchema.index({
    email: 1,
    phone: 1
  }, {
    unique: true
  });
  app.db.model("Admin", AdminSchema);
};