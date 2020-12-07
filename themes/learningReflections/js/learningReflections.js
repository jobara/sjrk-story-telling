/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/main/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/main/LICENSE.txt
*/

/* global fluid */

"use strict";

(function ($, fluid) {

    // Provides the Learning Reflections framing to the Storytelling Tool
    fluid.defaults("sjrk.storyTelling.learningReflections.page", {
        gradeNames: ["sjrk.storyTelling.base.page"],
        // distributeOptions: [{
        //     target: "{that > menu > templateManager}.options.templateConfig.templatePath",
        //     record: "%resourcePrefix/templates/learningReflections-menu.handlebars"
        // },
        // {
        //     target: "{that > masthead > templateManager}.options.templateConfig",
        //     record: {
        //         messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
        //         templatePath: "%resourcePrefix/templates/learningReflections-masthead.handlebars"
        //     }
        // },
        // {
        //     target: "{that > footer > templateManager}.options.templateConfig",
        //     record: {
        //         messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
        //         templatePath: "%resourcePrefix/templates/learningReflections-footer.handlebars"
        //     }
        // }],
        distributeOptions: {
            "learningReflections.templateManager.menu": {
                target: "{that > menu > templateManager}.options.templateConfig.templatePath",
                record: "%resourcePrefix/templates/learningReflections-menu.handlebars"
            },
            "learningReflections.templateManager.masthead": {
                target: "{that > masthead > templateManager}.options.templateConfig",
                record: {
                    messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                    templatePath: "%resourcePrefix/templates/learningReflections-masthead.handlebars"
                }
            },
            "learningReflections.templateManager.footer": {
                target: "{that > footer > templateManager}.options.templateConfig",
                record: {
                    messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                    templatePath: "%resourcePrefix/templates/learningReflections-footer.handlebars"
                }
            }
        },
        components: {
            // the masthead of the site
            masthead: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-page-header-container",
                options: {
                    distributeOptions: {
                        record: {
                            "onCreate.log": {
                                "this": "console",
                                method: "log",
                                args: ["onCreate: masthead id -", "{masthead}.id", "messageLoader id -", "{that}.id", "{that}"],
                                priority: "last"
                            },
                            "onResourcesLoaded.log": {
                                "this": "console",
                                method: "log",
                                args: ["onResourcesLoaded: masthead id -", "{masthead}.id", "messageLoader id -", "{that}"],
                                priority: "last"
                            },
                            "onResourceError.log": {
                                "this": "console",
                                method: "log",
                                args: ["onResourceError: masthead id -", "{masthead}.id", "messageLoader id -", "{arguments}.0"],
                                priority: "last"
                            }
                        },
                        target: "{that templateManager > messageLoader}.options.listeners"
                    }
                }
            },
            // the footer of the site
            footer: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-page-footer-container",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                model: {
                                    dynamicValues: {
                                        resourcePrefix: "{that}.options.templateConfig.resourcePrefix"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyView page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyView", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyView"],
        distributeOptions: {
            target: "{that > storyViewer > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyViewer.handlebars"
        }
    });

    // Applies the Learning Reflections shell to the storyBrowse page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyBrowse", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyBrowse"],
        distributeOptions: {
            target: "{that > storyBrowser > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyBrowser.handlebars"
        },
        components: {
            storyBrowser: {
                options: {
                    browserConfig: {
                        placeholderThumbnailUrl: "src/img/icons/Book.svg"
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyEdit page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyEdit", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyEdit"],
        distributeOptions: [{
            target: "{that > storyEditor > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyEditor.handlebars"
        },
        {
            target: "{that > storyPreviewer > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyViewer.handlebars"
        }]
    });

    // Applies the Learning Reflections shell to the storyNotFound page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyNotFound", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyNotFound"]
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.page.introduction", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page"],
        distributeOptions: [{
            target: "{that > introduction > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-introduction.handlebars"
            }
        }],
        components: {
            introduction: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-introduction"
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.page.workshops", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page"],
        distributeOptions: [{
            target: "{that > workshops > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-workshops.handlebars"
            }
        }],
        components: {
            workshops: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-workshops"
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.page.resources", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page"],
        distributeOptions: [{
            target: "{that > resources > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-resources.handlebars"
            }
        }],
        components: {
            resources: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-resources"
            }
        }
    });

})(jQuery, fluid);
