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
//@Require('buganno.Annotation')


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
    var Annotation      = bugpack.require('buganno.Annotation');


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
             * @type {List.<Annotation>}
             */
            this.annotationList     = new List();

            /**
             * @private
             * @type {Map.<string, List.<Annotation>>}
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
         * @return {List.<Annotation>}
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
         * @param {Annotation} annotation
         */
        addAnnotation: function(annotation) {
            if (Class.doesExtend(annotation, Annotation)) {
                this.annotationList.add(annotation);
                var annotationTypeList = this.annotationTypeMap.get(annotation.getAnnotationType());
                if (!annotationTypeList) {
                    annotationTypeList = new List();
                    this.annotationTypeMap.put(annotation.getAnnotationType(), annotationTypeList);
                }
                annotationTypeList.add(annotation);
            } else {
                throw new Bug("IllegalArgument", {}, "parameter 'annotation' must be an instance of Annotation");
            }
        },

        /**
         * @param {string} type
         * @return {List.<Annotation>}
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
