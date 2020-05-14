var authService = require("./services/auth");
var adminService = require("./services/admin");
var locationService = require("./services/location");
var targetGroupService = require("./services/targetGroups");
var imageCategoryService = require("./services/imageCategory");
var imageService = require("./services/image");
var questionService = require("./services/question");
var questionCategoryService = require("./services/questionCategory");
var jose = require('node-jose');
var config = require('./config');

function verifyAuthorizationToken(token) {
  console.log('inside middlewares/authentication/verifyauthtoken', config.JWEKeySet.keys[0], token)
  return new Promise((resolve, reject) => {
    try {
      jose.JWK.asKeyStore(config.JWEKeySet)
        .then(result => {
          jose.JWE.createDecrypt(result)
            .decrypt(token)
            .then(decodedToken => {
              console.log('Decoded', decodedToken);
              resolve(JSON.parse(decodedToken.plaintext.toString()));
            })
            .catch((err) => {
              console.log('Decoded err', err);
              reject('Invalid Authorization Bearer! Try Logging-in again!');
            });
        });
    } catch (error) {
      console.log("Some other error", error)
      reject(error);
    }
  });
}

const authenticate = (req, res, next) => {
  if (req.method == 'OPTIONS')
    res.status(200).send();
  else if (req.headers && req.headers.authorization) {
    const currentTime = Date.now() / 1000 | 0;
    console.log(currentTime)
    const authorizationToken = req.headers.authorization.replace('Bearer ', '');
    verifyAuthorizationToken(authorizationToken)
      .then(user => {
        console.log('user: ', user)
        if (user._id == undefined || user.email == undefined)
          res.status(403).send({
            success: false,
            errors: ['authentication required']
          });
        else {
          req.user = user;
          console.log("Next post authenticate", req.user)
          next();
        }
      })
      .catch(error => res.status(403).send({
        success: false,
        errors: [error]
      }));
  } else
    res.status(403).send({
      success: false,
      errors: ['authentication required']
    });
}

exports = module.exports = (app) => {
  app.options("/*", (req, res) => {
    return res.status(200).json();
  });

  app.get('/', (req, res) => {
    res.status(200).json('Server Running')
  })

  // Unverified Requests
  app.post('/api/register', authService.register);
  app.post('/api/login', authService.login);

  // Authorized Requests
  app.all('/api/account/*', authenticate);

  // Admin Routes
  app.get('/api/account/admin', adminService.getAllAdmins);
  app.put('/api/account/admin/approveAdmin/:newAdminID', adminService.approveNewAdmin);

  // Locations Routes
  app.get('/api/account/location', locationService.getActiveLocations);
  app.get('/api/account/location/all', locationService.getAllLocations);
  app.post('/api/account/location', locationService.addLocation);
  app.delete('/api/account/location/:locationID', locationService.deleteLocation);
  app.put('/api/account/location', locationService.updateLocation);

  // Target Group Routes
  app.get('/api/account/targetGroups', targetGroupService.getActiveTargetGroups);
  app.get('/api/account/targetGroups/all', targetGroupService.getAllTargetGroups);
  app.post('/api/account/targetGroups', targetGroupService.addTargetGroup);
  app.put('/api/account/targetGroups/assignTraining/:targetGroupID/:trainingID', targetGroupService.assignTraining);
  app.delete('/api/account/targetGroups/:targetGroupID', targetGroupService.deleteTargetGroup);

  // Image Category Routes
  app.get('/api/account/imgCategory', imageCategoryService.getActiveImageCategories);
  app.get('/api/account/imgCategory/all', imageCategoryService.getAllImageCategories);
  app.post('/api/account/imgCategory', imageCategoryService.addNewCategory);
  app.delete('/api/account/imgCategory/:imageCategoryID', imageCategoryService.deleteImageCategory);

  // Image management routes
  app.post('/api/account/images', imageService.addImage);
  app.get('/api/account/images/all/:skip/:limit', imageService.getAllImages);
  app.get('/api/account/images/:skip/:limit', imageService.getActiveImages);
  app.delete('/api/account/images/:imageID', imageService.deleteImage);

  // Question Routes 
  app.get('/api/account/questions', questionService.getAllQuestions);
  app.get('/api/account/questions/:questioncategory', questionService.getQuestionsForCategory);
  app.post('/api/account/addQuestion', questionService.addNewQuestion);
  app.delete('/app/account/deleteQuestion', questionService.deleteQuestion);


  // Question Category Routes 
  app.get('/api/account/questionsCategory', questionCategoryService.getAllQuestionCategories);
  app.post('/api/account/addQuestionsCategory', questionCategoryService.addQuestionCategory);
  app.delete('/api/account/deleteQuestionCategory/:questionCategoryId', questionCategoryService.deleteQuestionCategory);
};
