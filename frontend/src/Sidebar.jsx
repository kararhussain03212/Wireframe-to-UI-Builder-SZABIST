import { useDrag } from "react-dnd";
import {
  Grip,
  Text,
  Square,
  LayoutDashboard,
  Menu,
  Heading,
  Keyboard,
  CheckSquare,
} from "lucide-react";

const SidebarItem = ({ label, icon: Icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center gap-3 p-3 border rounded-lg shadow-sm cursor-move bg-white hover:bg-gray-200 transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <Grip className="text-gray-400 w-4 h-4" /> {/* Drag handle */}
      <Icon className="text-gray-700 w-5 h-5" />
      <span className="flex-1 text-sm">{label}</span>
    </div>
  );
};

const Sidebar = ({ sidebarRef }) => (
  <div
    className="w-72 bg-gray-100 p-4 border-2 rounded-md shadow-xl overflow-y-auto text-black "
    ref={sidebarRef}
  >
    <h2 className="text-lg font-semibold mb-4 text-center">Add Components</h2>

    {/* Layout Components */}
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase">
        Layout
      </h3>
      <SidebarItem label="frame" icon={LayoutDashboard} />
      <SidebarItem label="nav" icon={Menu} />
      <SidebarItem label="footer" icon={LayoutDashboard} />
    </div>

    {/* Elements */}
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase">
        Elements
      </h3>
      <SidebarItem label="text" icon={Text} />
      <SidebarItem label="heading" icon={Heading} />
      <SidebarItem label="button" icon={Square} />
    </div>

    {/* Inputs */}
    <div>
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase">
        Inputs
      </h3>
      <SidebarItem label="input" icon={Keyboard} />
      <SidebarItem label="checkbox" icon={CheckSquare} />
    </div>
  </div>
);

export default Sidebar;
