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
    },

    getUsersList: (req, res) => {
        return req.app.db.models.User.find({}, '_id birthdate createdAt isActive', (err, users) => {
            if (err) {
                console.log("Find users err", err);
                return res.status(400).json({
                    msg: "Failed to fetch users. Try Again!"
                })
            }
            return res.status(200).json(users);
        })
    }
}

module.exports = userService;