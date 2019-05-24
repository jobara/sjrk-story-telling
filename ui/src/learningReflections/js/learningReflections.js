/*
Copyright 2018-2019 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid */

"use strict";

(function ($, fluid) {

    // Provides the Learning Reflections framing to the Storytelling Tool
    fluid.defaults("sjrk.storyTelling.learningReflections", {
        gradeNames: ["sjrk.storyTelling.page"],
        components: {
            menu: {
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-menu.handlebars"
                                }
                            }
                        }
                    }
                }
            },
            masthead: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-page-header-container",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                model: {
                                    dynamicValues: {
                                        browseLinkUrl: "{page}.options.pageSetup.browseLinkUrl",
                                        buildLinkUrl: "{page}.options.pageSetup.buildLinkUrl"
                                    }
                                },
                                templateConfig: {
                                    messagesPath: "%resourcePrefix/src/learningReflections/messages/learningReflectionMessages.json",
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-masthead.handlebars"
                                }
                            }
                        }
                    }
                }
            },
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
                                },
                                templateConfig: {
                                    messagesPath: "%resourcePrefix/src/learningReflections/messages/learningReflectionMessages.json",
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-footer.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyView page
    fluid.defaults("sjrk.storyTelling.learningReflections.storyView", {
        gradeNames: ["sjrk.storyTelling.learningReflections", "sjrk.storyTelling.page.storyView"],
        components: {
            storyViewer: {
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-storyViewer.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyBrowse page
    fluid.defaults("sjrk.storyTelling.learningReflections.storyBrowse", {
        gradeNames: ["sjrk.storyTelling.learningReflections", "sjrk.storyTelling.page.storyBrowse"],
        components: {
            storyBrowser: {
                options: {
                    browserConfig: {
                        placeholderThumbnailUrl: "src/img/icons/Book.svg"
                    },
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-storyBrowser.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyEdit page
    fluid.defaults("sjrk.storyTelling.learningReflections.storyEdit", {
        gradeNames: ["sjrk.storyTelling.learningReflections", "sjrk.storyTelling.page.storyEdit"],
        components: {
            menu: {
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/src/templates/menu.handlebars"
                                }
                            }
                        }
                    }
                }
            },
            storyEditor: {
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-storyEditor.handlebars"
                                }
                            }
                        }
                    }
                }
            },
            storyPreviewer: {
                options: {
                    components: {
                        templateManager: {
                            options: {
                                dynamicValues: {
                                    story: {
                                        testy: "WHATEVER MAN"
                                    }
                                },
                                templateConfig: {
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-storyViewer.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.introduction", {
        gradeNames: ["sjrk.storyTelling.learningReflections", "sjrk.storyTelling.page"],
        components: {
            introduction: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-introduction",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    messagesPath: "%resourcePrefix/src/learningReflections/messages/learningReflectionMessages.json",
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-introduction.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.workshops", {
        gradeNames: ["sjrk.storyTelling.learningReflections", "sjrk.storyTelling.page"],
        components: {
            workshops: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-workshops",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    messagesPath: "%resourcePrefix/src/learningReflections/messages/learningReflectionMessages.json",
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-workshops.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.resources", {
        gradeNames: ["sjrk.storyTelling.learningReflections", "sjrk.storyTelling.page"],
        components: {
            resources: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-resources",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    messagesPath: "%resourcePrefix/src/learningReflections/messages/learningReflectionMessages.json",
                                    templatePath: "%resourcePrefix/src/learningReflections/templates/learningReflections-resources.handlebars"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

})(jQuery, fluid);
