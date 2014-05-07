/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.AnnotationRegistry')

//@Require('Bug')
//@Require('Class')
//@Require('IObjectable')
//@Require('List')
//@Require('Map')
//@Require('Obj')
//@Require('buganno.BugAnnotation')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug             = bugpack.require('Bug');
    var Class           = bugpack.require('Class');
    var IObjectable     = bugpack.require('IObjectable');
    var List            = bugpack.require('List');
    var Map             = bugpack.require('Map');
    var Obj             = bugpack.require('Obj');
    var BugAnnotation   = bugpack.require('buganno.BugAnnotation');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var AnnotationRegistry = Class.extend(Obj, {

        _name: "buganno.AnnotationRegistry",


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
             * @type {List.<BugAnnotation>}
             */
            this.annotationList     = new List();

            /**
             * @private
             * @type {Map.<string, List.<BugAnnotation>>}
             */
            this.annotationTypeMap  = new Map();

            /**
             * @private
             * @type {Path}
             */
            this.filePath           = filePath;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {List.<BugAnnotation>}
         */
        getAnnotationList: function() {
            return this.annotationList;
        },

        /**
         * @return {Path}
         */
        getFilePath: function() {
            return this.filePath;
        },


        //-------------------------------------------------------------------------------
        // IObjectable Implementation
        //-------------------------------------------------------------------------------

        /**
         * @return {Object}
         */
        toObject: function() {
            var annotationRegistryData = {
                filePath: this.filePath.getAbsolutePath(),
                annotationList: []
            };
            this.annotationList.forEach(function(annotation) {
                annotationRegistryData.annotationList.push(annotation.toObject());
            });
            return annotationRegistryData;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {BugAnnotation} annotation
         */
        addAnnotation: function(annotation) {
            if (Class.doesExtend(annotation, BugAnnotation)) {
                this.annotationList.add(annotation);
                var annotationTypeList = this.annotationTypeMap.get(annotation.getAnnotationType());
                if (!annotationTypeList) {
                    annotationTypeList = new List();
                    this.annotationTypeMap.put(annotation.getAnnotationType(), annotationTypeList);
                }
                annotationTypeList.add(annotation);
            } else {
                throw new Bug("IllegalArgument", {}, "parameter 'annotation' must be an instance of BugAnnotation");
            }
        },

        /**
         * @param {string} type
         * @return {List.<BugAnnotation>}
         */
        getAnnotationListByType: function(type) {
            return this.annotationTypeMap.get(type);
        }
    });


    //-------------------------------------------------------------------------------
    // Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(AnnotationRegistry, IObjectable);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buganno.AnnotationRegistry', AnnotationRegistry);
});
