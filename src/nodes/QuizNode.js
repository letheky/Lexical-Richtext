import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import { EmojiNode } from './EmojiNode';
import { ImageNode } from './ImageNode';
import { LayoutContainerNode } from './LayoutContainerNode';
import { LayoutItemNode } from './LayoutItemNode';
import { YouTubeNode } from './YouTubeNode';

const QuizNodes = [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    AutoLinkNode,
    LinkNode,
    OverflowNode,
    ImageNode,
    EmojiNode,
    HorizontalRuleNode,
    YouTubeNode,
    LayoutContainerNode,
    LayoutItemNode,
];

export default QuizNodes;