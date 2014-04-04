//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

var bugpackApi  = require("bugpack");
bugpackApi.loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExport("buganno.AnnotationParserProcess", function(error) {
            if (!error) {
                var AnnotationParserProcess = bugpack.require('buganno.AnnotationParserProcess');
                var annotationParserProcess = new AnnotationParserProcess(process);
                annotationParserProcess.start();
            } else {
                console.error(error);
                process.exit(1);
            }
        });
    } else {
        console.error(error);
        process.exit(1);
    }
});
