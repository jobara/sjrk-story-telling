/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/master/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, sjrk */

"use strict";

(function ($, fluid) {

    // The storyEdit page base grade
    fluid.defaults("sjrk.storyTelling.base.page.storyEdit", {
        gradeNames: ["sjrk.storyTelling.base.page"],
        pageSetup: {
            hiddenEditorClass: "hidden",
            storyAutosaveKey: "storyAutosave",
            storyAutoloadSourceName: "storyAutoload",
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
            previewerVisible: false
        },
        modelRelay: {
            editPageVisibilityMutex: {
                source: "editorVisible",
                target: "previewerVisible",
                singleTransform: {
                    type: "sjrk.storyTelling.transforms.not"
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
            onStorySaveToServerRequested: null,
            onStorySaveToServerComplete: "{storyPreviewer}.events.onShareComplete",
            onStorySaveToServerError: null,
            onStoryPublishRequested: "{storyPreviewer}.events.onShareRequested",
            onStoryPublishError: null
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
            "{storyEditor}.events.onReadyToBind": {
                funcName: "{that}.initializeStory",
                priority: "first",
                namespace: "initializeStory"
            },
            "{storyPreviewer}.events.onStoryViewerPreviousRequested": {
                func: "{that}.showEditorHidePreviewer",
                args: [true],
                namespace: "showEditorHidePreviewer"
            },
            "onStorySaveToServerRequested.saveStoryToServer": {
                funcName: "sjrk.storyTelling.base.page.storyEdit.saveStoryToServer",
                args: [
                    "{that}.options.pageSetup.storySaveUrl",
                    "{storyPreviewer}.story.model",
                    "{that}.events.onStorySaveToServerComplete"
                ]
            },
            "onStoryPublishRequested.publishStory": "{that}.publishStory",
            "onCreate.setAuthoringEnabledClass": {
                func: "{that}.setAuthoringEnabledClass"
            }
        },
        invokers: {
            setAuthoringEnabledClass: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.showEditPageContainer",
                args: ["{that}.options.selectors.pageContainer", "{that}.options.pageSetup.authoringEnabled"]
            },
            showEditorHidePreviewer: {
                func: "{that}.applier.change",
                args: ["editorVisible", "{arguments}.0"]
            },
            clearAutosave: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.clearAutosave",
                args: ["{that}.options.pageSetup.storyAutosaveKey"]
            },
            initializeStory: {
                funcName: "initializeStory",
                args: ["{that}.options.pageSetup.storyAutosaveKey", "{that}"]
            },
            loadStoryfromAutosave: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.loadStoryfromAutosave",
                args: [
                    "{arguments}.0", // the saved story model data
                    "{storyEditor}.story",
                    "{storyEditor}.blockManager",
                    "{that}.options.pageSetup.storyAutoloadSourceName"
                ]
            },
            saveNewStoryToServer: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.saveNewStoryToServer",
                args: [
                    "{that}.options.pageSetup.storySaveUrl",
                    "{storyEditor}.story",
                    "{that}.options.pageSetup.storyIdPath",
                    "{that}.options.pageSetup.storyAutoloadSourceName",
                    "{that}.events.onStorySaveToServerError"
                ]
            },
            publishStory: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.publishStory",
                args: [
                    "{that}.options.pageSetup.storySaveUrl",
                    "{that}.options.pageSetup.viewPageUrl",
                    "{storyEditor}.story.model",
                    "{that}.events.onStoryPublishError"
                ]
            }
        },
        /*
         * For a block of a given type, a block is considered empty unless any
         * one of the fields listed in its corresponding array is truthy.
         *
         * E.g. for an image block, even if heading, altText and description
         * are truthy, if the imageUrl isn't provided then the block is empty.
         */
        blockFields: {
            "text": ["heading", "text"],
            "image": ["imageUrl"],
            "audio": ["mediaUrl"],
            "video": ["mediaUrl"]
        },
        components: {
            // manaages browser history for in-page forward-back support
            historian: {
                type: "gpii.locationBar",
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
     * @param {Component} storyEditPage - an instance of `sjrk.storyTelling.base.page.storyEdit`
     */
    sjrk.storyTelling.base.page.storyEdit.initializeStory = function (storyAutosaveKey, storyEdit) {
        try {
            // localStorage can only store string values
            var savedStoryData = JSON.parse(window.localStorage.getItem(storyAutosaveKey));

            if (savedStoryData) {
                // a story was loaded from autosave, update the current story
                storyEdit.loadStoryfromAutosave(savedStoryData);
            } else {
                // there's no autosaved story, create a new unpublished story
                storyEdit.saveNewStoryToServer();
            }
        } catch (ex) {
            fluid.log(fluid.logLevel.WARN, "An error occurred while initializing story", ex);
        }
    };

    /**
     * Updates the storyEditor's story and blockManager with saved story data
     *
     * @param {Object} savedStoryData - story model data loaded from autosave
     * @param {Component} story - an instance of `sjrk.storyTelling.base.page.storyEdit`
     * @param {Component} blockManager - the storyEditor's blockManager component
     * @param {String} sourceName - the name of the Infusion change source for this update
     */
    sjrk.storyTelling.base.page.storyEdit.loadStoryfromAutosave = function (savedStoryData, story, blockManager, sourceName) {
        // media block blob URLs are no longer valid/reliable after a page reload
        sjrk.storyTelling.base.page.storyEdit.clearMediaBlockUrls(savedStoryData.content);

        story.applier.change("", savedStoryData, null, sourceName);

        // build the blockUIs from the story content array
        blockManager.createBlocksFromData(savedStoryData.content);
    };

    /**
     * Saves a new story to the server and sets the current story's ID accordingly
     *
     * @param {String} storySaveUrl - the server URL at which to save a story
     * @param {Component} story - an instance of `sjrk.storyTelling.story`
     * @param {String|String[]} storyIdPath - the model path to the story ID
     * @param {String} sourceName - the name of the Infusion change source for this update
     * @param {Object} errorEvent - the event to be fired in case of an error
     */
    sjrk.storyTelling.base.page.storyEdit.saveNewStoryToServer = function (storySaveUrl, story, storyIdPath, sourceName, errorEvent) {
        var serverSavePromise = sjrk.storyTelling.base.page.storyEdit.saveStoryToServer(storySaveUrl, story.model);

        serverSavePromise.then(function (data) {
            var successResponse = JSON.parse(data);

            // store the ID on the story model for later use
            story.applier.change(storyIdPath, successResponse.id, null, sourceName);
        }, function (jqXHR, textStatus, errorThrown) {
            fluid.log(fluid.logLevel.WARN, "Something went wrong");
            fluid.log(jqXHR, textStatus, errorThrown);

            errorEvent.fire({
                isError: true,
                message: fluid.get(jqXHR, ["responseJSON", "message"]) || "Internal server error"
            });
        });
    };

    /**
     * Removes the URL values of all media blocks within a collection of blocks
     *
     * @param {Component[]} blocks - a collection of story blocks (sjrk.storyTelling.block)
     *
     * @return {Component[]} - a collection of story blocks with nulled-out URL values
     */
    sjrk.storyTelling.base.page.storyEdit.clearMediaBlockUrls = function (blocks) {
        return fluid.transform(blocks, function (block) {
            if (block.imageUrl) {
                block.imageUrl = null;
            } else if (block.mediaUrl) {
                block.mediaUrl = null;
            }

            return block;
        });
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
     * Saves the story to the server
     *
     * @param {String} storySaveUrl - the server URL at which to save a story
     * @param {Object} storyModel - the model of the story to save
     *
     * @return {jqXHR} - the jqXHR for the server request
     */
    sjrk.storyTelling.base.page.storyEdit.saveStoryToServer = function (storySaveUrl, storyModel) {
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
     * @param {String} storySaveUrl - the server URL at which to save a story
     * @param {String} viewPageUrl - the URL for the story View page
     * @param {Component} story - an instance of `sjrk.storyTelling.story`
     * @param {Object} errorEvent - the event to be fired in case of an error
     */
    sjrk.storyTelling.base.page.storyEdit.publishStory = function (storySaveUrl, viewPageUrl, story, errorEvent) {
        story.applier.change("published", true);

        var storySavePromise = sjrk.storyTelling.base.page.storyEdit.saveStoryToServer(storySaveUrl, story.model);

        storySavePromise.done(function (data) {
            var successResponse = JSON.parse(data);
            sjrk.storyTelling.base.page.storyEdit.redirectToViewStory(successResponse.id, viewPageUrl);
        });

        storySavePromise.fail(function (jqXHR, textStatus, errorThrown) {
            var errorMessage = fluid.get(jqXHR, ["responseJSON", "message"]) ||
                errorThrown ||
                "Internal server error";

            errorEvent.fire({
                isError: true,
                message: errorMessage
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
