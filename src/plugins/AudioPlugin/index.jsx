import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
    $createParagraphNode,
    $createRangeSelection,
    $getSelection,
    $insertNodes,
    $isNodeSelection,
    $isRootOrShadowRoot,
    $setSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
} from 'lexical';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { CAN_USE_DOM } from '../../shared/canUseDOM';
import {
    $createAudioNode, 
    $isAudioNode, // Update to check for audio nodes
    AudioNode, 
} from '../../nodes/AudioNode'; 
import Button from '../../ui/Button';
import { DialogActions, DialogButtonsList } from '../../ui/Dialog';
import FileInput from '../../ui/FileInput';
import TextInput from '../../ui/TextInput';

const getDOMSelection = (targetWindow) =>
    CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_AUDIO_COMMAND = 
    createCommand('INSERT_AUDIO_COMMAND'); 

export function InsertAudioUriDialogBody({ onClick }) { // Update component name
    const [src, setSrc] = useState('');
    const isDisabled = src === '';

    return (
        <>
            <TextInput
                label="Audio URL" // Update label
                placeholder="i.e. https://example.com/audio.mp3" // Update placeholder
                onChange={setSrc}
                value={src}
                data-test-id="audio-modal-url-input" // Update data-test-id
            />
            <DialogActions>
                <Button
                    data-test-id="audio-modal-confirm-btn" // Update data-test-id
                    disabled={isDisabled}
                    onClick={() => onClick({ src })}>
                    Confirm
                </Button>
            </DialogActions>
        </>
    );
}

export function InsertAudioUploadedDialogBody({ // Update component name
    onClick,
}) {
    const [src, setSrc] = useState('');
    const isDisabled = src === '';

    const loadAudio = (files) => { // Update function name and behavior
        const reader = new FileReader();
        reader.onload = function () {
            if (typeof reader.result === 'string') {
                setSrc(reader.result);
            }
            return '';
        };
        if (files !== null) {
            reader.readAsDataURL(files[0]); // Update to read audio files
        }
    };

    return (
        <>
            <FileInput
                label="Audio Upload" // Update label
                onChange={loadAudio} // Update onChange function
                accept="audio/*" // Update accept attribute
                data-test-id="audio-modal-file-upload" // Update data-test-id
            />
            <DialogActions>
                <Button
                    data-test-id="audio-modal-file-upload-btn" // Update data-test-id
                    disabled={isDisabled}
                    onClick={() => onClick({ src })}>
                    Confirm
                </Button>
            </DialogActions>
        </>
    );
}

export function InsertAudioDialog({ // Update component name
    activeEditor,
    onClose,
}) {
    const [mode, setMode] = useState(null);
    const hasModifier = useRef(false);

    useEffect(() => {
        hasModifier.current = false;
        const handler = (e) => {
            hasModifier.current = e.altKey;
        };
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
        };
    }, [activeEditor]);

    const onClick = (payload) => {
        activeEditor.dispatchCommand(INSERT_AUDIO_COMMAND, payload); 
        onClose();
    };

    return (
        <>
            {!mode && (
                <DialogButtonsList>
                    <Button
                        data-test-id="audio-modal-option-url"
                        onClick={() => setMode('url')}>
                        URL
                    </Button>
                    <Button
                        data-test-id="audio-modal-option-file"
                        onClick={() => setMode('file')}>
                        File
                    </Button>
                </DialogButtonsList>
            )}
            {mode === 'url' && <InsertAudioUriDialogBody onClick={onClick} />} 
            {mode === 'file' && <InsertAudioUploadedDialogBody onClick={onClick} />} 
        </>
    );
}

export default function AudioPlugin({ 
    captionsEnabled,
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([AudioNode])) { 
            throw new Error('AudioPlugin: AudioNode not registered on editor'); 
        }

        return mergeRegister(
            editor.registerCommand(
                INSERT_AUDIO_COMMAND, 
                (payload) => {
                    const audioNode = $createAudioNode(payload); 
                    $insertNodes([audioNode]);
                    if ($isRootOrShadowRoot(audioNode.getParentOrThrow())) {
                        $wrapNodeInElement(audioNode, $createParagraphNode).selectEnd();
                    }

                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    return onDragStart(event);
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand(
                DRAGOVER_COMMAND,
                (event) => {
                    return onDragover(event);
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DROP_COMMAND,
                (event) => {
                    return onDrop(event, editor);
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [captionsEnabled, editor]);

    return null;
}

const audio = document.createElement('audio');

function onDragStart(event) {
    const node = getAudioNodeInSelection(); // Update function to handle audio nodes
    if (!node) {
        return false;
    }
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) {
        return false;
    }
    dataTransfer.setData('text/plain', '_');
    dataTransfer.setDragImage(audio, 0, 0);
    dataTransfer.setData(
        'application/x-lexical-drag',
        JSON.stringify({
            data: {
                key: node.getKey(), 
                src: node.__src, 
            },
            type: 'audio', 
        }),
    );

    return true;
}

function onDragover(event) {
    const node = getAudioNodeInSelection(); // Update function to handle audio nodes
    if (!node) {
        return false;
    }
    if (!canDropAudio(event)) { // Update function to handle audio nodes
        event.preventDefault();
    }
    return true;
}

function onDrop(event, editor) {
    const node = getAudioNodeInSelection(); // Update function to handle audio nodes
    if (!node) {
        return false;
    }
    const data = getDragAudioData(event); // Update function to handle audio nodes
    if (!data) {
        return false;
    }
    event.preventDefault();
    if (canDropAudio(event)) { // Update function to handle audio nodes
        const range = getDragSelection(event);
        node.remove();
        const rangeSelection = $createRangeSelection();
        if (range !== null && range !== undefined) {
            rangeSelection.applyDOMRange(range);
        }
        $setSelection(rangeSelection);
        editor.dispatchCommand(INSERT_AUDIO_COMMAND, data); 
    }
    return true;
}

function getAudioNodeInSelection() {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
        return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isAudioNode(node) ? node : null; 
}

function getDragAudioData(event) {
    const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
    if (!dragData) {
        return null;
    }
    const { type, data } = JSON.parse(dragData);
    if (type !== 'audio') { 
        return null;
    }

    return data;
}

function canDropAudio(event) { // Update function to handle audio nodes
    const target = event.target;
    return !!(
        target &&
        target instanceof HTMLElement &&
        !target.closest('span.editor-audio') && // Update class name
        target.parentElement &&
        target.parentElement.closest('div.ContentEditable__root') // Update class name
    );
}

function getDragSelection(event) {
    let range;
    const target = event.target;
    const targetWindow =
        target == null
            ? null
            : target.nodeType === 9
                ? (target).defaultView
                : (target).ownerDocument.defaultView;
    const domSelection = getDOMSelection(targetWindow);
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
    } else if (event.rangeParent && domSelection !== null) {
        domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
        range = domSelection.getRangeAt(0);
    } else {
        throw Error(`Cannot get the selection when dragging`);
    }

    return range;
}
