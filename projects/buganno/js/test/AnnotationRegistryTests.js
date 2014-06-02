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
//@Require('buganno.AnnotationRegistry')
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

    var Class                   = bugpack.require('Class');
    var AnnotationRegistry      = bugpack.require('buganno.AnnotationRegistry');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var TestTag          = bugpack.require('bugunit.TestTag');
    var BugYarn                 = bugpack.require('bugyarn.BugYarn');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta                 = BugMeta.context();
    var bugyarn                 = BugYarn.context();
    var test                    = TestTag.test;


    //-------------------------------------------------------------------------------
    // BugYarn
    //-------------------------------------------------------------------------------

    bugyarn.registerWeaver("testAnnotationRegistry", function(yarn, args) {
        return new AnnotationRegistry(args[0]);
    });

    bugyarn.registerWinder("setupTestTagRegistry", function(yarn) {
        yarn.wind({
            annotationRegistry: new AnnotationRegistry("testFilePath")
        });
    });


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     * This tests...
     * 1) Instantiating a AnnotationRegistry class
     */
    var annotationRegistryInstantiationTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testFilePath           = "testFilePath";
            this.testAnnotationRegistry =   new AnnotationRegistry(this.testFilePath);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testAnnotationRegistry, AnnotationRegistry),
                "Assert instance of AnnotationRegistry");
            test.assertEqual(this.testAnnotationRegistry.getFilePath(), this.testFilePath,
                "Assert AnnotationRegistry.filePath was set correctly");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(annotationRegistryInstantiationTest).with(
        test().name("AnnotationRegistry - instantiation test")
    );
});
