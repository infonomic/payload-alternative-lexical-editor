# Payload CMS 3.0 Alternative Lexical Rich Text Editor

This is a Payload 3.0 demo with a custom Lexical Rich Text adapter.

NOTE: 2025-12-29 - the Lexical editor/adapter has been moved into `packages/payload-alternative-lexical-editor` and will be published to npm soon.

> [!IMPORTANT]
> Unless you have very specific needs, or a lot of experience with Lexical and custom Payload fields, you should almost certainly be using the new and official [Payload Lexical Rich Text editor](https://payloadcms.com/docs/lexical/overview). 
>

It's also important to mention that creating a generalized and extensible editor with a 'pluggable' feature system - such as the one currently being developed by Alessio and the team at Payload, is an order of magnitude more difficult than creating an 'opinionated' adapter with zero extensibility. The Payload team are doing amazing work - and this repo and our editor is in no way a criticism of the work being done at Payload.

## Our Lexical Editor
<img style="width: 100%" alt="lexical-editor-screenshot" src="https://github.com/user-attachments/assets/a41060c9-6f28-4b64-a045-c3fdd411d9af" />

## Background

We started working with [Lexical](https://lexical.dev/) in 2022 while searching for a replacement CMS for our agency. We then discovered [Payload CMS](https://payloadcms.com/) - which ticked nearly every box, with one notable exception - the use of Slate as their rich text editor. We'd worked with Slate and other editors previously and really wanted to use Lexical.

And so we started work on a Lexical-based rich text field for Payload. Early in 2023 we discovered [Alessio Gravili's Payload Lexical Plugin](https://github.com/AlessioGr/payload-plugin-lexical) which helped enormously in getting started with Payload and custom fields. We also attempted to 'give back' to the work Alessio was doing with contributions to his public repo.

Thanks largely to Alessio's efforts, Lexical has now been adopted by the Payload team and is on its way to becoming the default editor for Payload, which is fantastic.

There are still however, a few cases that meant for us, continuing with our own editor is our preferred approach for the moment, although it's likely that most of these issues will be resolved over time and we'll eventually shift to converting our Lexical plugins to official Payload Lexical features.

## Rationale

Here are the main drivers for us wanting to maintain our own editor:

1. We'd already created a custom Lexical rich text field (before Lexical was included in Payload) and felt that at the time it would be easier to convert this to an adapter than convert our plugins and nodes to features.

2. As a candidate editor for existing projects - in particular for our Drupal users - we needed an 'across the top' editor [toolbar](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/plugins/toolbar-plugin/index.tsx) including support for `LexicalNestedComposer`. The good news is that a fixed toolbar is on its way to the official Payload Lexical editor.

3. We needed a way to call `setValue` for the RichText field from `LexicalNestedComposer` within our image plugin captions and admonition plugin text, and so created `SharedOnChangeContext`. When versions are enabled, this means that the 'Save Draft, and 'Publish Changes' buttons become 'enabled' when `LexicalNestedComposer` text is changed. Overall, our structure for [context providers](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/editor-context.tsx) for the editor is a little different as well.

4. We wanted control over the serialization of internal links. See the special section below on Richtext Internal Links Strategy.

5. In Payload 3.0 - we wanted to experiment with client-only forms using the new field api and `RenderFields`. You can see an example here in our [Admonition plugin](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/plugins/admonition-plugin/admonition-drawer.tsx). This is totally experimental. It works (as far as we can tell) and we're using this for all of our custom components that require modals or drawers with Payload fields.

6. We wanted to share our plugins - in particular our Inline Image plugin which was accepted into the Lexical playground and our Admonition plugin. In fact, our Inline Image plugin was one of the main reasons we chose Lexical as our preferred editor. Try creating a floated inline element that appears correctly in both the admin editor and the front end application - inside any of the 'other editors', and you'll see why ;-).  Most of the other plugins in this repo track Lexical Playground plugins and are updated from there.

7. And lastly, we wanted to keep our editor lightweight and fast, in particular for longer documents.

## Richtext Internal Links Strategy

As mentioned in the rationale section above, we wanted control over the serialization of internal links. Instead of retrieving and populating an entire document for each internal link in the editor via an `afterRead` field hook, we wanted to augment the relationship with just the slug and title. 

Here's our version of the Lexical link node:

```json
{
  "direction": "ltr",
  "format": "",
  "indent": 0,
  "type": "link",
  "version": 2,
  "attributes": {
    "newTab": false,
    "linkType": "internal",
    "doc": {
    "value": "6635e07947922a2b9194d9a2",
    "relationTo": "minimal",
    "data": {
      "id": "6635e07947922a2b9194d9a2",
      "title": "This is a Test Minimal Page",
      "slug": "this-is-a-test-minimal-page"
      }
    },
  "text": "Click Me!"
}
```

We've added an additional property called `data`, to which we've added the id, title and slug for the target document. When combined with the relationTo property - this is everything the front end application needs to create a complete link or router link to the target document.

> [!IMPORTANT]
> We have two strategies for populating the data property above. The first, via an `afterRead` hook, and the second via a `beforeChange` hook. You can choose which to implement based on your requirements.
>

### afterRead

When using an `afterRead` hook -  we add the `data` property and populated the title and slug for the related document dynamically during document read. Here's our [`afterRead`](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/lexical-after-read-populate-links.ts) field hook. Note however, that for documents that contain more than one or two links, this can add a significant number of document requests for a single source document since the related document for each internal link will need to be retrieved in order to populate our data property (O(n) linear time complexity). In our experience, this can have a major impact on overall performance and user experience.

### beforeChange

When using a `beforeChange` hook - we add the `data` property to the document itself when the document is being saved. Here's our [`beforeChange`](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/lexical-before-change-populate-links.ts) hook. Obviously this has implications for stale links (source documents who's title or slug may have changed). However, there is no impact on overall performance and user experience, since the source document already contains the data it needs for internal links (O(1) constant time complexity).

The configuration in this repo is using the `beforeChange` strategy, although this can be changed here in the hooks property for the [richtext adapter](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/adapter.ts).



## Getting Started

1. Clone this repo
2. If you don't already have an instance of MongoDB running locally we've provided a docker composer file and a shell start script. To start `cd mongodb` from the project root. `mkdir data` and then `./mongo.sh up` to start a local instance of MongoDB with a fresh database.
3. In the `apps/next` directory - copy `.env.example` to `.env` (Note: Don't deploy this to production or a public service without changing your PAYLOAD_SECRET).
4. From the root - run `pnpm install` followed by `pnpm dev`.
5. To run a production build - from the root run `pnpm build` followed by `pnpm start`.

Thoughts, suggestions or contributions more than welcome. We hope that some of this helps. 

