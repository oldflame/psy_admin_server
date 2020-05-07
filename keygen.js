var jose = require('node-jose');
const keystore = jose.JWK.createKeyStore();
const config = require('./config');
var props = {
    alg: 'A256GCM',
    use: 'enc'
};
const keygen = {
    generate: () =>
        keystore.generate("oct", 256, props)
        .then((result) => 
        // {result} is a jose.JWK.Key
        config.JWEKeySet = {
            keys: [result.toJSON(true)]
        },
    )
}

module.exports = keygen;