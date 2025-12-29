'use client'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'
import { useEffect, useState } from 'react'

import { Button } from '@payloadcms/ui'
import { Drawer } from '@payloadcms/ui'
import { useModal } from '@payloadcms/ui'
import { TextInput } from '@payloadcms/ui'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_TABLE_COMMAND } from '@lexical/table'

const baseClass = 'rich-text-table-modal'

export function TableDrawer({ drawerSlug }: { drawerSlug: string }): React.JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [activeEditor] = useState(editor)
  const { closeModal } = useModal()

  const [rows, setRows] = useState('5')
  const [columns, setColumns] = useState('5')
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    const row = Number(rows)
    const column = Number(columns)
    if (row !== 0 && row > 0 && row <= 500 && column !== 0 && column > 0 && column <= 50) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [rows, columns])

  const handleOnSubmit = (): void => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows
    })

    closeModal(drawerSlug)
  }

  // TODO - validate
  const handleOnRowsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRows(event.target.value)
  }

  // TODO - validate
  const handleOnColumnsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setColumns(event.target.value)
  }

  return (
    <Drawer slug={drawerSlug} key={drawerSlug} className={baseClass} title="Add table">
      <React.Fragment>
        <TextInput
          path="rows"
          placeholder={'# of rows (1-500)'}
          label="Rows"
          onChange={handleOnRowsChange}
          value={rows}
          data-test-id="table-modal-rows"
        />
        <TextInput
          path="columns"
          placeholder={'# of columns (1-50)'}
          label="Columns"
          onChange={handleOnColumnsChange}
          value={columns}
          data-test-id="table-modal-columns"
        />
        <div
          className="rich-text-table-modal__modal-actions"
          data-test-id="table-model-confirm-insert"
        >
          <Button disabled={isDisabled} onClick={handleOnSubmit}>
            Confirm
          </Button>
        </div>
      </React.Fragment>
    </Drawer>
  )
}

