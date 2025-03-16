import React, { PropsWithChildren } from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";

interface Props {
  children: React.ReactNode;
  dragging?: boolean;
  id: UniqueIdentifier;
  styles?: React.CSSProperties;
  data: {
    accepts: string[];
    type: string;
    colIndex?: number;
    rowIndex?: number;
  };
}

const Droppable: React.FC<PropsWithChildren<Props>> = ({
  children,
  id,
  data,
  styles,
}) => {
  const { setNodeRef } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      aria-label="Droppable region"
      style={{
        ...styles,
      }}
    >
      {children}
    </div>
  );
};

export default Droppable;
