'use client'

/**
 * Portions copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from https://github.com/payloadcms/payload/tree/main/packages/richtext-lexical
 */

import type React from 'react'
import { memo, useCallback, useMemo, useRef } from 'react'

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  useEditDepth,
  useField,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import type { EditorState, SerializedEditorState } from 'lexical'
import type { Validate } from 'payload'
import { ErrorBoundary } from 'react-error-boundary'

import { validateFn } from '../validate/validate-server'
import { ApplyValuePlugin } from './apply-value-plugin'
import { EditorContext } from './editor-context'
import { hashSerializedState } from './utils/hashSerializedState'
import type { EditorFieldProps } from '../types'

import './editor-component.css'
import './themes/lexical-editor-theme.css'

const baseClass = 'lexicalRichTextEditor'

// We memoize the EditorComponent to prevent re-renders from parent components or
// other editor instances. Only internal state changes for a given (this)
// editor instance should trigger re-renders.
export const EditorComponent = memo(function EditorComponent(
  props: EditorFieldProps
): React.JSX.Element {
  const {
    editorConfig,
    field,
    field: {
      name,
      admin: { className, description, readOnly: readOnlyFromAdmin } = {},
      label,
      localized,
      required,
    },
    path: pathFromProps,
    readOnly: readOnlyFromTopLevelProps,
    validate = validateFn,
  } = props

  const readOnlyFromProps = readOnlyFromTopLevelProps || readOnlyFromAdmin
  const path = pathFromProps ?? name

  const editDepth = useEditDepth()

  const memoizedValidate = useCallback<Validate>(
    (value, validationOptions) => {
      if (typeof validate === 'function') {
        return validate(value, {
          ...validationOptions,
          required,
          type: field.type ?? 'richText',
          name,
        })
      }
      return true
    },
    // Important: do not add props to the dependencies array.
    // This would cause an infinite loop and endless re-rendering.
    // Removing props from the dependencies array fixed this issue: https://github.com/payloadcms/payload/issues/3709
    [validate, required, field.type, name]
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error: ErrorComponent, Label } = {},
    disabled: disabledFromField,
    initialValue,
    setValue,
    showError,
    value,
  } = useField<SerializedEditorState>({
    path: pathFromProps ?? name,
    validate: memoizedValidate,
  })

  const disabled = readOnlyFromProps || disabledFromField // || false

  const lastEmittedHashRef = useRef<string | undefined>(undefined)
  const normalizedIncomingHashRef = useRef<string | undefined>(undefined)
  const hasNormalizedBaselineRef = useRef<boolean>(false)
  const _debugLogCountRef = useRef<number>(0)

  const classes = [
    baseClass,
    'field-type',
    className,
    showError && 'error',
    disabled && `${baseClass}--read-only`,
    editorConfig.admin?.hideGutter !== true ? `${baseClass}--show-gutter` : null,
  ]
    .filter(Boolean)
    .join(' ')

  const pathWithEditDepth = `${path}.${editDepth}`

  const dispatchFieldUpdateTask = useRef<number>(undefined)

  const valueRef = useRef(value)
  valueRef.current = value
  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue

  // Debounce editor as per this Payload PR and commit:
  // https://github.com/payloadcms/payload/pull/12086/files
  // https://github.com/payloadcms/payload/commit/1d5d96d
  const handleOnChange = useCallback(
    (editorState: EditorState, _editor: unknown, tags?: Set<string>) => {
      const _capturedTags = tags != null ? Array.from(tags) : []

      const updateFieldValue = (editorState: EditorState) => {
        const newState = editorState.toJSON()
        const nextHash = hashSerializedState(newState)

        // If we have an incoming form value but haven't established a normalized baseline yet,
        // ignore mount-time normalization updates (often appear as tags: []).
        if (
          (valueRef.current ?? initialValueRef.current) != null &&
          hasNormalizedBaselineRef.current !== true
        ) {
          // if (process.env.NODE_ENV === 'production' && _debugLogCountRef.current < 10) {
          //   _debugLogCountRef.current++
          //   // eslint-disable-next-line no-console
          //   console.log('[lexical][payload][skip] waiting baseline', {
          //     tags: _capturedTags,
          //     nextHash,
          //     normalizedIncomingHash: normalizedIncomingHashRef.current,
          //     lastEmittedHash: lastEmittedHashRef.current,
          //   })
          // }
          return
        }

        // Prefer comparing against Lexical-normalized incoming JSON (critical for nested editors).
        if (
          normalizedIncomingHashRef.current != null &&
          nextHash === normalizedIncomingHashRef.current
        ) {
          return
        }

        // Also avoid re-emitting the exact same state multiple times.
        if (lastEmittedHashRef.current != null && nextHash === lastEmittedHashRef.current) return

        lastEmittedHashRef.current = nextHash

        // if (process.env.NODE_ENV === 'production' && _debugLogCountRef.current < 10) {
        //   _debugLogCountRef.current++
        //   // eslint-disable-next-line no-console
        //   console.log('[lexical][payload][setValue]', {
        //     tags: _capturedTags,
        //     nextHash,
        //     normalizedIncomingHash: normalizedIncomingHashRef.current,
        //     rawIncomingHash: rawIncomingHashRef.current,
        //     lastEmittedHash: lastEmittedHashRef.current,
        //   })
        // }

        setValue(newState)
      }

      if (typeof window.requestIdleCallback === 'function') {
        // Cancel earlier scheduled value updates,
        // so that a CPU-limited event loop isn't flooded with n callbacks for n keystrokes into the rich text field,
        // but that there's only ever the latest one state update
        // dispatch task, to be executed with the next idle time,
        // or the deadline of 500ms.
        if (typeof window.cancelIdleCallback === 'function' && dispatchFieldUpdateTask.current) {
          cancelIdleCallback(dispatchFieldUpdateTask.current)
        }
        // Schedule the state update to happen the next time the browser has sufficient resources,
        // or the latest after 500ms.
        dispatchFieldUpdateTask.current = requestIdleCallback(() => updateFieldValue(editorState), {
          timeout: 500,
        })
      } else {
        updateFieldValue(editorState)
      }
    },
    [setValue]
  )

  const styles = useMemo(() => mergeFieldStyles(field), [field])

  const incomingValue = value ?? initialValue

  const incomingHash = useMemo(
    () => (incomingValue != null ? hashSerializedState(incomingValue) : undefined),
    [incomingValue]
  )

  return (
    <div className={classes} key={pathWithEditDepth} style={styles}>
      <div className={`${baseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={ErrorComponent}
          Fallback={<FieldError path={path} showError={showError} />}
        />
        <RenderCustomComponent
          CustomComponent={Label}
          Fallback={
            <FieldLabel label={label} localized={localized} path={path} required={required} />
          }
        />
        <ErrorBoundary fallbackRender={fallbackRender} onReset={() => {}}>
          <RenderCustomComponent CustomComponent={BeforeInput} Fallback={null} />
          <EditorContext
            composerKey={pathWithEditDepth}
            editorConfig={editorConfig}
            fieldProps={props}
            onChange={handleOnChange}
            readOnly={disabled}
            value={incomingValue}
            // NOTE: 2023-05-15 disabled the deepEqual since we've set ignoreSelectionChange={true}
            // in our OnChangePlugin instances - and so a call here means that something
            // must have changed - so no need to do the comparison.
            // onChange={(editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
            //   if (!disabled) {
            //     const serializedEditorState = editorState.toJSON()
            //     // TODO: 2024-01-30 - re-test this.
            //     // NOTE: 2023-06-28 fix for setValue below. For some reason when
            //     // this custom field is used in a block field, setValue on its
            //     // own won't enable Save Draft or Publish Changes during a first
            //     // add of a new block (it will after the entire document is saved
            //     // and reloaded - but not before.) So call setModified(true) here
            //     // to guarantee that we can always save our changes.
            //     // setModified(true)
            //     // NOTE: 2024-05-02: Appears to be fixed - and setModified(true)
            //     // is no longer required.
            //     setValue(serializedEditorState)
            //   }
            // }}
          >
            <ApplyValuePlugin
              value={incomingValue}
              incomingHash={incomingHash}
              lastEmittedHashRef={lastEmittedHashRef}
              normalizedIncomingHashRef={normalizedIncomingHashRef}
              hasNormalizedBaselineRef={hasNormalizedBaselineRef}
            />
          </EditorContext>
          <RenderCustomComponent CustomComponent={AfterInput} Fallback={null} />
        </ErrorBoundary>
        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={description} path={path} />}
        />
      </div>
    </div>
  )
})

function fallbackRender({ error, resetErrorBoundary }: any): React.JSX.Element {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div className="errorBoundary" role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}
