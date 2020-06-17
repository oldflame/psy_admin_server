'use strict';

exports = module.exports = (app, mongoose) => {
    require('./schema/Admin')(app, mongoose);
    require('./schema/User')(app, mongoose);
    require('./schema/Authentication')(app, mongoose);
    require('./schema/Location')(app, mongoose);
    require('./schema/TargetGroup')(app, mongoose);
    require('./schema/Image')(app, mongoose);
    require('./schema/ImageCategory')(app, mongoose);
    require('./schema/Question')(app,mongoose);
    require('./schema/QuestionCategory')(app,mongoose);
    require('./schema/Trainings')(app,mongoose);
    require('./schema/TrainingSession')(app,mongoose);
};
