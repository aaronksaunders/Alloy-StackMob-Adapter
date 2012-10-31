exports.definition = {

    config : {
        "columns" : {
            "active" : "boolean"
        },
        "defaults" : {},
        "adapter" : {
            "type" : "stackmob",
            "name" : "books"
        },
        "settings" : {
            STACKMOB_APP_NAME : 'people_interact',
            STACKMOB_USER_OBJECT_NAME : 'user',
            STACKMOB_MODEL_NAME : 'user',
        }
    },

    extendModel : function(Model) { debugger;
        _.extend(Model.prototype, {
            url : function() {
                return "http://stackmob.mob1.stackmob.com/api/0/" + this.config.settings.STACKMOB_APP_NAME + "/";
            },
            login : function(_opts) { debugger;

                var model = this;
                model.sync('login', model, {
                    success : function(data) { debugger;
                        Ti.API.info("login " + JSON.stringify(data));
                        _opts.success && _opts.success(new Model(data));
                    },
                    error : function(data) {
                        _opts.error && _opts.error(data);
                    }
                });

            }
        });
        // end extend

        return Model;
    },

    extendCollection : function(Collection) { debugger;
        _.extend(Collection.prototype, {
            url : function() {
                return "http://stackmob.mob1.stackmob.com/api/0/" + this.config.settings.STACKMOB_APP_NAME + "/";
            },
        });
        // end extend

        return Collection;
    }
}