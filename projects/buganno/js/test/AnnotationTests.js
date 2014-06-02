/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * buganno may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('Class')
//@Require('List')
//@Require('buganno.Annotation')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestTag')
//@Require('bugyarn.BugYarn')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var List        = bugpack.require('List');
    var Annotation  = bugpack.require('buganno.Annotation');
    var BugMeta     = bugpack.require('bugmeta.BugMeta');
    var TestTag     = bugpack.require('bugunit.TestTag');
    var BugYarn     = bugpack.require('bugyarn.BugYarn');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta     = BugMeta.context();
    var bugyarn     = BugYarn.context();
    var test        = TestTag.test;


    //-------------------------------------------------------------------------------
    // BugYarn
    //-------------------------------------------------------------------------------

    bugyarn.registerWeaver("testAnnotation", function(yarn, args) {
        return new Annotation(args[0], args[1]);
    });


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     * This tests...
     * 1) Instantiating an Annotation class
     */
    var annotationInstantiationTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testArguments          = ["testArgument0", 1];
            this.testAnnotationType     = "testAnnotationType";
            this.testAnnotation      = new Annotation( this.testAnnotationType, this.testArguments);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testAnnotation, Annotation),
                "Assert instance of Annotation");
            test.assertTrue(Class.doesExtend(this.testAnnotation.getArgumentList(), List),
                "Assert Annotation.argumentList is a List");
            test.assertEqual(this.testAnnotation.getArgumentList().getAt(0), this.testArguments[0],
                "Assert Annotation.argumentList[0] was set correctly");
            test.assertEqual(this.testAnnotation.getArgumentList().getAt(1), this.testArguments[1],
                "Assert Annotation.argumentList[1] was set correctly");
            test.assertEqual(this.testAnnotation.getAnnotationType(), this.testAnnotationType,
                "Assert Annotation.annotationType was set correctly");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(annotationInstantiationTest).with(
        test().name("Annotation - instantiation test")
    );
});
