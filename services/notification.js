let notification = {
  addTokenToDB: (req, res) => {
    req.app.db.models.Notifications.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $set: {
          token: req.params.token,
        },
      },
      { upsert: true }    
    ).exec((err, updated) => {
      if (err) {
        console.log("Token Update error", err);
        return res.status(400).json({
          msg: "Failed to update token for user. Try again!",
        });
      }
      return res.status(200).json();
    });
  },
};
module.exports = notification;
