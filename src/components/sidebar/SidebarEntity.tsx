type Props = {
  overlay?: boolean;
  title: string;
};

const SidebarEntity: React.FC<Props> = ({ overlay, title }) => {
  const defaultStyle = {
    padding: "5px",
    border: "1px solid #999",
    margin: "5px 0",
    backgroundColor: overlay ? "lightsalmon" : "lightblue",
    color: "black",
  };

  return <div style={defaultStyle}>{title}</div>;
};

export default SidebarEntity;
