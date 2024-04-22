import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    $isRangeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DRAGSTART_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { $isAudioNode } from './AudioNode';

export const RIGHT_CLICK_AUDIO_COMMAND =
    createCommand('RIGHT_CLICK_AUDIO_COMMAND');

function PreloadedAudio({
    audioRef,
    src,
}) {
    return (
        <audio
            src={src}
            ref={audioRef}
            controls
            preload="auto"
            draggable="false"
        />
    );
}

export default function AudioComponent({
    src,
    nodeKey,
}) {
    const audioRef = useRef(null);
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState(null);
    const activeEditorRef = useRef(null);

    const onDelete = useCallback(
        (payload) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if ($isAudioNode(node)) { // Update to check for AudioNode
                    node.remove();
                    return true;
                }
            }
            return false;
        },
        [isSelected, nodeKey],
    );

    const onClick = useCallback(
        (payload) => {
            const event = payload;

            if (event.target === audioRef.current) { // Update to reference audio element
                if (event.shiftKey) {
                    setSelected(!isSelected);
                } else {
                    clearSelection();
                    setSelected(true);
                }
                return true;
            }

            return false;
        },
        [isSelected, setSelected, clearSelection],
    );

    const onRightClick = useCallback(
        (event) => {
            editor.getEditorState().read(() => {
                const latestSelection = $getSelection();
                const domElement = event.target;
                if (
                    domElement.tagName === 'audio' && // Update to check for AUDIO tag
                    $isRangeSelection(latestSelection) &&
                    latestSelection.getNodes().length === 1
                ) {
                    editor.dispatchCommand(
                        RIGHT_CLICK_AUDIO_COMMAND, 
                        event,
                    );
                }
            });
        },
        [editor],
    );


    useEffect(() => {
        let isMounted = true;
        const rootElement = editor.getRootElement();
        const unregister = mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                if (isMounted) {
                    setSelection(editorState.read(() => $getSelection()));
                }
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_, activeEditor) => {
                    activeEditorRef.current = activeEditor;
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CLICK_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                RIGHT_CLICK_AUDIO_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
                        // TODO This is just a temporary workaround for FF to behave like other browsers.
                        // Ideally, this handles drag & drop too (and all browsers).
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW,
            ),
        );

        rootElement?.addEventListener('contextmenu', onRightClick);

        return () => {
            isMounted = false;
            unregister();
            rootElement?.removeEventListener('contextmenu', onRightClick);
        };
    }, [
        clearSelection,
        editor,
        isSelected,
        nodeKey,
        onDelete,
        onClick,
        onRightClick,
        setSelected,
    ]);

    // Implement other functionalities like resizing, context menu, etc.

    const draggable = isSelected && $isNodeSelection(selection);
    return (
        <Suspense fallback={null}>
            <>
                <div draggable={draggable}>
                    <PreloadedAudio
                        src={src}
                        audioRef={audioRef}
                    />
                </div>
            </>
        </Suspense>
    );
}
