import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DraggableEntity = ({ id, content }: { content: string; id: string }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      content,
      type: "entity",
      fromSideBar: true,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    padding: "5px",
    border: "1px solid #999",
    margin: "5px 0",
    backgroundColor: "lightblue",
    color: "black",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {content}
    </div>
  );
};

export default DraggableEntity;
