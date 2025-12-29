/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { AdmonitionNode } from './admonition-node/admonition-node'
import { InlineImageNode } from './inline-image-node/inline-image-node'
import { LayoutContainerNode } from './layout-container-node/layout-container-node'
import { LayoutItemNode } from './layout-container-node/layout-item-node'
import { AutoLinkNode, LinkNode } from './link-nodes'
import { YouTubeNode } from './youtube-node'
import { VimeoNode } from './vimeo-node'

import type { Klass, LexicalNode } from 'lexical'

export const Nodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  InlineImageNode,
  HorizontalRuleNode,
  MarkNode,
  AdmonitionNode,
  YouTubeNode,
  VimeoNode,
  LayoutContainerNode,
  LayoutItemNode
]
