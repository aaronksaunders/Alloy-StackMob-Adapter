//
// attempt to login user, if it fails then create the user
//
var user = Alloy.createModel('User', {
    'username' : "aaron-alloy-sample-2",
    'password' : "password",
});
user.login({
    success : function(model, resp) {
        Ti.API.info(' user.login ' + JSON.stringify(model.toJSON()));
        getAllUsers();

    },
    error : function(errorStr) {
        Ti.API.info(' user.login ' + errorStr);
        // save the user...
        saveUser(user);
    }
})

/**
 * 
 */
function saveUser(_model) {
    _model.save({}, {
        success : function(model, resp) {
            Ti.API.info(' user.login ' + JSON.stringify(model.toJSON()));
        },
        error : function(model, resp) {
            Ti.API.info(' user.login ' + JSON.stringify(model.toJSON()));
            // save the user...
        }
    })
}



/**
 *
 */
function getAllUsers() {
    // get all the users
    var users = Alloy.createCollection('User');
    users.fetch({
        success : function(model, resp) {
            Ti.API.info(' user.login ' + JSON.stringify(model, null, 2));

        },
        error : function(model, resp) {
            Ti.API.info(' user.login ' + model);
        }
    });
}

$.index.open();
