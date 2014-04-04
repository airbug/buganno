//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buganno.AnnotationParserProcess')

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Obj')
//@Require('buganno.AnnotationParser')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();
var child_process       = require('child_process');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Bug                 = bugpack.require('Bug');
var Class               = bugpack.require('Class');
var Exception           = bugpack.require('Exception');
var Obj                 = bugpack.require('Obj');
var AnnotationParser    = bugpack.require('buganno.AnnotationParser');
var BugFs               = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var AnnotationParserProcess = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {*} process
     */
    _constructor: function(process) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {*}
         */
        this.process = process;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    start: function() {
        //TEST
        console.log("Starting AnnotationParserProcess");

        var _this = this;
        this.process.on('message', function(message) {
            _this.handleMessage(message);
        });
        this.sendProcessMessage({
            messageType: "ProcessReady"
        });
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {{sourceFile: string, taskUuid: string}} parseTask
     */
    processParseTask: function(parseTask) {
        var _this               = this;
        if (parseTask.sourceFile) {
            var filePath            = BugFs.path(parseTask.sourceFile);
            var annotationParser    = new AnnotationParser(filePath);
            annotationParser.parse(function(error, annotationRegistry) {
                if (!error) {
                    _this.sendProcessMessage({
                        messageType: "AnnotationRegistry",
                        taskUuid: parseTask.taskUuid,
                        annotationRegistry: annotationRegistry.toObject()
                    });
                } else {
                    _this.sendTaskError(error, parseTask.taskUuid);
                }
            });
        } else {
            this.sendTaskError(new Exception("IllegalMessage", {}, "RegistryBuilderChild received message that did not have a source file"), parseTask.taskUuid);
        }
    },

    /**
     * @private
     * @param {Throwable} throwable
     */
    sendError: function(throwable) {
        this.sendProcessMessage({
            messageType: "ProcessError",
            message: throwable.message,
            stack: throwable.stack
        });
    },

    /**
     * @private
     * @param {Object} messageObject
     */
    sendProcessMessage: function(messageObject) {
        this.process.send(messageObject);
    },

    /**
     * @private
     * @param {Throwable} throwable
     * @param {string} taskUuid
     */
    sendTaskError: function(throwable, taskUuid) {
        this.sendProcessMessage({
            messageType: "ProcessError",
            stack: throwable.stack,
            message: throwable.message,
            taskUuid: taskUuid
        });
    },


    //-------------------------------------------------------------------------------
    // Message Handlers
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {*} message
     */
    handleMessage: function(message) {
        //TEST
        console.log("AnnotationParserProcess received message:", message);

        switch (message.messageType) {
            case "ParseTask":
                this.processParseTask(message.parseTask);
                break;
            default:
                throw new Bug("UnsupportedMessageType", {}, "AnnotationParserProcess received a message of an unsupported type '" + message.messageType + "'");
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buganno.AnnotationParserProcess', AnnotationParserProcess);
