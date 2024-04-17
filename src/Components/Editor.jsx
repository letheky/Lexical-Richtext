// Provided plugin here
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';

import React from 'react';
import { useEffect, useState } from 'react';
import { CAN_USE_DOM } from '../shared/canUseDOM';

// Custom thing import here
import {useSharedHistoryContext} from '../context/SharedHistoryContext';
import ActionsPlugin from '../plugins/ActionsPlugin';
import AutoEmbedPlugin from '../plugins/AutoEmbedPlugin';
import AutoLinkPlugin from '../plugins/AutoLinkPlugin';
import ComponentPickerPlugin from '../plugins/ComponentPickerPlugin';
import ContextMenuPlugin from '../plugins/ContextMenuPlugin';
import DragDropPaste from '../plugins/DragDropPastePlugin';
import DraggableBlockPlugin from '../plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from '../plugins/EmojiPickerPlugin';
import EmojisPlugin from '../plugins/EmojisPlugin';
import FloatingLinkEditorPlugin from '../plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from '../plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from '../plugins/ImagesPlugin';
import { LayoutPlugin } from '../plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from '../plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from '../plugins/ListMaxIndentLevelPlugin';
// import {MaxLengthPlugin} from '../plugins/MaxLengthPlugin';
import YouTubePlugin from '../plugins/YouTubePlugin';
import TabFocusPlugin from '../plugins/TabFocusPlugin';
import ToolbarPlugin from '../plugins/ToolbarPlugin';
import ContentEditable from '../ui/ContentEditable';
import Placeholder from '../ui/Placeholder';

export default function Editor() {
    const {historyState} = useSharedHistoryContext();
    const isEditable = useLexicalEditable();
    const placeholder = <Placeholder>Create question here...</Placeholder>;
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] =
        useState(false);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    const onRef = (_floatingAnchorElem) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    useEffect(() => {
        const updateViewPortWidth = () => {
            const isNextSmallWidthViewport =
                CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

            if (isNextSmallWidthViewport !== isSmallWidthViewport) {
                setIsSmallWidthViewport(isNextSmallWidthViewport);
            }
        };
        updateViewPortWidth();
        window.addEventListener('resize', updateViewPortWidth);

        return () => {
            window.removeEventListener('resize', updateViewPortWidth);
        };
    }, [isSmallWidthViewport]);

    return (
        <>
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            <div className='editor-container'>
                {/* {isMaxLength && <MaxLengthPlugin maxLength={30} />} */}
                <DragDropPaste />
                <AutoFocusPlugin />
                <ClearEditorPlugin />
                <ComponentPickerPlugin />
                <EmojiPickerPlugin />
                <AutoEmbedPlugin />
                <EmojisPlugin />
                <AutoLinkPlugin />
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
                        placeholder={placeholder}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <ListPlugin />
                    <CheckListPlugin />
                    <ListMaxIndentLevelPlugin maxDepth={7} />
                    <ImagesPlugin />
                    <LinkPlugin />
                    <YouTubePlugin />
                    <LexicalClickableLinkPlugin disabled={isEditable} />
                    <HorizontalRulePlugin />
                    <TabFocusPlugin />
                    <TabIndentationPlugin />
                    <LayoutPlugin />
                    {floatingAnchorElem && !isSmallWidthViewport && (
                        <>
                            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                            <FloatingLinkEditorPlugin
                                anchorElem={floatingAnchorElem}
                                isLinkEditMode={isLinkEditMode}
                                setIsLinkEditMode={setIsLinkEditMode}
                            />
                            <FloatingTextFormatToolbarPlugin
                                anchorElem={floatingAnchorElem}
                                setIsLinkEditMode={setIsLinkEditMode}
                            />
                        </>
                    )}
                </>
                <ContextMenuPlugin />
                <ActionsPlugin />
            </div>
        </>
    );
}