/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/main/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/main/LICENSE.txt
*/

/* global fluid, sjrk */

"use strict";

(function ($, fluid) {

    // The storyEdit page base grade
    fluid.defaults("sjrk.storyTelling.base.page.storyEdit", {
        gradeNames: ["sjrk.storyTelling.base.page"],
        distributeOptions: {
            "editor.uploadStateToCounters": {
                target: "{that editor singleFileUploader}.options.modelListeners",
                record: {
                    "uploadState": {
                        func: "{storyEdit}.updateUploadCounters",
                        args: ["{change}.oldValue", "{change}.value"],
                        namespace: "uploadStateToCounters"
                    }
                }
            },
            "blockManager.loadStoryContentIntoBlockUIs": {
                record: {
                    "{storyEditor}.story.model": {
                        func: "{blockManager}.createBlocksFromData",
                        args: ["{change}.value.content"],
                        includeSource: ["storyAutoload"],
                        namespace: "loadStoryContentIntoBlockUIs"
                    }
                },
                target: "{that storyEditor blockManager}.options.modelListeners"
            },
            "blockManager.creatStory": {
                record: {
                    "viewComponentContainerRequested.createStory": {
                        listener: "{storyEdit}.createNewStoryOnServer",
                        priority: "first"
                    }
                },
                target: "{that storyEditor blockManager}.options.listeners"
            }
        },
        pageSetup: {
            hiddenEditorClass: "hidden",
            storyAutosaveKey: "storyAutosave",
            storyCreationSourceName: "storyCreated",
            storySaveUrl: "/stories/",
            viewPageUrl: "storyView.html",
            storyIdPath: "id"
        },
        model: {
            /* The initial page state is only the Edit Story Step showing.
             * In much the same way as within the editor grade, the visibility
             * of the editor and previewer are mutually exclusive, and the latter
             * is always set to the opposite of the former. The same is true for
             * editStoryStepVisible and metadataStepVisible within the editor UI.
             *
             * The individual steps of the editor (editStoryStep and metadataStep)
             * are controlled within the editor model, so hiding and showing of
             * each of the three steps in the editor is achieved by changing
             * both the editorVisible value in this grade as well as
             * editStoryStepVisible.
             *
             * The three steps and their relevant model states are, in order:
             * - Edit Story Step
             *      - editorVisible: true
             *      - editStoryStepVisible: true
             * - Metadata Step
             *      - editorVisible: true
             *      - editStoryStepVisible: false
             * - Preview Step
             *      - editorVisible: false
             *      - editStoryStepVisible: false
             */
            editorVisible: true,
            previewerVisible: false,
            uploadCounters: {
                errors: 0,
                uploads: 0
            },
            // true when a file is uploading to the server or an error has been received
            previewingDisabled: false
        },
        modelRelay: {
            editPageVisibilityMutex: {
                source: "editorVisible",
                target: "previewerVisible",
                singleTransform: {
                    type: "sjrk.storyTelling.transforms.not"
                }
            },
            uploadCountersToPreviewingDisabled: {
                target: "previewingDisabled",
                singleTransform: {
                    type: "fluid.transforms.condition",
                    condition: {
                        transform: {
                            "type": "fluid.transforms.binaryOp",
                            "left": "{that}.model.uploadCounters.errors",
                            "right": "{that}.model.uploadCounters.uploads",
                            "operator": "||"
                        }
                    },
                    true: true,
                    false: false
                }
            }
        },
        modelListeners: {
            "editorVisible": [{
                this: "{storyEditor}.container",
                method: "toggle",
                args: ["{change}.value"],
                namespace: "manageEditorVisibility"
            },
            {
                func: "{that}.events.onContextChangeRequested.fire",
                args: ["{change}.value"],
                excludeSource: "init",
                priority: "last",
                namespace: "contextChangeOnEditorVisibilityChange"
            }],
            "previewerVisible": {
                this: "{storyPreviewer}.container",
                method: "toggle",
                args: ["{change}.value"],
                namespace: "managePreviewerVisibility"
            },
            "{storyEditor}.model.editStoryStepVisible": {
                func: "{that}.events.onContextChangeRequested.fire",
                args: ["{change}.value"],
                excludeSource: "init",
                priority: "last",
                namespace: "contextChangeOnEditStoryStepVisibilityChange"
            },
            "previewingDisabled": {
                this: "{that}.storyEditor.dom.storySubmit",
                method: "prop",
                args: ["disabled", "{change}.value"],
                namespace: "disablePreviewingOnUploadChange"
            }
        },
        selectors: {
            pageContainer: ".sjrkc-edit-page-container"
        },
        events: {
            onAllUiComponentsReady: {
                events: {
                    onEditorReady: "{storyEditor}.events.onControlsBound",
                    onPreviewerReady: "{storyPreviewer}.events.onControlsBound"
                }
            },
            onStoryUpdateOnServerComplete: null,
            onStoryCreateOnServerError: null,
            onStoryPublishRequested: "{storyPreviewer}.events.onShareRequested",
            onStoryPublishSuccess: null,
            onStoryPublishError: "{storyPreviewer}.events.onShareComplete"
        },
        listeners: {
            "{storyEditor}.events.onStorySubmitRequested": [{
                func: "{storyPreviewer}.templateManager.renderTemplate",
                namespace: "previewerRenderTemplate"
            },
            {
                func: "{that}.showEditorHidePreviewer",
                args: [false],
                namespace: "hideEditorShowPreviewer"
            }],
            "{storyEditor}.events.onStoryUiReady": {
                funcName: "{that}.initializeStory",
                priority: "first",
                namespace: "initializeStory"
            },
            "{storyPreviewer}.events.onStoryViewerPreviousRequested": {
                func: "{that}.showEditorHidePreviewer",
                args: [true],
                namespace: "showEditorHidePreviewer"
            },
            "onStoryPublishRequested.publishStory": "{that}.publishStory",
            "onStoryPublishSuccess.redirectToViewStory": "{that}.redirectToViewStory",
            "onCreate.setAuthoringEnabledClass": {
                func: "{that}.setAuthoringEnabledClass"
            }
        },
        invokers: {
            // Sets the visibility of page elements depending on authoringEnabled
            setAuthoringEnabledClass: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.showEditPageContainer",
                args: ["{that}.options.selectors.pageContainer", "{that}.options.pageSetup.authoringEnabled"]
            },
            // Shows the editor and hides the previewer if true, vice versa if false
            showEditorHidePreviewer: {
                func: "{that}.applier.change",
                args: ["editorVisible", "{arguments}.0"]
            },
            // Clears the localStorage autosave (does not remove story from database)
            clearAutosave: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.clearAutosave",
                args: ["{that}.options.pageSetup.storyAutosaveKey"]
            },
            // Loads a from localStorage if present, otherwise creates a new one
            initializeStory: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.initializeStory",
                args: ["{that}.options.pageSetup.storyAutosaveKey", "{that}"]
            },
            // Loads the story content into the Editor
            loadStoryContent: {
                changePath: "{storyEditor}.story.model",
                value: "{arguments}.0",
                source: "storyAutoload"
            },
            // Creates a new story on the server
            createNewStoryOnServer: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.createNewStoryOnServer",
                args: [
                    "{that}",
                    "{that}.options.pageSetup.storySaveUrl",
                    "{storyEditor}.story",
                    "{that}.options.pageSetup.storyIdPath",
                    "{that}.options.pageSetup.storyCreationSourceName",
                    "{that}.events.onStoryCreateOnServerError"
                ]
            },
            // Updates the current story on the server
            updateStoryOnServer: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.updateStoryOnServer",
                args: [
                    "{that}.options.pageSetup.storySaveUrl",
                    "{storyPreviewer}.story.model",
                    "{that}.events.onStoryUpdateOnServerComplete"
                ]
            },
            // Publishes the story
            publishStory: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.publishStory",
                args: [
                    "{that}",
                    "{storyEditor}.story",
                    "{that}.events.onStoryPublishSuccess",
                    "{that}.events.onStoryPublishError"
                ]
            },
            // Redirects the user to the given story
            redirectToViewStory: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.redirectToViewStory",
                args: ["{arguments}.0", "{that}.options.pageSetup.viewPageUrl"] // storyId
            },
            // Increments or decrements counters for blocks currently uploading or in error states
            updateUploadCounters: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.updateUploadCounters",
                args: ["{arguments}.0", "{arguments}.1", "{that}"] // prev state, next state
            }
        },
        /*
         * For a block of a given type, a block is considered empty unless any
         * one of the fields listed in its corresponding array is truthy.
         *
         * E.g. for an image block, even if heading, altText and description
         * are truthy, if the mediaUrl isn't provided then the block is empty.
         */
        blockFields: {
            "text": ["heading", "text"],
            "image": ["mediaUrl"],
            "audio": ["mediaUrl"],
            "video": ["mediaUrl"]
        },
        components: {
            // manages browser history for in-page forward-back support
            historian: {
                type: "fluid.locationBar",
                options: {
                    model: {
                        // because we have model relays that make sure metadataStepVisible
                        // and previewerVisible are always the opposite of editStoryStepVisible
                        // and editorVisible, respectively, we only need to track the latter two
                        editorVisible: "{storyEdit}.model.editorVisible",
                        editStoryStepVisible: "{storyEditor}.model.editStoryStepVisible"
                    },
                    modelToQuery: false,
                    queryToModel: false
                }
            },
            // the story editing context
            storyEditor: {
                type: "sjrk.storyTelling.ui.storyEditor",
                container: ".sjrkc-st-story-editor",
                options: {
                    components: {
                        story: {
                            options: {
                                modelListeners: {
                                    "": {
                                        funcName: "sjrk.storyTelling.base.page.storyEdit.saveStoryToAutosave",
                                        args: ["{storyEdit}.options.pageSetup.storyAutosaveKey", "{that}.model"],
                                        excludeSource: ["init", "storyAutoload"],
                                        namespace: "autosaveStory"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // the story safety and etiquette notice
            storyEtiquette: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-etiquette-container",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/templates/etiquette.handlebars"
                                }
                            }
                        }
                    }
                }
            },
            // the story preview context
            storyPreviewer: {
                type: "sjrk.storyTelling.ui.storyPreviewer",
                container: ".sjrkc-st-story-previewer",
                options: {
                    components: {
                        story: {
                            options: {
                                modelRelay: {
                                    entireModel: {
                                        target: "",
                                        source: "{storyEditor}.story.model",
                                        backward: "never",
                                        singleTransform: {
                                            type: "fluid.transforms.identity"
                                        }
                                    },
                                    contentEmptyBlockFilter: {
                                        target: "content",
                                        singleTransform: {
                                            type: "fluid.transforms.free",
                                            func: "sjrk.storyTelling.base.page.storyEdit.removeEmptyBlocks",
                                            args: ["{storyPreviewer}.story.model.content", "{storyEdit}.options.blockFields"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    /**
     * Saves story content to a given key in the browser's localStorage object.
     * Since localStorage can only store strings, the content must be serialized.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
     *
     * @param {String} storyAutosaveKey - the key at which to save the story content
     * @param {Object} storyContent - the story content (model data) to save
     */
    sjrk.storyTelling.base.page.storyEdit.saveStoryToAutosave = function (storyAutosaveKey, storyContent) {
        try {
            // clear the previously-saved story before saving the current story
            sjrk.storyTelling.base.page.storyEdit.clearAutosave(storyAutosaveKey);

            var serialized = JSON.stringify(storyContent);
            window.localStorage.setItem(storyAutosaveKey, serialized);
        } catch (ex) {
            fluid.log(fluid.logLevel.WARN, "An error occurred when saving", ex);
        }
    };

    /**
     * Loads story content from a given key in the browser's localStorage object.
     * If a story was successfully loaded, then the current story is updated with
     * this previously-saved data. If no story is loaded, then a new one is saved
     * to the server.
     *
     * @param {String} storyAutosaveKey - the key to load the story content from
     * @param {Component} storyEdit - an instance of `sjrk.storyTelling.base.page.storyEdit`
     */
    sjrk.storyTelling.base.page.storyEdit.initializeStory = function (storyAutosaveKey, storyEdit) {
        try {
            // localStorage can only store string values
            var savedStoryData = JSON.parse(window.localStorage.getItem(storyAutosaveKey));

            if (savedStoryData) {
                if (!storyEdit.createStoryPromise) {
                    storyEdit.createStoryPromise = fluid.promise();
                    storyEdit.createStoryPromise.resolve(savedStoryData);
                }
                // a story was loaded from autosave, update the current story
                storyEdit.loadStoryContent(savedStoryData);
            }
        } catch (ex) {
            fluid.log(fluid.logLevel.WARN, "An error occurred while initializing story", ex);
        }
    };

    /**
     * Creates a new story on the server and sets the current story's ID accordingly
     *
     * @param {Component} that - an instance of `sjrk.storyTelling.base.page.storyEdit`
     * @param {String} storySaveUrl - the server URL at which to save a story
     * @param {Component} story - an instance of `sjrk.storyTelling.story`
     * @param {String|String[]} storyIdPath - the model path to the story ID
     * @param {String} sourceName - the name of the Infusion change source for this update
     * @param {Object} errorEvent - the event to be fired in case of an error
     * @return {Promise} - a promise corresponding to the creation of the story on the server
     */
    sjrk.storyTelling.base.page.storyEdit.createNewStoryOnServer = function (that, storySaveUrl, story, storyIdPath, sourceName, errorEvent) {
        // The createStoryPromise and related workflow is to get around the issue of creating a new database entry each
        // time that the story edit page is loaded without an autosave record. Without this check the database could be
        // filled with empty records corresponding to page views from users, bots, and etc.
        // In the future we should re-examine the workflow/ui interaction to see if there is a better way to manage
        // story creation.
        if (!that.createStoryPromise) {

            that.createStoryPromise = fluid.promise();
            var serverSavePromise = sjrk.storyTelling.base.page.storyEdit.updateStoryOnServer(storySaveUrl, story.model);

            serverSavePromise.then(function (data) {
                var successResponse = JSON.parse(data);

                // The "story created" moment is now, since the story was created successfully
                story.applier.change("timestampCreated", new Date().toISOString(), null, sourceName);

                // store the ID on the story model for later use
                story.applier.change(storyIdPath, successResponse.id, null, sourceName);
            }, function (jqXHR, textStatus, errorThrown) {
                fluid.log(fluid.logLevel.WARN, "Error saving a new story to server:");
                fluid.log(jqXHR, textStatus, errorThrown);

                errorEvent.fire({
                    isError: true,
                    message: fluid.get(jqXHR, ["responseJSON", "message"]) || "Internal server error"
                });
            });

            fluid.promise.follow(serverSavePromise, that.createStoryPromise);
        };

        return that.createStoryPromise;
    };

    /**
     * Clears saved story content from a given key in the browser's localStorage object.
     *
     * @param {String} storyAutosaveKey - the key at which story content is saved
     */
    sjrk.storyTelling.base.page.storyEdit.clearAutosave = function (storyAutosaveKey) {
        try {
            window.localStorage.removeItem(storyAutosaveKey);
        } catch (ex) {
            fluid.log(fluid.logLevel.WARN, "An error occurred when clearing autosave", ex);
        }
    };

    /**
     * Increments or decrements a pair of counters depending on the previous and new
     * states of a particular value. The expected possible state transitions are:
     *
     * - undefined to ready
     * - ready to uploading
     * - uploading to ready
     * - uploading to errorReceived
     * - errorReceived to uploading
     *
     *
     * @param {String} previousState - the previous state of the value
     * @param {String} newState - the new state of the value
     * @param {Component} storyEdit - an instance of `sjrk.storyTelling.base.page.storyEdit`
     */
    sjrk.storyTelling.base.page.storyEdit.updateUploadCounters = function (previousState, newState, storyEdit) {
        var counters = fluid.copy(storyEdit.model.uploadCounters);

        if (previousState === "errorReceived") {
            counters.errors--;

            if (newState === "uploading") {
                counters.uploads++;
            }
        } else if (previousState === "uploading") {
            counters.uploads--;

            if (newState === "errorReceived") {
                counters.errors++;
            }
        } else if (previousState === "ready") {
            counters.uploads++;
        }

        storyEdit.applier.change(["uploadCounters"], counters);
    };

    /**
     * Removes all empty blocks from a given collection of story blocks
     *
     * @param {Component[]} blocks - a collection of story blocks (sjrk.storyTelling.block)
     * @param {Object.<String, String[]>} blockFields - a hash map of block types and the fields
     * that, if at least one is truthy, means that particular block is not empty
     *
     * @return {Object} - a collection of reliably non-empty story blocks
     */
    sjrk.storyTelling.base.page.storyEdit.removeEmptyBlocks = function (blocks, blockFields) {
        var filteredBlocks = [];

        fluid.each(blocks, function (block) {
            if (!sjrk.storyTelling.base.page.storyEdit.isEmptyBlock(block, blockFields[block.blockType])) {
                filteredBlocks.push(block);
            }
        });

        return filteredBlocks;
    };

    /**
     * Returns true if a block is determined to be empty, based on the values
     * listed in blockFieldsForType. If at least one of those values is
     * truthy, the block is not empty. If the values are empty or otherwise can't
     * be iterated over, then the block is also empty regardless of its contents.
     *
     * @param {Component} block - a single story block (sjrk.storyTelling.block)
     * @param {String[]} blockFieldsForType - a set of model values for this
     * particular block type that, if at least one is truthy, means the block is not empty
     *
     * @return {Boolean} - true if the block is considered empty
     */
    sjrk.storyTelling.base.page.storyEdit.isEmptyBlock = function (block, blockFieldsForType) {
        return !fluid.find_if(blockFieldsForType, function (blockContentValue) {
            return !!block[blockContentValue];
        });
    };

    /**
     * If authoring is not enabled, will hide the Edit page container
     *
     * @param {jQuery} pageContainer - the Edit page DOM container to show/hide
     * @param {Boolean} authoringEnabled - a flag indicating whether authoring is enabled
     */
    sjrk.storyTelling.base.page.storyEdit.showEditPageContainer = function (pageContainer, authoringEnabled) {
        $(pageContainer).prop("hidden", !authoringEnabled);
    };

    /**
     * Updates the story on the server with the provided model data
     *
     * @param {String} storySaveUrl - the server URL at which to save a story
     * @param {Object} storyModel - the model of the story to save
     *
     * @return {jqXHR} - the jqXHR for the server request
     */
    sjrk.storyTelling.base.page.storyEdit.updateStoryOnServer = function (storySaveUrl, storyModel) {
        return $.ajax({
            url         : storySaveUrl,
            data        : JSON.stringify(storyModel),
            cache       : false,
            contentType : "application/json",
            processData : false,
            type        : "POST"
        });
    };

    /**
     * Sets a story to "published" and redirects the user to the new story page
     *
     * @param {Component} storyEditPage - an instance of `sjrk.storyTelling.base.page.storyEdit`
     * @param {Component} story - an instance of `sjrk.storyTelling.story`
     * @param {Object} successEvent - the event to be fired on successful publish
     * @param {Object} errorEvent - the event to be fired in case of an error
     */
    sjrk.storyTelling.base.page.storyEdit.publishStory = function (storyEditPage, story, successEvent, errorEvent) {

        storyEditPage.createNewStoryOnServer().then(function () {
            // set the publish timestamp to now and the flag to "true"
            story.applier.change("", {
                "timestampPublished": new Date().toISOString(),
                "published": true
            });

            var storyUpdatePromise = storyEditPage.updateStoryOnServer();

            storyUpdatePromise.done(function () {
                storyEditPage.clearAutosave();
                successEvent.fire(story.model.id);
            });

            storyUpdatePromise.fail(function (jqXHR, textStatus, errorThrown) {
                var errorMessage = fluid.get(jqXHR, ["responseJSON", "message"]) ||
                    errorThrown ||
                    "Internal server error";

                errorEvent.fire({
                    isError: true,
                    message: errorMessage
                });
            });
        });
    };

    /**
     * Given a story ID and a URL to the view page, redirects the user to the
     * view page for that story.
     *
     * @param {String} storyId - the ID of the story to which the user will be redirected
     * @param {String} viewPageUrl - the URL for the story View page
     */
    sjrk.storyTelling.base.page.storyEdit.redirectToViewStory = function (storyId, viewPageUrl) {
        window.location.assign(viewPageUrl + "?id=" + storyId);
    };

})(jQuery, fluid);
