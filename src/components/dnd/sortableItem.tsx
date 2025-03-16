import React, { PropsWithChildren } from "react";
import {
  type DraggableSyntheticListeners,
  type DraggableAttributes,
} from "@dnd-kit/core";
import { type Transform } from "@dnd-kit/utilities";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  dragOverlay?: boolean;
  listeners?: DraggableSyntheticListeners;
  dragging?: boolean;
  children?: React.ReactNode;
  ref?: (element: HTMLElement | null) => void;
  transform: Transform | null;
  attributes?: DraggableAttributes;
  styles?: React.CSSProperties;
  transition?: string;
};

const SortableItem: React.FC<PropsWithChildren<Props>> = ({
  ref,
  children,
  listeners,
  attributes,
  styles,
  transform,
  transition,
}) => {
  const trasformCssStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={ref}
      {...listeners}
      {...attributes}
      style={
        {
          ...styles,
          ...trasformCssStyle,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default SortableItem;
