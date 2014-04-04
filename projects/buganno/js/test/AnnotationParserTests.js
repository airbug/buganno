//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('Class')
//@Require('buganno.AnnotationParser')
//@Require('bugmeta.BugMeta')
//@Require('bugunit-annotate.TestAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var AnnotationParser    = bugpack.require('buganno.AnnotationParser');
var BugMeta             = bugpack.require('bugmeta.BugMeta');
var TestAnnotation      = bugpack.require('bugunit-annotate.TestAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var bugmeta = BugMeta.context();
var test = TestAnnotation.test;


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
bugmeta.annotate(annotationParserParseTest).with(
    test().name("AnnotationParser parse test")
);
