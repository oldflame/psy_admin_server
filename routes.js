let authService = require("./services/auth");
let adminService = require("./services/admin");
let locationService = require("./services/location");
let targetGroupService = require("./services/targetGroups");
let imageCategoryService = require("./services/imageCategory");
let imageService = require("./services/image");
let questionService = require("./services/question");
let questionCategoryService = require("./services/questionCategory");
let overviewService = require("./services/overview");
var trainingService = require("./services/training");
let jose = require('node-jose');
let config = require('./config');

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

  // Overview Routes
  app.get('/api/account/overview/counts', overviewService.getEntityCounts)

  // Admin Routes
  app.get('/api/account/admin', adminService.getAllAdmins);
  app.put('/api/account/admin/approveAdmin/:newAdminID', adminService.approveNewAdmin);

  // Locations Routes
  app.get('/api/account/location', locationService.getActiveLocations);
  app.get('/api/account/location/all', locationService.getAllLocations);
  app.post('/api/account/location', locationService.addLocation);
  app.delete('/api/account/deleteLocation/:locationID/:doRestore', locationService.deleteLocation);
  app.put('/api/account/location', locationService.updateLocation);

  // Target Group Routes
  app.get('/api/account/targetGroups', targetGroupService.getActiveTargetGroups);
  app.get('/api/account/targetGroups/all', targetGroupService.getAllTargetGroups);
  app.post('/api/account/addTargetGroups', targetGroupService.addTargetGroup);
  app.put('/api/account/targetGroups/assignTraining/:targetGroupID/:trainingID', targetGroupService.assignTraining);
  app.delete('/api/account/deleteTargetGroups/:targetGroupID/:doRestore', targetGroupService.deleteTargetGroup);

  // Image Category Routes
  app.get('/api/account/imgCategory', imageCategoryService.getActiveImageCategories);
  app.get('/api/account/imgCategory/all', imageCategoryService.getAllImageCategories);
  app.post('/api/account/imgCategory', imageCategoryService.addNewCategory);
  app.delete('/api/account/imgCategory/:imageCategoryID/:doRestore', imageCategoryService.deleteImageCategory);

  // Image management routes
  app.post('/api/account/images', imageService.addImage);
  app.get('/api/account/images/all/:skip/:limit', imageService.getAllImages);
  app.get('/api/account/images/:skip/:limit', imageService.getActiveImages);
  app.delete('/api/account/images/:imageID/:doRestore', imageService.deleteImage);

  // Question Routes 
  app.get('/api/account/questions', questionService.getAllQuestions);
  app.get('/api/account/questions/:questioncategory', questionService.getQuestionsForCategory);
  app.post('/api/account/addQuestion', questionService.addNewQuestion);
  app.delete('/app/account/deleteQuestion/:questionId/:doRestore', questionService.deleteQuestion);


  // Question Category Routes 
  app.get('/api/account/questionsCategory', questionCategoryService.getAllQuestionCategories);
  app.post('/api/account/addQuestionsCategory', questionCategoryService.addQuestionCategory);
  app.delete('/api/account/deleteQuestionCategory/:questionCategoryId/:doRestore', questionCategoryService.deleteQuestionCategory);


  // Training Routes 
  app.get('/api/account/trainings/getAllTrainings', trainingService.getAllTrainings);
  app.get('/api/account/trainings/:trainingId', trainingService.findById);
  app.post('/api/account/trainings/addTraining', trainingService.addNewTraining);
  app.delete('/api/account/trainings/:trainingId/:doRestore', trainingService.deleteTraining);
  app.put("/api/account/trainings/:trainingId/assignQuestions", trainingService.addQuestionsToTraining);
  app.delete("/api/account/trainings/:trainingId/removeQuestions/:questionDataId", trainingService.removeQuestionsFromTraining);
  app.put("/api/account/trainings/:trainingId/assignImages", trainingService.addImagesToTraining);
  app.delete("/api/account/trainings/:trainingId/removeImages/:imageDataId", trainingService.removeImagesFromTraining);
};
