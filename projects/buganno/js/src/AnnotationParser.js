/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.AnnotationParser')

//@Require('Class')
//@Require('Obj')
//@Require('buganno.BugAnnotation')
//@Require('buganno.AnnotationRegistry')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Obj                 = bugpack.require('Obj');
    var BugAnnotation       = bugpack.require('buganno.BugAnnotation');
    var AnnotationRegistry  = bugpack.require('buganno.AnnotationRegistry');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var AnnotationParser = Class.extend(Obj, {

        _name: "buganno.AnnotationParser",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Path} filePath
         */
        _constructor: function(filePath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Path}
             */
            this.filePath = filePath;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @return {Path}
         */
        getFilePath: function() {
            return this.filePath;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Error, AnnotationRegistry=)} callback
         */
        parse: function(callback) {
            var _this = this;
            this.filePath.readFile('utf8', function(error, data) {
                if (!error) {
                    try {
                        var annotationRegistry = new AnnotationRegistry(_this.filePath);
                        var lines = data.split('\n');
                        lines.forEach(function(line) {
                            var results = line.match(/\s*\/\/\s*@([a-zA-Z][0-9a-zA-Z]*)(?:\((.+)?\))?\s*/);
                            if (results) {
                                var type = results[1];
                                var argumentsString = results[2];
                                var arguments = _this.parseArguments(argumentsString);
                                var annotation = new BugAnnotation(type, arguments);
                                annotationRegistry.addAnnotation(annotation);
                            }
                        });
                        callback(error, annotationRegistry);
                    } catch(error) {
                        error.message += " while processing file '" + _this.filePath + "'";
                        callback(error);
                    }
                } else {
                    callback(error);
                }
            });
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {string} argumentsString
         * @return {Array.<(string|number)>}
         */
        parseArguments: function(argumentsString) {
            var args = [];
            if (argumentsString !== undefined) {
                var parts = argumentsString.split(',');
                parts.forEach(function(part) {
                    var results = part.match(/\s*('|")(.*?)\1\s*/);
                    if (results) {
                        args.push(results[2]);
                    } else {
                        var num = parseFloat(part);
                        if (isNaN(num)) {
                            throw new Error("Could not parse parameter '" + part + "'");
                        }
                        args.push(num);
                    }
                });
            }
            return args;
        }

    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buganno.AnnotationParser', AnnotationParser);
});
