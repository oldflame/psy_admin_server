var authService = require("./services/auth");
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
          console.log('user: ',user) 
          if (user._id == undefined || user.email == undefined)
            res.status(403).send({ success: false, errors: ['authentication required'] });
          else {
            req.user = user;
            console.log("Next post authenticate", req.user)
            next();
          }
        })
        .catch(error => res.status(403).send({ success: false, errors: [error] }));
    } else
      res.status(403).send({ success: false, errors: ['authentication required'] });
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
  app.all('/api/admin/*', authenticate)
  app.put('/api/admin/approveAdmin/:newAdminID', authService.approveNewAdmin)
};
