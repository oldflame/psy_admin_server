const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validatePhone = (mobile) => {
    var re = /^\d{10}$/;
    return re.test(mobile);
}

var locationService = {
    addLocation: (req, res) => {
        var workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.body.email || !req.body.email.trim()) {
                return res.status(400).json({
                    msg: "Email is required"
                });
            }

            if (!validateEmail(req.body.email)) {
                return res.status(400).json({
                    msg: "Email is invalid"
                });
            }

            if (!req.body.name || !req.body.name.trim()) {
                return res.status(400).json({
                    msg: "Name is required"
                });
            }

            if (!req.body.code || !req.body.code.toString().trim()) {
                return res.status(400).json({
                    msg: "Code is required"
                });
            }

            if (!req.body.mobile || !req.body.mobile.toString().trim()) {
                return res.status(400).json({
                    msg: "Mobile is required"
                });
            }

            if (!validatePhone(req.body.mobile)) {
                return res.status(400).json({
                    msg: "Mobile is invalid"
                });
            }

            if (!req.body.address || !req.body.address.toString().trim()) {
                return res.status(400).json({
                    msg: "Address is required"
                });
            }

            if (!req.body.city || !req.body.city.toString().trim()) {
                return res.status(400).json({
                    msg: "City is required"
                });
            }

            if (!req.body.state || !req.body.state.toString().trim()) {
                return res.status(400).json({
                    msg: "State is required"
                });
            }

            if (!req.body.pincode || !req.body.pincode.toString().trim()) {
                return res.status(400).json({
                    msg: "Pincode is required"
                });
            }

            // if (!req.body.marker || !req.body.marker.latitude || !req.body.marker.longitude) {
            //     return res.status(400).json({
            //         msg: "Marker is required"
            //     });
            // }

            workflow.emit('checkEmailAvailable');
        });

        workflow.on('checkEmailAvailable', () => {
            console.log("checkEmailAvailable")
            req.app.db.models.Location.findOne({
                email: req.body.email
            }).exec((err, user) => {
                if (err) {
                    console.log("Check email err", err);
                    return res.status(400).json({
                        msg: 'Failed to add location. Try again'
                    })
                }

                if (user) {
                    return res.status(400).json({
                        msg: 'Email already registered. Try adding a different email.'
                    })
                }

                workflow.emit('checkMobileAvailable')
            })
        });

        workflow.on('checkMobileAvailable', () => {
            console.log("checkMobileAvailable")

            req.app.db.models.Location.findOne({
                mobile: req.body.mobile
            }).exec((err, user) => {
                if (err) {
                    console.log("Check mobile err", err);
                    return res.status(400).json({
                        msg: 'Failed to add location. Try again'
                    })
                }

                if (user) {
                    return res.status(400).json({
                        msg: 'Mobile already registered. Use a different phone number for this location.'
                    })
                }
                workflow.emit('writeLocationToDB');
            })
        });

        workflow.on('writeLocationToDB', () => {
            const location = {
                name: req.body.name,
                code: req.body.code,
                description: req.body.description,
                tags: req.body.tags,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                email: req.body.email,
                mobile: req.body.mobile,
                marker: req.body.marker
            }

            req.app.db.models.Location.create(location, (err, location) => {
                if (err) {
                    console.log("Create location err", err);
                    return res.status(400).json({
                        msg: "Failed to add location. Try again!"
                    })
                }

                return res.status(200).json(location);
            })
        })

        workflow.emit('validateData');
    },

    getAllLocations: (req, res) => {
        req.app.db.models.Location.find({}).exec((err, locations) => {
            if (err) {
                console.log("Get all locations err", err);
                return res.status(400).json({
                    msg: "Failed to fetch locations. Try again!"
                })
            }

            return res.status(200).json(locations);
        })
    },

    getActiveLocations: (req, res) => {
        req.app.db.models.Location.find({
            isDeleted: false
        }).exec((err, locations) => {
            if (err) {
                console.log("Get all locations err", err);
                return res.status(400).json({
                    msg: "Failed to fetch locations. Try again!"
                })
            }

            return res.status(200).json(locations);
        })
    },

    updateLocation: (req, res) => {
        var workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.body._id || !req.body._id.trim()) {
                return res.status(400).json({
                    msg: "Location ID is required"
                });
            }

            if (!req.body.email || !req.body.email.trim()) {
                return res.status(400).json({
                    msg: "Email is required"
                });
            }

            if (!validateEmail(req.body.email)) {
                return res.status(400).json({
                    msg: "Email is invalid"
                });
            }

            if (!req.body.name || !req.body.name.trim()) {
                return res.status(400).json({
                    msg: "Name is required"
                });
            }

            if (!req.body.code || !req.body.code.toString().trim()) {
                return res.status(400).json({
                    msg: "Code is required"
                });
            }

            if (!req.body.mobile || !req.body.mobile.toString().trim()) {
                return res.status(400).json({
                    msg: "Mobile is required"
                });
            }

            if (!validatePhone(req.body.mobile)) {
                return res.status(400).json({
                    msg: "Mobile is invalid"
                });
            }

            if (!req.body.address || !req.body.address.toString().trim()) {
                return res.status(400).json({
                    msg: "Address is required"
                });
            }

            if (!req.body.city || !req.body.city.toString().trim()) {
                return res.status(400).json({
                    msg: "City is required"
                });
            }

            if (!req.body.state || !req.body.state.toString().trim()) {
                return res.status(400).json({
                    msg: "State is required"
                });
            }

            if (!req.body.pincode || !req.body.pincode.toString().trim()) {
                return res.status(400).json({
                    msg: "Pincode is required"
                });
            }

            if (!req.body.marker || !req.body.marker.latitude || !req.body.marker.longitude) {
                return res.status(400).json({
                    msg: "Marker is required"
                });
            }

            workflow.emit('checkEmailAvailable');
        });

        workflow.on('checkEmailAvailable', () => {
            console.log("checkEmailAvailable")
            req.app.db.models.Location.findOne({
                email: req.body.email,
                _id: {$ne: req.body._id}
            }).exec((err, user) => {
                if (err) {
                    console.log("Check email err", err);
                    return res.status(400).json({
                        msg: 'Failed to add location. Try again'
                    })
                }

                if (user) {
                    return res.status(400).json({
                        msg: 'Email already registered. Try adding a different email.'
                    })
                }

                workflow.emit('checkMobileAvailable')
            })
        });

        workflow.on('checkMobileAvailable', () => {
            console.log("checkMobileAvailable")

            req.app.db.models.Location.findOne({
                _id: {$ne: req.body._id},
                mobile: req.body.mobile
            }).exec((err, user) => {
                if (err) {
                    console.log("Check mobile err", err);
                    return res.status(400).json({
                        msg: 'Failed to add location. Try again'
                    })
                }

                if (user) {
                    return res.status(400).json({
                        msg: 'Mobile already registered. Use a different phone number for this location.'
                    })
                }
                workflow.emit('writeLocationToDB');
            })
        });

        workflow.on('writeLocationToDB', () => {
            const location = {
                name: req.body.name,
                code: req.body.code,
                description: req.body.description,
                tags: req.body.tags,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                email: req.body.email,
                mobile: req.body.mobile,
                marker: req.body.marker
            }

            req.app.db.models.Location.findOneAndUpdate({
                _id: req.body._id
            }, location, {new: true}).exec((err, location) => {
                if (err) {
                    console.log("Update location err", err);
                    return res.status(400).json({
                        msg: "Failed to update location. Try again!"
                    })
                }

                return res.status(200).json(location);
            })
        })

        workflow.emit('validateData');
    },

    deleteLocation: (req, res) => {
        var workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
            if (!req.params.locationID || !req.params.locationID.toString().trim()) {
                return res.status(400).json({
                    msg: "Location ID is required"
                });
            }

            workflow.emit('deleteLocation');
        });

        workflow.on('deleteLocation', () => {
            req.app.db.models.Location.update({
                _id: req.params.locationID
            }, {
                $set: {
                    isDeleted: true
                }
            }).exec((err, deleted) => {
                if (err) {
                    console.log("Delete location err", err);
                    return res.status(400).json({
                        msg: "Failed to delete location. Try again!"
                    });
                }

                if (!deleted) {
                    console.log("Delete location err", err);
                    return res.status(400).json({
                        msg: "Failed to delete location. Try again!"
                    });
                }

                return res.status(200).json();
            })
        });

        workflow.emit('validateData');
    }
}
module.exports = locationService;
