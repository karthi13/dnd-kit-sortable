import { useDraggable } from "@dnd-kit/core";
import { useRef } from "react";
import SidebarEntity from "./SidebarEntity";
import { ulid } from "ulid";

type Props = {
  entity: {
    type: string;
    title: string;
  };
};

const DraggableEntity: React.FC<Props> = ({ entity }) => {
  const id = useRef(ulid());
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id.current,
    data: {
      type: entity.type,
      title: entity.title,
      fromSideBar: true,
    },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <SidebarEntity title={entity.title}></SidebarEntity>
    </div>
  );
};

export default DraggableEntity;
