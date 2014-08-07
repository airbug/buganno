/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.Annotation')

//@Require('Class')
//@Require('IObjectable')
//@Require('List')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var IObjectable     = bugpack.require('IObjectable');
    var List            = bugpack.require('List');
    var Obj             = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var Annotation = Class.extend(Obj, {

        _name: "buganno.Annotation",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} annotationType
         * @param {Array.<(string | number)>} arguments
         */
        _constructor: function(annotationType, arguments) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {List.<(string | number)>}
             */
            this.argumentList       = new List(arguments);

            /**
             * @private
             * @type {string}
             */
            this.annotationType     = annotationType;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {List.<(string | number)>}
         */
        getArgumentList: function() {
            return this.argumentList;
        },

        /**
         * @return {string}
         */
        getAnnotationType: function() {
            return this.annotationType;
        },


        //-------------------------------------------------------------------------------
        // IObjectable Implementation
        //-------------------------------------------------------------------------------

        /**
         * @return {Object}
         */
        toObject: function() {
            return {
                arguments: this.argumentList.toArray(),
                type: this.annotationType
            };
        }
    });


    //-------------------------------------------------------------------------------
    // Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(Annotation, IObjectable);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buganno.Annotation', Annotation);
});
