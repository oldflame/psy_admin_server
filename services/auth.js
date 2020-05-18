const saltRounds = 10;
let bcrypt = require("bcrypt");
let _ = require("lodash");
let jose = require('node-jose');
let config = require('../config');

const createAuthenticationToken = (data) => {
    return new Promise((resolve, reject) => {
      jose.JWE.createEncrypt({
          format: 'compact'
        }, config.JWEKeySet.keys[0])
        .update(JSON.stringify(data))
        .final()
        .then(encyptedKey => {
          resolve(encyptedKey);
        })
        .catch(error => {
          console.log('Error', error);
          reject(error);
        });
    });
  }

    let generateAuthToken = (user) => {
      return new Promise((resolve, reject) => {
        createAuthenticationToken(user)
          .then(authorizationToken => {
            resolve({
              user: user,
              token: authorizationToken
            });
          })
          .catch(error => {
            console.log('Error :-', error);
            reject(error);
          });
      });

    };

    const validateEmail = (email) => {
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    const validatePhone = (mobile) => {
      let re = /^\d{10}$/;
      return re.test(mobile);
    }

    let authService = {
      login: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
        workflow.on('validateData', () => {
          if (!req.body.email || !req.body.email.trim()) {
            return res.status(401).json({
              msg: "Email is required"
            });
          }

          if (!validateEmail(req.body.email)) {
            return res.status(401).json({
              msg: "Email or password is invalid or your account has been deactivated."
            });
          }

          if (!req.body.password) {
            return res.status(401).json({
              msg: "Password is required"
            });
          }

          if (req.body.password.length < 8) {
            return res.status(401).json({
              msg: "Email or password is invalid or your account has been deactivated."
            });
          }

          workflow.emit('findAdmin')
        });

        workflow.on('findAdmin', () => {
          req.app.db.models.Admin.findOne({
            email: req.body.email,
            isActive: true
          }).populate('password', 'passwordHash').exec((err, user) => {
            if (err) {
              console.log("Find user err: ", err);
              return res.status(401).json({
                msg: "Login Failed. Email or password is invalid or your account has been deactivated."
              })
            }

            if (!user) {
              console.log("Find user: ", user);
              return res.status(401).json({
                msg: "Login Failed. Email or password is invalid or your account has been deactivated."
              })
            }

            if (!user.isActive) {
              console.log("Find user: ", user);
              return res.status(401).json({
                msg: "Login Failed. Email or password is invalid or your account has been deactivated."
              })
            }

            if (!user.isVerified) {
              console.log("Find user: ", user);
              return res.status(401).json({
                msg: "Login Failed. Your account is pending Admin verification."
              })
            }

            workflow.emit('checkAdminPassword', user);
          })
        })

        workflow.on('checkAdminPassword', (user) => {
          bcrypt.compare(req.body.password, user.password.passwordHash, (err, result) => {
            if (err) {
              console.log("In bcrtpt error", err);
              return res.status(401).json({
                msg: "Login Failed. Email or password is invalid or your account has been deactivated."
              });
            }
            console.log("In bcrypt result", JSON.stringify(user));
            if (result) {
              const formattedUser = JSON.parse(JSON.stringify(user));
              delete formattedUser.password;
              console.log("Post delete pass", formattedUser)
              generateAuthToken(formattedUser).then((userData) => {
                return res.status(200).json(userData);
              });
            } else {
              return res.status(401).json({
                msg: "Login Failed. Email or password is invalid or your account has been deactivated."
              });
            }
          });
        })
        workflow.emit('validateData');
      },

      register: (req, res) => {
        let workflow = req.app.utility.workflow(req, res);
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

          if (!req.body.firstName || !req.body.firstName.trim()) {
            return res.status(400).json({
              msg: "Firstname is required"
            });
          }

          if (!req.body.lastName || !req.body.lastName.trim()) {
            return res.status(400).json({
              msg: "Lastname is required"
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

          if (!req.body.gender || !req.body.gender.trim()) {
            return res.status(400).json({
              msg: "Gender is required"
            });
          }

          if (req.body.gender != 'M' && req.body.gender != 'F' && req.body.gender != 'O') {
            return res.status(400).json({
              msg: `Gender invalid. Expected one of M, F or O saw ${req.body.gender}`
            });
          }

          if (!req.body.password) {
            return res.status(400).json({
              msg: "Password is required"
            });
          }

          if (req.body.password.length < 8) {
            return res.status(400).json({
              msg: "Password must be atleast 8 characters"
            });
          }

          workflow.emit('checkEmailAvailable')
        });

        workflow.on('checkEmailAvailable', () => {
          console.log("checkEmailAvailable")
          req.app.db.models.Admin.findOne({
            email: req.body.email
          }).exec((err, user) => {
            if (err) {
              console.log("Check email err", err);
              return res.status(400).json({
                msg: 'Failed to create admin. Try again'
              })
            }

            if (user) {
              return res.status(400).json({
                msg: 'Email already registered. Try logging in with this email and password from the login page.'
              })
            }

            workflow.emit('checkMobileAvailable')
          })
        });

        workflow.on('checkMobileAvailable', () => {
          console.log("checkMobileAvailable")

          req.app.db.models.Admin.findOne({
            mobile: req.body.mobile
          }).exec((err, user) => {
            if (err) {
              console.log("Check mobile err", err);
              return res.status(400).json({
                msg: 'Failed to create admin. Try again'
              })
            }

            if (user) {
              return res.status(400).json({
                msg: 'Mobile already registered. Use a different phone number to register.'
              })
            }
            workflow.emit('createAdminObject');
          })
        })

        workflow.on("createAdminObject", () => {
          console.log('createAdminObject');
          let admin = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile,
            gender: req.body.gender,
          };

          bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            if (err) {
              console.log("Password hashing failed", err);
              return res.status(400).json({
                msg: 'Failed to create user. Try again'
              });
            }
            console.log('hash', hash)
            workflow.emit("writeAdminToDB", {
              admin,
              hash
            });
          });
        });

        workflow.on('writeAdminToDB', (adminData) => {
          console.log('writeAdminToDB')
          req.app.db.models.Admin.create(adminData.admin, (err, admin) => {
            if (err) {
              console.log("Create Admin err", err);
              return res.status(400).json({
                msg: 'Failed to create admin. Try again'
              })
            }
            workflow.emit('saveAdminPassword', {
              admin,
              passwordHash: adminData.hash
            });
          })
        });

        workflow.on("saveAdminPassword", (userObject) => {
          console.log('saveAdminPassword')
          const authData = {
            userId: userObject.admin._id,
            passwordHash: userObject.passwordHash
          }

          req.app.db.models.Authentication.create(authData, (err, authObject) => {
            if (err) {
              console.log(err);
              return res.status(400).json({
                msg: 'Failed to create admin. Try again'
              });
            }
            workflow.emit('setPassworIDToAdmin', {
              admin: userObject.admin,
              authObject
            })
          });
        });

        workflow.on('setPassworIDToAdmin', (userData) => {
          req.app.db.models.Admin.updateOne({
            _id: userData.admin._id
          }, {
            $set: {
              password: userData.authObject._id
            }
          }).exec((err) => {
            if (err) {
              console.log("Link password err", err)
              return res.status(400).json({
                msg: "Failed to create admin. Try again!"
              })
            }
            return res.status(200).json()
          })
        })
        workflow.emit("validateData");
      }
    };
    module.exports = authService;