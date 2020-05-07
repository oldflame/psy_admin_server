var adminService = {
  approveNewAdmin: (req, res) => {
    console.log("Approving admin", req.params)
    var workflow = req.app.utility.workflow(req, res);
    workflow.on('validateData', () => {
      if (!req.params.newAdminID) {
        return res.status(400).json({
          msg: "New Admin ID is required"
        });
      }

      workflow.emit('verifyAdmin');
    });

    workflow.on('verifyAdmin', () => {
      req.app.db.models.Admin.updateOne({
        _id: req.params.newAdminID
      }, {
        $set: {
          isVerified: true,
          approvedBy: req.user._id,
          approvedAt: Date.now()
        }
      }).exec((err, updated) => {
        if (err) {
          console.log("Verify Admin err", err);
          return res.status(400).json({
            msg: "Admin Verification failed. Try again!"
          });
        }

        if (!updated) {
          return res.status(400).json({
            msg: "Admin Verification failed. Try again!"
          });
        }

        workflow.emit('response');
      })
    });

    workflow.emit('validateData')
  }
}
module.exports = adminService;