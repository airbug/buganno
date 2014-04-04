//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.AnnotationParserProcessor')

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('List')
//@Require('Map')
//@Require('Obj')
//@Require('UuidGenerator')
//@Require('buganno.AnnotationRegistry')
//@Require('buganno.BugAnnotation')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();
var child_process       = require('child_process');
var os                  = require('os');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Bug                 = bugpack.require('Bug');
var Class               = bugpack.require('Class');
var Exception           = bugpack.require('Exception');
var List                = bugpack.require('List');
var Map                 = bugpack.require('Map');
var Obj                 = bugpack.require('Obj');
var UuidGenerator       = bugpack.require('UuidGenerator');
var AnnotationRegistry  = bugpack.require('buganno.AnnotationRegistry');
var BugAnnotation       = bugpack.require('buganno.BugAnnotation');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series             = BugFlow.$series;
var $task               = BugFlow.$task;
var $whileParallel      = BugFlow.$whileParallel;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var AnnotationParserProcessor = Class.extend(Obj, {

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
         * @type {Array}
         */
        this.annotationParserProcesses  = new List();

        /**
         * @private
         * @type {number}
         */
        this.roundRobinIndex            = -1;

        /**
         * @private
         * @type {Map.<string, function(Error, AnnotationRegistry=)>}
         */
        this.taskUuidCallbackMap        = new Map();

        /**
         * @private
         * @type {boolean}
         */
        this.started                    = false;

        var _this = this;
        this.hearChildProcessMessage = function(message) {
            _this.handleChildMessage(message);
        }
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {(string | Path)} sourceFile
     * @param {function(Error, AnnotationRegistry=)} callback
     */
    parse: function(sourceFile, callback) {
        var _this               = this;
        sourceFile              = BugFs.path(sourceFile);
        var annotationRegistry  = null;
        $series([
            $task(function(flow) {
                var parseTask = _this.generateParseTask(sourceFile);
                _this.sendParseTaskAndWaitForResponse(parseTask, function(throwable, returnedAnnotationRegistry) {
                    if (!throwable) {
                        annotationRegistry = returnedAnnotationRegistry;
                    }
                    flow.complete(throwable);
                });
            })
        ]).execute(function(throwable) {
            if (!throwable) {
                callback(null, annotationRegistry);
            } else {
                callback(throwable);
            }
        });
    },

    /**
     * @param {function(Throwable=)} callback
     */
    startProcesses: function(callback) {
        var _this = this;

        //TODO BRN: Update this system to use the more robust functionality from bugwork

        //TEST
        console.log("Starting processes");

        if (!this.started) {
            this.started    = true;
            var numCPUs     = os.cpus().length;
            var i           = 0;
            $whileParallel(function(flow) {
                    flow.assert(i < numCPUs);
                },
                $task(function(flow) {
                    i++;
                    _this.createAndStartProcess(function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ).execute(callback);
        } else {
            callback();
        }
    },

    /**
     * @param {function(Throwable=)} callback
     */
    stopProcesses: function(callback) {
        var _this = this;
        this.annotationParserProcesses.forEach(function(annotationParserProcess) {
            annotationParserProcess.kill();
            annotationParserProcess.removeListener("message", _this.hearChildProcessMessage);
        });
        this.annotationParserProcesses.clear();
        callback();
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {function(Throwable=)} callback
     */
    createAndStartProcess: function(callback) {
        var _this           = this;

        // TODO BRN: This seems pretty fragile. Perhaps there's a way to look up the location of a script by name?
        // OR we can figure out a way to inject code in to a process via string.

        var processPath     = BugFs.resolvePaths([__dirname, "../scripts/annotation-parser-process-start.js"]);
        var childProcess    = child_process.fork(processPath.getAbsolutePath());

        var processReadyListener = function(message) {
            switch (message.messageType) {
                case "ProcessReady":
                    //TEST
                    console.log("AnnotationParserProcessor Received 'ProcessReady' message");
                    _this.annotationParserProcesses.add(childProcess);
                    childProcess.removeListener('message', processReadyListener);
                    childProcess.on('message', _this.hearChildProcessMessage);
                    callback();
                    break;
                default:
                    childProcess.removeListener('message', processReadyListener);
                    childProcess.kill();
                    callback(new Bug("UnsupportedProcessMessage", {}, "Unsupported process message - message:", message));
            }
        };
        childProcess.on('message', processReadyListener);
    },

    /**
     * @private
     * @param {Path} sourceFile
     * @returns {{sourceFile: string, taskUuid: string}}
     */
    generateParseTask: function(sourceFile) {
        var taskUuid = UuidGenerator.generateUuid();
        return {sourceFile: sourceFile.getAbsolutePath(), taskUuid:taskUuid};
    },

    /**
     * @private
     */
    roundRobinNextProcess: function() {
        var numberProcesses = this.annotationParserProcesses.getCount();
        if (numberProcesses > 0) {
            this.roundRobinIndex++;
            if (this.roundRobinIndex >= numberProcesses) {
                this.roundRobinIndex = 0;
            }
            return this.annotationParserProcesses.getAt(this.roundRobinIndex);
        }
        return undefined;
    },

    /**
     * @private
     * @param {{sourceFile: string, taskUuid: string}} parseTask
     * @param {function(Throwable, AnnotationRegistry=)} callback
     */
    sendParseTaskAndWaitForResponse: function(parseTask, callback) {
        this.taskUuidCallbackMap.put(parseTask.taskUuid, callback);
        var annotationParserProcess = this.roundRobinNextProcess();

        //TEST
        console.log("Sending parseTask:", parseTask);

        annotationParserProcess.send({
            messageType: "ParseTask",
            parseTask: parseTask
        });
    },


    //-------------------------------------------------------------------------------
    // Message Processors
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {{
     *      annotationRegistry: Object,
     *      messageType: string,
     *      taskUuid: string
     * }} message
     */
    processAnnotationRegistryMessage: function(message) {
        var annotationRegistryData = message.annotationRegistry;

        //TODO BRN: This part should be done by bugmarsh

        var annotationRegistry = new AnnotationRegistry(BugFs.path(annotationRegistryData.filePath));
        annotationRegistryData.annotationList.forEach(function(annotationData) {
            var annotation = new BugAnnotation(annotationData.type, annotationData.arguments);
            annotationRegistry.addAnnotation(annotation);
        });
        var callback        = this.taskUuidCallbackMap.remove(message.taskUuid);
        callback(null, annotationRegistry);
    },

    /**
     * @private
     * @param {{
     *      message: string,
     *      messageType: string,
     *      stack: string,
     *      taskUuid: string
     * }} message
     */
    processProcessErrorMessage: function(message) {
        var error       = new Error(message.message);
        error.stack     = message.stack;
        var exception   = new Exception("ProcessError", {}, "An error occurred in a sub process", [error]);
        if (message.taskUuid) {
            var callback = this.taskUuidCallbackMap.remove(message.taskUuid);
            callback(exception);
        } else {
            throw exception;
        }
    },


    //-------------------------------------------------------------------------------
    // Event Listeners
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param message
     */
    handleChildMessage: function(message) {
       switch (message.messageType) {
            case "AnnotationRegistry":
                this.processAnnotationRegistryMessage(message);
                break;
            case "ProcessError":
                this.processProcessErrorMessage(message);
                break;
            default:
                throw new Bug("UnsupportedProcessMessage", {}, "Unsupported process message - message:", message);
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buganno.AnnotationParserProcessor', AnnotationParserProcessor);
