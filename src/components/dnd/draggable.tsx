import React, { PropsWithChildren } from "react";
import {
  type DraggableSyntheticListeners,
  type DraggableAttributes,
} from "@dnd-kit/core";
import { type Transform } from "@dnd-kit/utilities";

type Props = {
  dragOverlay?: boolean;
  listeners?: DraggableSyntheticListeners;
  dragging?: boolean;
  children?: React.ReactNode;
  ref?: (element: HTMLElement | null) => void;
  transform?: Transform | null;
  attributes?: DraggableAttributes;
  styles?: React.CSSProperties;
};

const Draggable: React.FC<PropsWithChildren<Props>> = ({
  ref,
  children,
  listeners,
  attributes,
  styles,
  transform,
}) => {
  return (
    <div
      ref={ref}
      {...listeners}
      {...attributes}
      style={
        {
          ...styles,
          "--translate-x": `${transform?.x ?? 0}px`,
          "--translate-y": `${transform?.y ?? 0}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default Draggable;
