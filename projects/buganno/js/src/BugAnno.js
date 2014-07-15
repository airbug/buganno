/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.BugAnno')

//@Require('Class')
//@Require('Obj')
//@Require('Proxy')
//@Require('buganno.AnnotationRegistryLibraryBuilder')
//@Require('Flows')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                               = bugpack.require('Class');
    var Obj                                 = bugpack.require('Obj');
    var Proxy                               = bugpack.require('Proxy');
    var AnnotationRegistryLibraryBuilder    = bugpack.require('buganno.AnnotationRegistryLibraryBuilder');
    var Flows                             = bugpack.require('Flows');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series                             = Flows.$series;
    var $task                               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BugAnno = Class.extend(Obj, {

        _name: "buganno.BugAnno",


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
             * @type {AnnotationRegistryLibraryBuilder}
             */
            this.annotationRegistryLibraryBuilder   = new AnnotationRegistryLibraryBuilder();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {AnnotationRegistryLibraryBuilder}
         */
        getAnnotationRegistryLibraryBuilder: function() {
            return this.annotationRegistryLibraryBuilder;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        deinitialize: function(callback) {
            this.ensureBuilderDeinitialized(callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        initialize: function(callback) {
            this.ensureBuilderInitialized(callback);
        },

        /**
         * @param {(Array.<(string | Path)> | ICollection.<(string | Path)>)} filePaths
         * @param {function(Error, AnnotationRegistryLibrary=)} callback
         */
        parse: function(filePaths, callback) {
            var _this                       = this;
            var annotationRegistryLibrary   = null;
            $series([
                $task(function(flow) {
                    _this.annotationRegistryLibraryBuilder.build(filePaths, function(throwable, returnedAnnotationRegistryLibrary) {
                        if (!throwable) {
                            annotationRegistryLibrary = returnedAnnotationRegistryLibrary;
                        }
                        flow.complete(throwable);
                    });
                })
            ]).execute(function(throwable) {
                if (!throwable) {
                    callback(null, annotationRegistryLibrary);
                } else {
                    callback(throwable);
                }
            });
        },

        /**
         * @param {(Array.<(string | Path)> | ICollection.<(string | Path)>)} filePaths
         * @param {function(Error, AnnotationRegistryLibrary=)} callback
         */
        parseOnce: function(filePaths, callback) {
            var _this                       = this;
            var annotationRegistryLibrary   = null;
            $series([
                $task(function(flow) {
                    _this.ensureBuilderInitialized(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.annotationRegistryLibraryBuilder.build(filePaths, function(throwable, returnedAnnotationRegistryLibrary) {
                        if (!throwable) {
                            annotationRegistryLibrary = returnedAnnotationRegistryLibrary;
                        }
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.ensureBuilderDeinitialized(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
            ]).execute(function(throwable) {
                if (!throwable) {
                    callback(null, annotationRegistryLibrary);
                } else {
                    callback(throwable);
                }
            });
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        ensureBuilderDeinitialized: function(callback) {
            if (this.annotationRegistryLibraryBuilder.isInitialized()) {
                this.annotationRegistryLibraryBuilder.addEventListener(AnnotationRegistryLibraryBuilder.EventTypes.DEINITIALIZE_COMPLETE, function(event) {
                    callback();
                });
                if (!this.annotationRegistryLibraryBuilder.isDeinitializing()) {
                    this.annotationRegistryLibraryBuilder.deinitialize();
                }
            } else {
                callback();
            }
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        ensureBuilderInitialized: function(callback) {
            if (!this.annotationRegistryLibraryBuilder.isInitialized()) {
                this.annotationRegistryLibraryBuilder.addEventListener(AnnotationRegistryLibraryBuilder.EventTypes.INITIALIZE_COMPLETE, function(event) {
                    callback();
                });
                if (!this.annotationRegistryLibraryBuilder.isInitializing()) {
                    this.annotationRegistryLibraryBuilder.initialize();
                }
            } else {
                callback();
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Private Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {BugAnno}
     */
    BugAnno.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {BugAnno}
     */
    BugAnno.getInstance = function() {
        if (BugAnno.instance === null) {
            BugAnno.instance = new BugAnno();
        }
        return BugAnno.instance;
    };


    //-------------------------------------------------------------------------------
    // Static Proxy
    //-------------------------------------------------------------------------------

    Proxy.proxy(BugAnno, Proxy.method(BugAnno.getInstance), [
        "deinitialize",
        "initialize",
        "parse",
        "parseOnce"
    ]);


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export('buganno.BugAnno', BugAnno);
});
