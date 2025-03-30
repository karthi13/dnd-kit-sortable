import DraggableEntity from "./DraggableEntity";

const DraggableEntities = [
  {
    type: "input",
    title: "Text Input",
  },
  {
    type: "select",
    title: "Select",
  },
  {
    type: "text",
    title: "Text",
  },
  {
    type: "button",
    title: "Button",
  },
  {
    type: "textarea",
    title: "Text Area",
  },
];

const Sidebar = () => {
  return (
    <div className="sidebar">
      {DraggableEntities.map((entity) => (
        <DraggableEntity key={entity.type} entity={entity} />
      ))}
    </div>
  );
};

export default Sidebar;
