/*
Copyright 2018 OCAD University
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid */

(function ($, fluid) {

    "use strict";

    // an interface for viewing an individual text block
    fluid.defaults("sjrk.storyTelling.blockUi.textBlockViewer", {
        gradeNames: ["sjrk.storyTelling.blockUi"],
        components: {
            templateManager: {
                options: {
                    templateConfig: {
                        templatePath: "%resourcePrefix/src/templates/storyBlockTextView.handlebars"
                    }
                }
            },
            block: {
                type: "sjrk.storyTelling.block.textBlock"
            }
        }
    });

})(jQuery, fluid);