import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';

const AudioComponent = React.lazy(() => import('./AudioComponent'));

function convertAudioElement(domNode) {
    const audio = domNode;
    if (audio.src.startsWith('file:///')) {
        return null;
    }
    const { src } = audio;
    const node = $createAudioNode({ src });
    return { node };
}


export class AudioNode extends DecoratorNode {

    constructor(
        src,
        key,
    ) {
        super(key);
        this.__src = src;
    }

    static getType() {
        return 'audio';
    }

    static clone(node) {
        return new AudioNode(
            node.__src,
            node.__key,
        );
    }

    static importJSON(serializedNode) {
        const { src } = serializedNode;
        return $createAudioNode({ src });
    }

    exportDOM() {
        const element = document.createElement('audio');
        element.setAttribute('src', this.__src);
        return { element };
    }

    static importDOM() {
        return {
            audio: (node) => ({
                conversion: convertAudioElement,
                priority: 0,
            }),
        };
    }

    exportJSON() {
        return {
            src: this.__src,
            type: 'audio',
            version: 1,
        };
    }

    // View

    createDOM(config) {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.audio;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM() {
        return false;
    }

    getSrc() {
        return this.__src;
    }

    decorate() {
        return (
            <Suspense fallback={null}>
                <AudioComponent
                    src={this.__src}
                    nodeKey={this.getKey()}
                />
            </Suspense>
        );
    }
}
export function $createAudioNode({
    src,
    key,
}) {
    return $applyNodeReplacement(
        new AudioNode(
            src,
            key,
        ),
    );
}

export function $isAudioNode(node) {
    return node instanceof AudioNode;
}