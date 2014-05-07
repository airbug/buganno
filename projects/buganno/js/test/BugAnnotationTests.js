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
//@Require('buganno.BugAnnotation')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestAnnotation')
//@Require('bugyarn.BugYarn')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var List                    = bugpack.require('List');
    var BugAnnotation           = bugpack.require('buganno.BugAnnotation');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var TestAnnotation          = bugpack.require('bugunit.TestAnnotation');
    var BugYarn                 = bugpack.require('bugyarn.BugYarn');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta                 = BugMeta.context();
    var bugyarn                 = BugYarn.context();
    var test                    = TestAnnotation.test;


    //-------------------------------------------------------------------------------
    // BugYarn
    //-------------------------------------------------------------------------------

    bugyarn.registerWeaver("testBugAnnotation", function(yarn, args) {
        return new BugAnnotation(args[0], args[1]);
    });


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     * This tests...
     * 1) Instantiating a BugAnnotation class
     */
    var bugAnnotationInstantiationTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testArguments          = ["testArgument0", 1];
            this.testAnnotationType     = "testAnnotationType";
            this.testBugAnnotation      = new BugAnnotation( this.testAnnotationType, this.testArguments);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testBugAnnotation, BugAnnotation),
                "Assert instance of BugAnnotation");
            test.assertTrue(Class.doesExtend(this.testBugAnnotation.getArgumentList(), List),
                "Assert BugAnnotation.argumentList is a List");
            test.assertEqual(this.testBugAnnotation.getArgumentList().getAt(0), this.testArguments[0],
                "Assert BugAnnotation.argumentList[0] was set correctly");
            test.assertEqual(this.testBugAnnotation.getArgumentList().getAt(1), this.testArguments[1],
                "Assert BugAnnotation.argumentList[1] was set correctly");
            test.assertEqual(this.testBugAnnotation.getAnnotationType(), this.testAnnotationType,
                "Assert BugAnnotation.annotationType was set correctly");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.annotate(bugAnnotationInstantiationTest).with(
        test().name("BugAnnotation - instantiation test")
    );
});
