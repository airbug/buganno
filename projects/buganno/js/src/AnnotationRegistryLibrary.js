/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.AnnotationRegistryLibrary')

//@Require('Class')
//@Require('List')
//@Require('Map')
//@Require('Obj')
//@Require('bugfs.Path')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var List        = bugpack.require('List');
    var Map         = bugpack.require('Map');
    var Obj         = bugpack.require('Obj');
    var Path        = bugpack.require('bugfs.Path');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var AnnotationRegistryLibrary = Class.extend(Obj, {

        _name: "buganno.AnnotationRegistryLibrary",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {List.<AnnotationRegistry>}
             */
            this.annotationRegistryList             = new List();

            /**
             * @private
             * @type {Map.<string, AnnotationRegistry>}
             */
            this.filePathToAnnotationRegistryMap    = new Map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {List.<AnnotationRegistry>}
         */
        getAnnotationRegistryList: function() {
            return this.annotationRegistryList;
        },


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {(Path | string)} filePath
         * @return {AnnotationRegistry}
         */
        getAnnotationRegistryByFilePath: function(filePath) {
            var pathString = filePath;
            if (Class.doesExtend(pathString, Path)) {
                pathString = filePath.getAbsolutePath();
            }
            return this.filePathToAnnotationRegistryMap.get(pathString);
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {AnnotationRegistry} annotationRegistry
         */
        addAnnotationRegistry: function(annotationRegistry) {
            this.annotationRegistryList.add(annotationRegistry);
            this.filePathToAnnotationRegistryMap.put(annotationRegistry.getFilePath().getAbsolutePath(), annotationRegistry);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buganno.AnnotationRegistryLibrary', AnnotationRegistryLibrary);
});
