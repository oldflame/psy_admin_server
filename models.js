'use strict';

exports = module.exports = (app, mongoose) => {
    require('./schema/Admin')(app, mongoose);
    require('./schema/Authentication')(app, mongoose);
    require('./schema/Location')(app, mongoose);
    require('./schema/TargetGroup')(app, mongoose);
    require('./schema/Question')(app,mongoose);
    require('./schema/QuestionCategory')(app,mongoose);
};
