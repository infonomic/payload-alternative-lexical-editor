'use client'

import type * as React from 'react'
import { useEffect, useState } from 'react'

import { TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import type { EditorState, LexicalEditor } from 'lexical'

import { useEditorConfig } from './config/editor-config-context'
import { APPLY_VALUE_TAG } from './constants'
import { useSharedHistoryContext } from './context/shared-history-context'
import { useSharedOnChange } from './context/shared-on-change-context'
import { Debug } from './debug'
import { AdmonitionPlugin } from './plugins/admonition-plugin'
import { AutoEmbedPlugin } from './plugins/auto-embed-plugin'
import { CodeHighlightPlugin } from './plugins/code-highlight-plugin'
import { DragDropPaste } from './plugins/drag-drop-paste-plugin'
import { FloatingTextFormatToolbarPlugin } from './plugins/floating-text-format-toolbar-plugin'
import { InlineImagePlugin } from './plugins/inline-image-plugin'
import { LayoutPlugin } from './plugins/layout-plugin/layout-plugin'
import { AutoLinkPlugin } from './plugins/link-plugin/auto-link'
import { LinkPlugin } from './plugins/link-plugin/link'
import { FloatingLinkEditorPlugin } from './plugins/link-plugin/link/floating-link-editor'
import { TableActionMenuPlugin } from './plugins/table-action-menu-plugin'
import { TablePlugin as PayloadTablePlugin } from './plugins/table-plugin'
import { ToolbarPlugin } from './plugins/toolbar-plugin'
import { TreeViewPlugin } from './plugins/treeview-plugin'
import { VimeoPlugin } from './plugins/vimeo-plugin'
import { YouTubePlugin } from './plugins/youtube-plugin'
import { CAN_USE_DOM } from './shared/canUseDOM'
import { ContentEditable } from './ui/content-editable'
import { Placeholder } from './ui/placeholder'

import './editor.css'

export function Editor(): React.JSX.Element {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false)
  const _debugTagLogCountRef = useState(() => ({ count: 0 }))[0]
  const { onChange } = useSharedOnChange()
  const { historyState } = useSharedHistoryContext()
  const {
    config: {
      options: {
        debug,
        richText,
        showTreeView,
        autoFocusPlugin,
        tablePlugin,
        tableActionMenuPlugin,
        layoutPlugin,
        inlineImagePlugin,
        admonitionPlugin,
        links,
        autoLinkPlugin,
        checkListPlugin,
        listPlugin,
        codeHighlightPlugin,
        horizontalRulePlugin,
        markdownShortcutPlugin,
        floatingLinkEditorPlugin,
        floatingTextFormatToolbarPlugin,
        autoEmbedPlugin,
      },
      placeholderText,
      inlineImageUploadCollection,
    },
  } = useEditorConfig()

  const onRef = (_floatingAnchorElem: HTMLDivElement): void => {
    if (_floatingAnchorElem != null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  useEffect(() => {
    const updateViewPortWidth = (): void => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport)
      }
    }
    updateViewPortWidth()
    window.addEventListener('resize', updateViewPortWidth)

    return () => {
      window.removeEventListener('resize', updateViewPortWidth)
    }
  }, [isSmallWidthViewport])

  return (
    <>
      {tablePlugin && <PayloadTablePlugin />}
      {richText && <ToolbarPlugin />}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
          !richText ? 'plain-text' : ''
        }`}
      >
        <DragDropPaste />
        {autoFocusPlugin && <AutoFocusPlugin />}
        {links && <LinkPlugin />}
        {autoEmbedPlugin && <AutoEmbedPlugin />}
        <TabIndentationPlugin />
        {autoLinkPlugin && <AutoLinkPlugin />}
        <OnChangePlugin
          ignoreSelectionChange={true}
          onChange={(editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
            // Ignore any onChange event triggered by focus only
            // console.log('Editor on change called', tags)
            if (process.env.NODE_ENV === 'production' && _debugTagLogCountRef.count < 10) {
              _debugTagLogCountRef.count++
              // eslint-disable-next-line no-console
              console.log('[lexical][top] tags', Array.from(tags))
            }
            if (tags.has(APPLY_VALUE_TAG)) return
            if (!tags.has('focus') || tags.size > 1) {
              if (onChange != null) onChange(editorState, editor, tags)
            }
          }}
        />
        {richText ? (
          <>
            <HistoryPlugin externalHistoryState={historyState} />
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={<Placeholder>{placeholderText}</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {inlineImagePlugin && <InlineImagePlugin collection={inlineImageUploadCollection} />}
            {admonitionPlugin && <AdmonitionPlugin />}
            {checkListPlugin && <CheckListPlugin />}
            {listPlugin && <ListPlugin />}
            {codeHighlightPlugin && <CodeHighlightPlugin />}
            {horizontalRulePlugin && <HorizontalRulePlugin />}
            {layoutPlugin && <LayoutPlugin />}
            {autoEmbedPlugin && <YouTubePlugin />}
            {autoEmbedPlugin && <VimeoPlugin />}
            {markdownShortcutPlugin && <MarkdownShortcutPlugin transformers={TRANSFORMERS} />}
            {tablePlugin && <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />}
            {floatingAnchorElem != null && !isSmallWidthViewport && (
              <>
                {floatingLinkEditorPlugin && (
                  <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                )}
                {tableActionMenuPlugin && (
                  <TableActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={false} />
                )}
                {floatingTextFormatToolbarPlugin && (
                  <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor">
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={<Placeholder>{placeholderText}</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {debug && (
          <>
            <Debug />
            <ClearEditorPlugin />
            <TreeViewPlugin />
          </>
        )}
      </div>
    </>
  )
}
