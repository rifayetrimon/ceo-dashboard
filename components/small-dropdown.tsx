'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

const SmallDropdown = (props: any, forwardedRef: any) => {
    const [visibility, setVisibility] = useState<boolean>(false);
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(null);

    const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
        placement: props.placement || 'bottom-end',
        strategy: 'absolute',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: props.offset || [0, 5],
                },
            },
            {
                name: 'preventOverflow',
                options: {
                    padding: 8,
                },
            },
            {
                name: 'flip',
                options: {
                    fallbackPlacements: ['top-end', 'bottom-end', 'top-start', 'bottom-start'],
                },
            },
        ],
    });

    // Update popper position when visibility changes
    useEffect(() => {
        if (visibility && update) {
            update();
        }
    }, [visibility, update]);

    const handleDocumentClick = (event: any) => {
        if (referenceElement?.contains(event.target) || popperElement?.contains(event.target)) {
            return;
        }
        setVisibility(false);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, [referenceElement, popperElement]);

    useImperativeHandle(forwardedRef, () => ({
        close() {
            setVisibility(false);
        },
    }));

    return (
        <div className="dropdown relative">
            <button ref={setReferenceElement} type="button" className={props.btnClassName} onClick={() => setVisibility(!visibility)}>
                {props.button}
            </button>

            {visibility && (
                <ul
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                    className={`z-[9999] min-w-[120px] rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${props.ulClassName || ''}`}
                >
                    {props.children}
                </ul>
            )}
        </div>
    );
};

export default forwardRef(SmallDropdown);
