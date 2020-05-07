'use strict';

exports = module.exports = (app, mongoose) => {
    require('./schema/Admin')(app, mongoose);
    require('./schema/Authentication')(app, mongoose);
};
