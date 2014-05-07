/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.AnnotationRegistryLibraryBuilder')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Exception')
//@Require('List')
//@Require('Map')
//@Require('bugflow.BugFlow')
//@Require('buganno.AnnotationParserProcessor')
//@Require('buganno.AnnotationRegistryLibrary')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                       = bugpack.require('Class');
    var Event                       = bugpack.require('Event');
    var EventDispatcher             = bugpack.require('EventDispatcher');
    var Exception                   = bugpack.require('Exception');
    var List                        = bugpack.require('List');
    var Map                         = bugpack.require('Map');
    var BugFlow                     = bugpack.require('bugflow.BugFlow');
    var AnnotationParserProcessor   = bugpack.require('buganno.AnnotationParserProcessor');
    var AnnotationRegistryLibrary   = bugpack.require('buganno.AnnotationRegistryLibrary');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $iterableParallel           = BugFlow.$iterableParallel;
    var $series                     = BugFlow.$series;
    var $task                       = BugFlow.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var AnnotationRegistryLibraryBuilder = Class.extend(EventDispatcher, {

        _name: "buganno.AnnotationRegistryLibraryBuilder",


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
             * @type {AnnotationParserProcessor}
             */
            this.annotationParserProcessor  = new AnnotationParserProcessor();

            /**
             * @private
             * @type {boolean}
             */
            this.deinitializing             = false;

            /**
             * @private
             * @type {boolean}
             */
            this.initialized                = false;

            /**
             * @private
             * @type {boolean}
             */
            this.initializing               = false;
        },


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        isDeinitializing: function() {
            return this.deinitializing;
        },

        /**
         * @return {boolean}
         */
        isInitialized: function() {
            return this.initialized;
        },

        /**
         * @return {boolean}
         */
        isInitializing: function() {
            return this.initializing;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Array.<(string | Path)> | List.<(string | Path)>} filePaths
         * @param {function(Throwable, AnnotationRegistryLibrary=)} callback
         */
        build: function(filePaths, callback) {
            var _this                       = this;
            if (this.initialized) {
                var annotationRegistryLibrary   = new AnnotationRegistryLibrary();
                var filePathList                = new List(filePaths);
                $iterableParallel(filePathList, function(flow, filePath) {
                    _this.annotationParserProcessor.parse(filePath, function(error, annotationRegistry) {
                        if (!error) {
                            annotationRegistryLibrary.addAnnotationRegistry(annotationRegistry);
                        }
                        flow.complete(error);
                    });
                }).execute(function(error) {
                    if (!error) {
                        callback(null, annotationRegistryLibrary);
                    } else {
                        callback(error);
                    }
                });
            } else {
                callback(new Exception("IllegalState", {}, "Must initialize AnnotationRegistryLibraryBuilder before build can be called"));
            }
        },

        /**
         *
         */
        deinitialize: function() {
            var _this = this;
            if (this.isInitialized() && !this.isDeinitializing()) {
                this.deinitializing = true;
                $task(function(flow) {

                    //TODO BRN: Update this system to use the more robust functionality from bugwork

                    _this.annotationParserProcessor.stopProcesses(function(throwable) {
                        flow.complete(throwable);
                    });
                }).execute(function(throwable) {
                    if (!throwable) {
                        _this.completeDeinitialization();
                    } else {
                        throw throwable;
                    }
                });
            }
        },

        /**
         *
         */
        initialize: function() {
            var _this = this;
            if (!this.isInitialized() && !this.isInitializing()) {
                this.initializing = true;
                $task(function(flow) {

                    //TODO BRN: Update this system to use the more robust functionality from bugwork

                    _this.annotationParserProcessor.startProcesses(function(throwable) {
                        flow.complete(throwable);
                    });
                }).execute(function(throwable) {
                    if (!throwable) {
                        _this.completeInitialization();
                    } else {
                        throw throwable;
                    }
                });
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        completeDeinitialization: function() {
            this.initialized = false;
            this.initializing = false;
            this.deinitializing = false;
            this.dispatchEvent(new Event(AnnotationRegistryLibraryBuilder.EventTypes.DEINITIALIZE_COMPLETE));
        },

        /**
         * @private
         */
        completeInitialization: function() {
            this.deinitializing = false;
            this.initializing = false;
            this.initialized = true;
            this.dispatchEvent(new Event(AnnotationRegistryLibraryBuilder.EventTypes.INITIALIZE_COMPLETE));
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    AnnotationRegistryLibraryBuilder.EventTypes = {
        DEINITIALIZE_COMPLETE: "AnnotationRegistryLibraryBuilder:DeinitializeComplete",
        INITIALIZE_COMPLETE: "AnnotationRegistryLibraryBuilder:InitializeComplete"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buganno.AnnotationRegistryLibraryBuilder', AnnotationRegistryLibraryBuilder);
});
