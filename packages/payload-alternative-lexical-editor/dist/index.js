/**
 * Portions copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from https://github.com/payloadcms/payload/tree/main/packages/richtext-lexical
 */
import { withNullableJSONSchemaType } from 'payload';
import { defaultEditorConfig } from './field/config/default';
import { populateLexicalMedia } from './field/lexical-after-read-populate-media';
import { populateLexicalLinks } from './field/lexical-before-change-populate-links';
import { cloneDeep } from './field/utils/cloneDeep';
import { richTextValidate } from './validate/validate-server';
// TODO: sanitize / validate all inputs (okay for now as we control all inputs)
export function lexicalEditor(args) {
    let settings;
    if (args?.settings != null) {
        settings =
            args.settings != null && typeof args.settings === 'function'
                ? args?.settings(cloneDeep(defaultEditorConfig.settings))
                : null;
        if (settings == null) {
            settings = cloneDeep(defaultEditorConfig.settings);
        }
    }
    else {
        settings = cloneDeep(defaultEditorConfig.settings);
    }
    const lexical = args?.lexical != null ? args.lexical : defaultEditorConfig.lexical;
    const editorConfig = {
        settings,
        lexical,
    };
    return {
        CellComponent: {
            path: '/_payload/adapters/richtext-lexical/cell/rsc-entry#RscEntryLexicalCell',
            serverProps: {
                admin: args?.admin,
                editorConfig,
            },
        },
        FieldComponent: {
            path: '/_payload/adapters/richtext-lexical/field/rsc-entry#RscEntryLexicalField',
            serverProps: {
                admin: args?.admin,
                editorConfig,
            },
        },
        editorConfig,
        i18n: undefined,
        generateImportMap: ({ addToImportMap }) => {
            addToImportMap('/_payload/adapters/richtext-lexical/cell/rsc-entry#RscEntryLexicalCell');
            addToImportMap('/_payload/adapters/richtext-lexical/field/rsc-entry#RscEntryLexicalField');
        },
        generateSchemaMap: undefined,
        hooks: {
            afterRead: [populateLexicalMedia],
            beforeChange: [populateLexicalLinks],
        },
        // NOTE: Directly from https://github.com/payloadcms/payload/blob/main/packages/richtext-lexical/src/index.ts
        outputSchema: ({ collectionIDFieldTypes, config, field, i18n, interfaceNameDefinitions, isRequired, }) => {
            const outputSchema = {
                // This schema matches the SerializedEditorState type so far, that it's possible to cast SerializedEditorState to this schema without any errors.
                // In the future, we should
                // 1) allow recursive children
                // 2) Pass in all the different types for every node added to the editorconfig. This can be done with refs in the schema.
                type: withNullableJSONSchemaType('object', isRequired),
                properties: {
                    root: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            type: {
                                type: 'string',
                            },
                            children: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    additionalProperties: true,
                                    properties: {
                                        type: {
                                            type: 'string',
                                        },
                                        version: {
                                            type: 'integer',
                                        },
                                    },
                                    required: ['type', 'version'],
                                },
                            },
                            direction: {
                                oneOf: [
                                    {
                                        enum: ['ltr', 'rtl'],
                                    },
                                    {
                                        type: 'null',
                                    },
                                ],
                            },
                            format: {
                                type: 'string',
                                enum: ['left', 'start', 'center', 'right', 'end', 'justify', ''], // ElementFormatType, since the root node is an element
                            },
                            indent: {
                                type: 'integer',
                            },
                            version: {
                                type: 'integer',
                            },
                        },
                        required: ['children', 'direction', 'format', 'indent', 'type', 'version'],
                    },
                },
                required: ['root'],
            };
            return outputSchema;
        },
        validate: richTextValidate,
    };
}
//# sourceMappingURL=index.js.map