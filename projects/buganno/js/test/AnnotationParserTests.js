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
//@Require('buganno.AnnotationParser')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var AnnotationParser    = bugpack.require('buganno.AnnotationParser');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var TestTag      = bugpack.require('bugunit.TestTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta             = BugMeta.context();
    var test                = TestTag.test;


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     *
     */
    var annotationParserParseTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            var testString = "//@Test('param')\n";
            var testFilePath = {
                readFile: function(encoding, callback) {
                    callback(undefined, testString);
                }
            };
            this.annotationParser = new AnnotationParser(testFilePath);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            var _this = this;
            this.annotationParser.parse(function(error, annotationRegistry) {
                if (!error) {
                    var annotationList = annotationRegistry.getAnnotationList();
                    test.assertEqual(annotationList.getCount(), 1,
                        "Assert that annotation list has 1 annotation");
                    if (annotationList.getCount() >= 1) {
                        var annotation = annotationList.getAt(0);
                        test.assertEqual(annotation.getAnnotationType(), "Test",
                            "Assert annotation type is 'Test'");
                        test.assertEqual(annotation.getArgumentList().getAt(0), "param",
                            "Assert that annotation has single argument 'param'");
                    }
                } else {
                    test.error(error);
                }
            });
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(annotationParserParseTest).with(
        test().name("AnnotationParser parse test")
    );
});
