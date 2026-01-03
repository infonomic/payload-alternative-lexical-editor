# Payload CMS 3.0 Alternative Lexical Rich Text Editor

An alternative adapter-based Lexical Rich Text adapter for Payload CMS.

> [!IMPORTANT]
> Unless you have very specific needs, or a lot of experience with Lexical and custom Payload fields, you should almost certainly be using the official [Payload Lexical Rich Text editor](https://payloadcms.com/docs/lexical/overview). 
>

Before we dive in, it's also worth mentioning that creating a generalized and extensible editor with a 'pluggable' feature system — such as the one currently being developed the team at Payload, is an order of magnitude more difficult than creating an 'opinionated' adapter with limited extensibility. The Payload team are doing amazing work - and this repo and our editor is in no way a criticism of the work being done at Payload.

## Our Lexical Editor
<img style="width: 100%" alt="lexical-editor-screenshot" src="https://github.com/user-attachments/assets/a41060c9-6f28-4b64-a045-c3fdd411d9af" />

## Background

We started working with [Lexical](https://lexical.dev/) in 2022 while searching for a replacement CMS for our agency. We then discovered [Payload CMS](https://payloadcms.com/) - which ticked nearly every box, with one notable exception - the use of Slate as their rich text editor. We'd worked with Slate and other editors previously and really wanted to use Lexical.

And so we started work on a Lexical-based rich text field for Payload. Early in 2023 we discovered [Alessio Gravili's Payload Lexical Plugin](https://github.com/AlessioGr/payload-plugin-lexical) which helped enormously in getting started with Payload and custom fields. We also attempted to 'give back' to the work Alessio was doing with contributions to his public repo.

Thanks largely to Alessio's efforts, Lexical has now been adopted by the Payload team and is the default editor for Payload, which is fantastic.

In our case, there are still a few issues (and a few opinions) that meant continuing with our own editor is our preferred approach for the moment. We're also very interested in the new [Lexical Extensions](https://lexical.dev/docs/extensions/intro) framework and will likely migrate to this as the Lexical Extensions API becomes stable.

## Rationale

Here are the main drivers for us wanting to maintain our own editor:

1. We'd already created a custom Lexical rich text field (before Lexical was included in Payload) and felt that at the time it would be easier to convert this to an adapter than convert our plugins and nodes to features.

2. As a candidate editor for existing projects - in particular for our Drupal users - we needed an 'across the top' editor [toolbar](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/plugins/toolbar-plugin/index.tsx) including support for `LexicalNestedComposer`. The good news is that a fixed toolbar is on its way to the official Payload Lexical editor.

3. We needed a way to call `setValue` for the RichText field from `LexicalNestedComposer` within our image plugin captions and admonition plugin text, and so created `SharedOnChangeContext`. When versions are enabled, this means that the 'Save Draft, and 'Publish Changes' buttons become 'enabled' when `LexicalNestedComposer` text is changed. Overall, our structure for [context providers](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/editor-context.tsx) for the editor is a little different as well.

4. We wanted control over the serialization of internal links. See the special section below on Editor Links Strategy.

5. In Payload 3.0 - we wanted to experiment with client-only forms using the new field api and `RenderFields`. You can see an example here in our [Admonition plugin](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/plugins/admonition-plugin/admonition-drawer.tsx). This is totally experimental. It works (as far as we can tell) and we're using this for all of our custom components that require modals or drawers with Payload fields.

6. We wanted to share our plugins - in particular our Inline Image plugin which was accepted into the Lexical playground and our Admonition plugin. In fact, our Inline Image plugin was one of the main reasons we chose Lexical as our preferred editor. Try creating a floated inline element that appears correctly in both the admin UI and the front end application - with any of the 'other editors', and you'll see why ;-).  Most of the other plugins in this repo track Lexical Playground plugins and are updated from there.

7. And lastly, we wanted to keep our editor lightweight and fast — in particular for longer documents.

## Editor Links Strategy

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

We've added an additional property called `data`, to which we've added the id, title and slug for the target document. When combined with the relationTo property, this is everything the front end application needs to create a complete link or router link to the target document.

> [!IMPORTANT]
> We have two strategies for populating the data property above. The first, via an `afterRead` hook, and the second via a `beforeChange` hook. You can choose which to implement based on your requirements.
>

### afterRead

When using an `afterRead` hook — we add the `data` property and populated the title and slug for the related document dynamically during document read. Here's our [`afterRead`](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/lexical-after-read-populate-links.ts) field hook. Note however, that for documents that contain more than one or two links, this can add a significant number of document requests for a single source document since the related document for each internal link will need to be retrieved in order to populate our data property (O(n) linear time complexity). In our experience, this can have a major impact on overall performance and user experience.

> [!IMPORTANT]
> 2026-01-03: There is currently a problem with the current implementation of our `afterRead` hook. If `documentA` has a link to `documentB` and `documentB` links back to `documentA`, our `afterRead` hook will end up in an infinite call loop and will eventually overflow. A first attempt to correct this using [Payload hooks Context](https://payloadcms.com/docs/hooks/context) failed.
>

### beforeChange

When using a `beforeChange` hook — we add the `data` property to the document itself when the document is being saved. Here's our [`beforeChange`](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/field/lexical-before-change-populate-links.ts) hook. Obviously this has implications for stale links (source documents who's title or slug may have changed). However, there is no impact on overall performance and user experience, since the source document already contains the data it needs for internal links (O(1) constant time complexity).

The configuration in this repo is using the `beforeChange` strategy, although this can be changed here in the hooks property for the [richtext adapter](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/adapter.ts).

## Editor Architecture

The architecture of our editor is designed to solve the "two-way binding problem" common in rich text editors.

Rich text editors maintain their own complex internal state (the DOM/Virtual DOM). When you try to sync this with React state (props), you often get **infinite loops** (Editor changes $\rightarrow$ React updates $\rightarrow$ Prop changes $\rightarrow$ Editor updates $\rightarrow$ Editor changes...) or **cursor jumping** (re-rendering the editor while typing).

In Payload - the adapter loads our editor via the `rsc-entry.tsx` stub and a component map entry in the [adapter](https://github.com/infonomic/payload-alternative-lexical-editor/blob/main/packages/payload-alternative-lexical-editor/src/adapter.ts). This follows the current adapter / component map strategy in Payload CMS itself. Note: Although the return shape of our editor is slightly different, the root of our editor document and SerializedEditorState is identical to the official Payload Lexical editor, and so migrating to or from the Payload version will depend primarily on what features or plugins have been used. 

### Component Hierarchy 

Once the editor has been 'bootstrapped' from the adapter, the editor field is rendered and managed via the following component hierarchy:

```
+-----------------------------------------------------------------------+
|  EditorField (src/field/editor-field.tsx)                             |
|  - Handles Lazy Loading & Suspense                                    |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|  EditorComponent (src/field/editor-component.tsx)                     |
|  - Connects to Payload Forms (useField)                               |
|  - Manages Hash Refs (lastEmitted, normalizedIncoming)                |
|  - Handles onChange (Debouncing & Hash Checks)                        |
+-----------------------------------+-----------------------------------+
                                    |
                                    | (renders)
                                    v
+-----------------------------------+----------------------------------+
|  EditorContext (src/field/editor-context.tsx)                         |
|  - Wraps everything in <LexicalComposer>                              |
|  - Provides SharedHistory & SharedOnChange Contexts                   |
+------------------+---------------------------------+-----------------+
                   |                                 |
                   | (passed as children)            | (renders)
                   v                                 v
+------------------+------------------+  +-----------+------------------+
| ApplyValuePlugin                    |  | Editor (src/field/editor.tsx)|
| (src/field/apply-value-plugin.tsx)  |  | - ToolbarPlugin              |
|                                     |  | - ContentEditable            |
| - Watches: incoming value & hash    |  | - Floating Toolbars          |
| - Action: editor.update()           |  | - Auto-resize logic          |
|   (Syncs external props -> Editor)  |  +------------------------------+
+-------------------------------------+
```

### Key Relationships
1. `EditorComponent` is the "Brain". It holds the connection to the Payload form state (`useField`) and decides when to update the form value based on hashes.
2. `EditorContext` is the "Bridge". It initializes the Lexical instance (`LexicalComposer`) but doesn't contain the specific logic for syncing values or rendering the UI itself.
3. `ApplyValuePlugin` is the "Synchronizer". It sits inside the Lexical context. When `EditorComponent` receives a new value from the database (or parent), it passes it down here. This plugin forces the Lexical instance to update its state to match.
4. `Editor` is the "View". It handles the visual presentation, toolbars, and the actual `contentEditable` DOM element.

### Stability inside Editor Component

Here's how the `useRef` hooks inside editor-component.tsx solve editor-specific problems:

#### 1. The "Debounce" Ref
**`dispatchFieldUpdateTask`**
*   **Purpose:** Performance.
*   **How it works:** When a user types, Lexical fires `onChange` on every keystroke. We don't want to update the main React state (and trigger re-renders up the tree) 60 times a second.
*   **Mechanism:** This ref stores the ID of the current `requestIdleCallback`. If a user types again before the callback runs, we cancel the old one and start a new one. It ensures we only process the *latest* state when the browser is idle.

#### 2. The "Fresh Props" Refs
**`valueRef`** and **`initialValueRef`**
*   **Purpose:** Accessing state inside `useCallback` without dependencies.
*   **How it works:** The `handleChange` function is memoized via `useCallback`. If we added `value` to its dependency array, `handleChange` would be re-created every time the user typed, breaking our debounce logic.
*   **Mechanism:** We copy the props into these refs on every render. Inside `handleChange`, we read `valueRef.current`. This lets the function stay stable (same memory address) while still seeing the latest data.

#### 3. The "Outbound Loop Breaker"
**`lastEmittedHashRef`**
*   **Purpose:** Preventing the "Echo" loop.
*   **The Problem:** You type "A". The editor emits "A". The parent saves "A" and passes "A" back down as a prop. The editor sees "A" and thinks, "Oh, a new value! I should process this."
*   **The Fix:** Before calling `onChange`, we calculate a hash of the content and store it here.
*   **Logic:** "If the hash I'm about to send is the same as the last one I sent, do nothing."

#### 4. The "Inbound Normalization" Refs
**`normalizedIncomingHashRef`** and **`hasNormalizedBaselineRef`**
*   **Purpose:** Handling Lexical's strictness.
*   **The Problem:** Lexical is opinionated. If you load a value like `{"text": "hello"}`, Lexical might instantly transform it into a more complex structure (adding IDs, versions, etc.). This immediate transformation looks like a "change" event, which might trigger a save before the user has even touched the keyboard.
*   **`normalizedIncomingHashRef`:**
    *   The `ApplyValuePlugin` loads data, waits for Lexical to "settle" (normalize it), and then saves the hash of that *settled* state here.
    *   The `handleChange` function checks this: "Is this 'new' change just the result of the data I just loaded?" If yes, it ignores it.
*   **`hasNormalizedBaselineRef`:**
    *   This acts as a gatekeeper. It starts as `false`.
    *   It prevents the editor from emitting *any* changes until the initial value has been fully loaded and normalized. This stops the editor from accidentally overwriting the database with an empty state during the split-second it takes to mount.

### Summary Flow
1.  **User types:** `handleChange` triggers.
2.  **Debounce:** `dispatchFieldUpdateTask` ensures we wait for a pause.
3.  **Check Baseline:** `hasNormalizedBaselineRef` ensures we aren't just booting up.
4.  **Check Inbound:** `normalizedIncomingHashRef` ensures we aren't just reporting Lexical's own auto-formatting of the data we just gave it.
5.  **Check Outbound:** `lastEmittedHashRef` ensures we aren't reporting the same thing twice.
6.  **Success:** Only then do we call `onChange`.

## Getting Started

### To run the editor examples from within this repo:

1. Clone this repo
2. If you don't already have an instance of MongoDB running locally we've provided a docker composer file and a shell start script. To start `cd mongodb` from the project root. `mkdir data` and then `./mongo.sh up` to start a local instance of MongoDB with a fresh database.
3. In the `apps/next` directory - copy `.env.example` to `.env` (Note: Don't deploy this to production or a public service without changing your PAYLOAD_SECRET).
4. From the root - run `pnpm install` followed by `pnpm dev`.
5. To run a production build - from the root run `pnpm build` followed by `pnpm start`.

### To install and run the editor in your own project.

1. `pnpm add @infonomic/payload-alternative-lexical-editor` or `npm install @infonomic/payload-alternative-lexical-editor`
2. Configure the editor in `payload.config.ts` 

```ts
import { lexicalEditor } from '@infonomic/payload-alternative-lexical-editor'

...
// @ts-expect-error: our return type for editorConfig is slightly different
editor: lexicalEditor(),
...
```
Follow the examples in this repo under apps/next for configuration options and settings for the editor (turning  editor features on or off).

Thoughts, suggestions or contributions more than welcome. We hope that some of this helps. 

