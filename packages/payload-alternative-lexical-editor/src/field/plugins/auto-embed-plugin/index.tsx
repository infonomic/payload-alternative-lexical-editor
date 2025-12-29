'use client'

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type * as React from 'react'
import { useMemo, useState } from 'react'

import {
  AutoEmbedOption,
  type EmbedConfig,
  type EmbedMatchResult,
  LexicalAutoEmbedPlugin,
  URL_MATCHER,
} from '@lexical/react/LexicalAutoEmbedPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalEditor } from 'lexical'
import * as ReactDOM from 'react-dom'

import useModal from '../../hooks/useModal'
import Button from '../../ui/button'
import { DialogActions } from '../../ui/dialog'
import { INSERT_VIMEO_COMMAND } from '../vimeo-plugin'
// import { INSERT_FIGMA_COMMAND } from '../FigmaPlugin'
// import { INSERT_TWEET_COMMAND } from '../TwitterPlugin'
import { INSERT_YOUTUBE_COMMAND } from '../youtube-plugin'

interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string

  // Icon for display.
  icon?: React.JSX.Element

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string

  // For extra searching.
  keywords: string[]

  // Embed a Figma Project.
  description?: string
}

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Youtube Video',

  exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',

  // Icon for display.
  icon: <i className="icon youtube" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id)
  },

  keywords: ['youtube', 'video'],

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url)

    const id = match != null ? (match?.[2].length === 11 ? match[2] : null) : null

    if (id != null) {
      return {
        id,
        url,
      }
    }

    return null
  },

  type: 'youtube-video',
}

export const VimeoEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Vimeo Video',

  exampleUrl: 'https://vimeo.com/584985260',

  // Icon for display.
  icon: <i className="icon vimeo" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_VIMEO_COMMAND, result.id)
  },

  keywords: ['vimeo', 'video'],

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match = /https:\/\/vimeo\.com\/(\d{5,10})/.exec(url)
    const id = match != null ? match[1] : null
    if (id != null) {
      return {
        id,
        url,
      }
    }

    return null
  },

  type: 'vimeo-video',
}

// export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
//   // e.g. Tweet or Google Map.
//   contentName: 'Tweet',

//   exampleUrl: 'https://twitter.com/jack/status/20',

//   // Icon for display.
//   icon: <i className="icon tweet" />,

//   // Create the Lexical embed node from the url data.
//   insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
//     editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id)
//   },

//   // For extra searching.
//   keywords: ['tweet', 'twitter'],

//   // Determine if a given URL is a match and return url data.
//   parseUrl: (text: string) => {
//     const match = /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(text)

//     if (match != null) {
//       return {
//         id: match[5],
//         url: match[1]
//       }
//     }

//     return null
//   },

//   type: 'tweet'
// }

// export const FigmaEmbedConfig: PlaygroundEmbedConfig = {
//   contentName: 'Figma Document',

//   exampleUrl: 'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File',

//   icon: <i className="icon figma" />,

//   insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
//     editor.dispatchCommand(INSERT_FIGMA_COMMAND, result.id)
//   },

//   keywords: ['figma', 'figma.com', 'mock-up'],

//   // Determine if a given URL is a match and return url data.
//   parseUrl: (text: string) => {
//     const match =
//       /https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.exec(text)

//     if (match != null) {
//       return {
//         id: match[3],
//         url: match[0]
//       }
//     }

//     return null
//   },

//   type: 'figma'
// }

// export const EmbedConfigs = [TwitterEmbedConfig, YoutubeEmbedConfig, FigmaEmbedConfig]
export const EmbedConfigs = [YoutubeEmbedConfig, VimeoEmbedConfig]

function AutoEmbedMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: AutoEmbedOption
}): React.JSX.Element {
  let className = 'item'
  if (isSelected) {
    className += ' selected'
  }
  return (
    <div
      tabIndex={-1}
      role="option"
      className={className}
      ref={option.setRefElement}
      aria-selected={isSelected}
      id={`typeahead-item-${index}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <span className="text">{option.title}</span>
    </div>
  )
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  selectedItemIndex: number | null
  onOptionClick: (option: AutoEmbedOption, index: number) => void
  onOptionMouseEnter: (index: number) => void
  options: AutoEmbedOption[]
}): React.JSX.Element {
  return (
    <div className="typeahead-popover">
      <div role="listbox" aria-label="Auto embed options">
        {options.map((option: AutoEmbedOption, i: number) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => {
              onOptionClick(option, i)
            }}
            onMouseEnter={() => {
              onOptionMouseEnter(i)
            }}
            key={option.key}
            option={option}
          />
        ))}
      </div>
    </div>
  )
}

const debounce = (callback: (text: string) => void, delay: number): ((text: string) => void) => {
  let timeoutId: number
  return (text: string) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      callback(text)
    }, delay)
  }
}

export function AutoEmbedDialog({
  embedConfig,
  onClose,
}: {
  embedConfig: PlaygroundEmbedConfig
  onClose: () => void
}): React.JSX.Element {
  const [text, setText] = useState('')
  const [editor] = useLexicalComposerContext()
  const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(null)

  const validateText = useMemo(
    () =>
      debounce((inputText: string) => {
        const urlMatch = URL_MATCHER.exec(inputText)
        if (embedConfig != null && inputText != null && urlMatch != null) {
          void Promise.resolve(embedConfig.parseUrl(inputText)).then((parseResult) => {
            setEmbedResult(parseResult)
          })
        } else if (embedResult == null) {
          setEmbedResult(null)
        }
      }, 200),
    [embedConfig, embedResult]
  )

  const onClick = (): void => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult)
      onClose()
    }
  }

  return (
    <div style={{ width: '600px' }}>
      <div className="Input__wrapper">
        <input
          type="text"
          className="Input__input"
          placeholder={embedConfig.exampleUrl}
          value={text}
          data-test-id={`${embedConfig.type}-embed-modal-url`}
          onChange={(e) => {
            const { value } = e.target
            setText(value)
            validateText(value)
          }}
        />
      </div>
      <DialogActions>
        <Button
          disabled={embedResult == null}
          onClick={onClick}
          data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
        >
          Embed
        </Button>
      </DialogActions>
    </div>
  )
}

export function AutoEmbedPlugin(): React.JSX.Element {
  const [modal, showModal] = useModal()

  const openEmbedModal = (embedConfig: PlaygroundEmbedConfig): void => {
    showModal(`Embed ${embedConfig.contentName}`, (onClose) => (
      <AutoEmbedDialog embedConfig={embedConfig} onClose={onClose} />
    ))
  }

  const getMenuOptions = (
    activeEmbedConfig: PlaygroundEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void
  ): AutoEmbedOption[] => {
    return [
      new AutoEmbedOption('Dismiss', {
        onSelect: dismissFn,
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn,
      }),
    ]
  }

  return (
    <>
      {modal}
      <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={openEmbedModal}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current != null
            ? ReactDOM.createPortal(
                <div
                  className="typeahead-popover auto-embed-menu"
                  style={{
                    marginLeft: anchorElementRef.current.style.width,
                    width: 200,
                  }}
                >
                  <AutoEmbedMenu
                    options={options}
                    selectedItemIndex={selectedIndex}
                    onOptionClick={(option: AutoEmbedOption, index: number) => {
                      setHighlightedIndex(index)
                      selectOptionAndCleanUp(option)
                    }}
                    onOptionMouseEnter={(index: number) => {
                      setHighlightedIndex(index)
                    }}
                  />
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  )
}
