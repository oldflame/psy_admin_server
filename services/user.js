var userService = {
    checkOngoingTraining: (req, res) => {
        req.app.db.models.User.findOne({
                _id: req.user._id
            },
            'ongoingSession', (err, session) => {
                if (err) {
                    console.log('err', err);
                    return res.status(400).json({
                        msg: "Failed to fetch ongoing session. Try again!"
                    })
                }

                return res.status(200).json(session)
            }).populate('ongoingSession')
    }
}

module.exports = userService;