import React, { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Rnd } from "react-rnd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  setDoc,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  runTransaction,
  arrayRemove,
  deleteField,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth } from "./../firebaseConfig";
// built-in icon library (react-icons)
import {
  FiUser,
  FiStar,
  FiHome,
  FiSearch,
  FiMenu,
  FiBell,
  FiHeart,
  FiImage,
} from "react-icons/fi";
const db = getFirestore();
import {
  Grip,
  Text,
  Square,
  LayoutDashboard,
  Menu,
  Heading,
  Keyboard,
  CheckSquare,
  MousePointer,
  Image as LucideImage,
  X,
  Lock,
  Unlock,
  Star,
  CreditCard,
  Minus,
  Tag,
  AlertCircle,
  BarChart3,
  List,
  ToggleLeft,
  ChevronRight,
  MessageSquare,
  User,
  PlayCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import ThemePanel from "./ThemePanel";

const iconMap = {
  frame: LucideImage,
  image: LucideImage,
  nav: Menu,
  text: Text,
  heading: Heading,
  button: Square,
  input: Keyboard,
  checkbox: CheckSquare,
  footer: Text,
  icon: Star,
  card: CreditCard,
  divider: Minus,
  badge: Tag,
  alert: AlertCircle,
  progress: BarChart3,
  tabs: List,
  toggle: ToggleLeft,
  breadcrumb: ChevronRight,
  tooltip: MessageSquare,
  avatar: User,
  hamburger: Menu,
  carousel: PlayCircle,
};

// Palette with variants: each item can have variant presets (styles, text, box)
const PALETTE = [
  {
    label: "nav",
    title: "Navigation",
    variants: [
      {
        name: "Top Bar",
        styles: { bgColor: "#111827", color: "#fff" },
        box: [0, 0, 800, 64],
        menuItems: ["Home", "About", "Contact"],
      },
      {
        name: "Subtle",
        styles: {
          bgColor: "#f8fafc",
          color: "#111827",
          borderBottom: "1px solid #e5e7eb",
        },
        box: [0, 0, 800, 56],
        menuItems: ["Products", "Pricing", "Docs"],
      },
    ],
  },
  {
    label: "button",
    title: "Button",
    variants: [
      {
        name: "Primary",
        styles: { bgColor: "#3b82f6", color: "#ffffff", borderRadius: 8 },
        text: "Primary",
      },
      {
        name: "Secondary",
        styles: { bgColor: "#e5e7eb", color: "#111827", borderRadius: 8 },
        text: "Secondary",
      },
      {
        name: "Ghost",
        styles: { bgColor: "transparent", color: "#3b82f6", borderWidth: 0 },
        text: "Ghost",
      },
    ],
  },
  {
    label: "heading",
    title: "Heading",
    variants: [
      {
        name: "H1",
        styles: { fontSize: 32, fontWeight: "700" },
        text: "Heading 1",
        box: [0, 0, 560, 56],
      },
      {
        name: "H2",
        styles: { fontSize: 22, fontWeight: "600" },
        text: "Heading 2",
        box: [0, 0, 480, 44],
      },
    ],
  },
  {
    label: "text",
    title: "Text",
    variants: [
      {
        name: "Body",
        styles: { fontSize: 16, color: "#374151" },
        text: "Body text",
      },
      {
        name: "Muted",
        styles: { fontSize: 14, color: "#6b7280" },
        text: "Muted text",
      },
      {
        name: "Caption",
        styles: { fontSize: 12, color: "#9ca3af" },
        text: "Caption",
      },
    ],
  },
  {
    label: "input",
    title: "Input",
    variants: [
      {
        name: "Default",
        styles: {
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#d1d5db",
        },
        text: "Placeholder...",
      },
      {
        name: "Rounded",
        styles: {
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#d1d5db",
        },
        text: "Search...",
      },
    ],
  },
  {
    label: "checkbox",
    title: "Checkbox",
    variants: [
      { name: "Default", styles: {}, text: "Check me" },
      { name: "Inline", styles: {}, text: "Agree to terms" },
    ],
  },
  {
    label: "image",
    title: "Image",
    variants: [
      {
        name: "Hero",
        styles: {},
        box: [0, 0, 600, 220],
        imgUrl: "https://picsum.photos/1200/440",
      },
      {
        name: "Thumbnail",
        styles: {},
        box: [0, 0, 140, 100],
        imgUrl: "https://picsum.photos/300/200",
      },
      {
        name: "Avatar",
        styles: { borderRadius: 9999 },
        box: [0, 0, 64, 64],
        imgUrl: "https://i.pravatar.cc/64",
      },
    ],
  },
  {
    label: "icon",
    title: "Icon",
    variants: [
      { name: "Small", styles: { color: "#111827" }, box: [0, 0, 24, 24] },
      { name: "Large", styles: { color: "#111827" }, box: [0, 0, 48, 48] },
    ],
  },
  {
    label: "footer",
    title: "Footer",
    variants: [
      {
        name: "Simple",
        styles: { bgColor: "#111827", color: "#fff" },
        box: [0, 0, 800, 120],
        text: "© Company",
      },
      {
        name: "Links",
        styles: { bgColor: "#f8fafc", color: "#111827" },
        box: [0, 0, 800, 100],
        text: "Links | Contact",
      },
    ],
  },
  {
    label: "frame",
    title: "Frame",
    variants: [
      {
        name: "Panel",
        styles: {
          bgColor: "#fff",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#e5e7eb",
        },
        box: [0, 0, 420, 300],
      },
      {
        name: "Section",
        styles: { bgColor: "#f8fafc" },
        box: [0, 0, 760, 200],
      },
    ],
  },
  {
    label: "card",
    title: "Card",
    variants: [
      {
        name: "Default",
        styles: {
          bgColor: "#ffffff",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#e5e7eb",
        },
        box: [0, 0, 300, 200],
      },
      {
        name: "With Shadow",
        styles: {
          bgColor: "#ffffff",
          borderRadius: 8,
          shadow: "shadow-lg",
        },
        box: [0, 0, 300, 200],
      },
    ],
  },
  {
    label: "divider",
    title: "Divider",
    variants: [
      {
        name: "Horizontal",
        styles: {
          borderStyle: "solid",
          borderWidth: 1,
          color: "#000000", // ✅ Add default black color
        },
        box: [0, 0, 400, 1],
      },
      {
        name: "Vertical",
        styles: {
          borderStyle: "solid",
          borderWidth: 1,
          color: "#000000", // ✅ Add default black color
        },
        box: [0, 0, 1, 200],
      },
    ],
  },
  {
    label: "badge",
    title: "Badge",
    variants: [
      {
        name: "Primary",
        styles: {
          bgColor: "#3b82f6",
          color: "#ffffff",
          borderRadius: 12,
          fontSize: 12,
        },
        text: "New",
        box: [0, 0, 60, 24],
      },
      {
        name: "Success",
        styles: {
          bgColor: "#10b981",
          color: "#ffffff",
          borderRadius: 12,
          fontSize: 12,
        },
        text: "Active",
        box: [0, 0, 70, 24],
      },
      {
        name: "Warning",
        styles: {
          bgColor: "#f59e0b",
          color: "#ffffff",
          borderRadius: 12,
          fontSize: 12,
        },
        text: "Pending",
        box: [0, 0, 80, 24],
      },
    ],
  },
  {
    label: "alert",
    title: "Alert",
    variants: [
      {
        name: "Info",
        styles: {
          bgColor: "#dbeafe",
          color: "#1e40af",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#3b82f6",
        },
        text: "ℹ️ This is an information alert",
        box: [0, 0, 400, 60],
      },
      {
        name: "Success",
        styles: {
          bgColor: "#d1fae5",
          color: "#065f46",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#10b981",
        },
        text: "✓ Success! Your changes were saved",
        box: [0, 0, 400, 60],
      },
      {
        name: "Error",
        styles: {
          bgColor: "#fee2e2",
          color: "#991b1b",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#ef4444",
        },
        text: "✕ Error! Something went wrong",
        box: [0, 0, 400, 60],
      },
    ],
  },
  {
    label: "progress",
    title: "Progress Bar",
    variants: [
      {
        name: "Default",
        styles: { bgColor: "#3b82f6" },
        box: [0, 0, 200, 12],
        progressValue: 50,
      },
      {
        name: "Success",
        styles: { bgColor: "#10b981" },
        box: [0, 0, 200, 12],
        progressValue: 100,
      },
      {
        name: "Warning",
        styles: { bgColor: "#f59e0b" },
        box: [0, 0, 200, 12],
        progressValue: 75,
      },
    ],
  },
  {
    label: "tabs",
    title: "Tabs",
    variants: [
      {
        name: "Default",
        styles: {
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#e5e7eb",
        },
        menuItems: ["Tab 1", "Tab 2", "Tab 3"], // ✅ Ensure this is present
        box: [0, 0, 400, 48],
      },
      {
        name: "Pills",
        styles: {
          borderRadius: 20,
          bgColor: "#f3f4f6",
        },
        menuItems: ["Overview", "Details", "Settings"], // ✅ Ensure this is present
        box: [0, 0, 400, 48],
      },
    ],
  },
  {
    label: "toggle",
    title: "Toggle",
    variants: [
      {
        name: "Default",
        text: "Enable feature",
        box: [0, 0, 150, 32],
      },
      {
        name: "Small",
        text: "Toggle",
        box: [0, 0, 100, 24],
      },
    ],
  },
  {
    label: "breadcrumb",
    title: "Breadcrumb",
    variants: [
      {
        name: "Default",
        styles: { fontSize: 14, color: "#6b7280" },
        breadcrumbPath: "Home / Products / Item", // ✅ Use breadcrumbPath instead of text
        box: [0, 0, 250, 24],
      },
      {
        name: "With Icons",
        styles: { fontSize: 14, color: "#6b7280" },
        breadcrumbPath: "🏠 Home › 📦 Products › 📄 Item", // ✅ Use breadcrumbPath instead of text
        box: [0, 0, 300, 24],
      },
    ],
  },
  {
    label: "tooltip",
    title: "Tooltip",
    variants: [
      {
        name: "Default",
        styles: {
          bgColor: "#1f2937",
          color: "#ffffff",
          borderRadius: 4,
          fontSize: 12,
        },
        text: "Tooltip text",
        box: [0, 0, 120, 32],
      },
      {
        name: "Error",
        styles: {
          bgColor: "#ef4444",
          color: "#ffffff",
          borderRadius: 4,
          fontSize: 12,
        },
        text: "Error message",
        box: [0, 0, 150, 32],
      },
    ],
  },
  {
    label: "avatar",
    title: "Avatar",
    variants: [
      {
        name: "Small",
        styles: { borderRadius: 9999 },
        box: [0, 0, 40, 40],
        imgUrl: "https://i.pravatar.cc/40",
      },
      {
        name: "Medium",
        styles: { borderRadius: 9999 },
        box: [0, 0, 64, 64],
        imgUrl: "https://i.pravatar.cc/64",
      },
      {
        name: "Large",
        styles: { borderRadius: 9999 },
        box: [0, 0, 96, 96],
        imgUrl: "https://i.pravatar.cc/96",
      },
    ],
  },
  {
    label: "hamburger",
    title: "Hamburger Menu",
    variants: [
      {
        name: "Default",
        styles: {
          bgColor: "#ffffff",
          color: "#111827",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#e5e7eb",
        },
        menuItems: ["Home", "About", "Services", "Contact"],
        box: [0, 0, 48, 48],
      },
      {
        name: "Dark",
        styles: {
          bgColor: "#1f2937",
          color: "#ffffff",
          borderRadius: 8,
        },
        menuItems: ["Dashboard", "Profile", "Settings", "Logout"],
        box: [0, 0, 48, 48],
      },
    ],
  },
  // {
  //   label: "carousel",
  //   title: "Image Carousel",
  //   variants: [
  //     {
  //       name: "Default",
  //       styles: {
  //         bgColor: "#f3f4f6",
  //         borderRadius: 8,
  //       },
  //       images: [
  //         "https://picsum.photos/800/400?random=1",
  //         "https://picsum.photos/800/400?random=2",
  //         "https://picsum.photos/800/400?random=3",
  //       ],
  //       box: [0, 0, 600, 350],
  //       currentSlide: 0,
  //     },
  //     {
  //       name: "Compact",
  //       styles: {
  //         bgColor: "#ffffff",
  //         borderRadius: 12,
  //         borderStyle: "solid",
  //         borderWidth: 1,
  //         borderColor: "#e5e7eb",
  //       },
  //       images: [
  //         "https://picsum.photos/600/300?random=4",
  //         "https://picsum.photos/600/300?random=5",
  //       ],
  //       box: [0, 0, 400, 250],
  //       currentSlide: 0,
  //     },
  //   ],
  // },
];

// Small built-in icon catalog (safe subset). id used as key for insertion.
const BUILT_IN_ICONS = [
  { id: "fi:FiUser", label: "User", Comp: FiUser },
  { id: "fi:FiStar", label: "Star", Comp: FiStar },
  { id: "fi:FiHome", label: "Home", Comp: FiHome },
  { id: "fi:FiSearch", label: "Search", Comp: FiSearch },
  { id: "fi:FiMenu", label: "Menu", Comp: FiMenu },
  { id: "fi:FiBell", label: "Bell", Comp: FiBell },
  { id: "fi:FiHeart", label: "Heart", Comp: FiHeart },
  { id: "fi:FiImage", label: "Image", Comp: FiImage },
];

// Component for a built-in icon in the library (draggable & insertable)
const BuiltInIconItem = ({ icon, onInsert }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "component",
    item: { label: "icon", iconKey: icon.id, variant: { box: [0, 0, 48, 48] } },
    collect: (m) => ({ isDragging: !!m.isDragging() }),
  });
  const IconComp = icon.Comp;
  return (
    <div
      ref={drag}
      className={`flex flex-col items-center gap-2 p-2 border rounded bg-white cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
      title={icon.label}
    >
      <div className="w-8 h-8 flex items-center justify-center text-gray-700">
        <IconComp size={18} />
      </div>
      <button
        className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        onClick={() => onInsert?.({ label: "icon", iconKey: icon.id })}
      >
        Insert
      </button>
    </div>
  );
};

// SidebarItem component with proper drag configuration
const SidebarItem = ({
  label,
  title,
  canvasWidth,
  canvasHeight,
  onInsert,
  handleDropComponent,
  onMouseEnter,
  onMouseLeave,
}) => {
  const itemRef = useRef(null);
  const paletteItem = PALETTE.find((p) => p.label === label);

  // Get the first variant as default for drag
  const defaultVariant = paletteItem?.variants?.[0] || {};

  const [{ isDragging }, drag] = useDrag({
    type: "component",
    item: () => {
      // Return the label with the default (first) variant
      return {
        label: label,
        variant: defaultVariant,
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const Icon = iconMap[label];

  return (
    <div
      ref={(node) => {
        drag(node);
        itemRef.current = node;
      }}
      className={`flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      title={title}
      onMouseEnter={(e) => {
        if (onMouseEnter) {
          const rect = e.currentTarget.getBoundingClientRect();
          onMouseEnter(paletteItem, rect);
        }
      }}
      onMouseLeave={() => {
        if (onMouseLeave) {
          onMouseLeave();
        }
      }}
    >
      {Icon && <Icon className="text-gray-600 mb-1" size={20} />}
      <span className="text-xs text-gray-700 font-medium text-center">
        {title}
      </span>
    </div>
  );
};

const LayersPanel = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateLayers,
}) => {
  const handleMoveUp = (id) => {
    const index = components.findIndex((c) => c.id === id);
    if (index < components.length - 1) {
      // Swap with component above it (higher z-index)
      const newComponents = [...components];
      [newComponents[index], newComponents[index + 1]] = [
        newComponents[index + 1],
        newComponents[index],
      ];

      // Update z-indices
      newComponents.forEach((comp, i) => {
        comp.zIndex = i;
      });

      onUpdateLayers(newComponents);
    }
  };

  const handleMoveDown = (id) => {
    const index = components.findIndex((c) => c.id === id);
    if (index > 0) {
      // Swap with component below it (lower z-index)
      const newComponents = [...components];
      [newComponents[index], newComponents[index - 1]] = [
        newComponents[index - 1],
        newComponents[index],
      ];

      // Update z-indices
      newComponents.forEach((comp, i) => {
        comp.zIndex = i;
      });

      onUpdateLayers(newComponents);
    }
  };

  return (
    <div className="p-2 ">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 ">
        Component Layers
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Layers at the top appear in front of layers below
      </p>

      <div className="space-y-2 h-full overflow-y-auto">
        {[...components].reverse().map((component, index) => (
          <div
            key={component.id}
            className={`flex items-center justify-between p-2 border rounded-md ${
              component.id === selectedComponentId
                ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300" // Enhanced highlighting
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent(component.id);
              console.log("Selected component from layers:", component.id);
            }}
          >
            <div className="flex items-center">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-sm text-xs mr-2">
                {components.length - index}
              </span>
              <span className="text-sm">
                {component.label}{" "}
                {component.text
                  ? `- "${component.text.substring(0, 20)}${
                      component.text.length > 20 ? "..." : ""
                    }"`
                  : ""}
              </span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveUp(component.id);
                }}
                className={`p-1 rounded hover:bg-gray-200 ${
                  index === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600"
                }`}
                disabled={index === 0}
                title="Bring Forward"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveDown(component.id);
                }}
                className={`p-1 rounded hover:bg-gray-200 ${
                  index === components.length - 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600"
                }`}
                disabled={index === components.length - 1}
                title="Send Backward"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditSidebar = ({
  selectedComponent,
  onUpdateComponent,
  sidebarRef,
  components,
  onUpdateLayers,
  onSelectComponent,
  saveComponentToLibrary,
  userTemplates = [],
}) => {
  const [activeTab, setActiveTab] = useState("properties"); // "properties" or "layers"
  if (!selectedComponent)
    return (
      <div
        className="flex-1 bg-white overflow-y-auto text-black"
        ref={sidebarRef}
      >
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
          <MousePointer size={24} />
          <p className="mt-2 text-md text-center">
            Select a component to edit its properties
          </p>
        </div>
      </div>
    );

  const handleTextChange = (e) => {
    onUpdateComponent({ ...selectedComponent, text: e.target.value });
  };

  const handleSizeChange = (e, dimension) => {
    const value = parseInt(e.target.value, 10) || 0;
    const newBox = [...selectedComponent.box];
    newBox[dimension] = Math.max(0, value); // Prevent negative values
    onUpdateComponent({ ...selectedComponent, box: newBox });
  };

  const handleColorChange = (e) => {
    onUpdateComponent({ ...selectedComponent, color: e.target.value });
  };

  const handleBgColorChange = (e) => {
    onUpdateComponent({ ...selectedComponent, bgColor: e.target.value });
  };

  const handleDeleteComponent = () => {
    onUpdateComponent(null); // Signal to delete the component
  };

  // Get the correct icon for the component
  const Icon =
    iconMap[selectedComponent.label.toLowerCase()] || LayoutDashboard;

  return (
    <div
      className="flex-1 bg-white overflow-y-auto p-4 text-black"
      ref={sidebarRef}
    >
      {/* Header with component type and delete button */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-md font-medium flex items-center gap-2 text-gray-700">
          <Icon size={14} className="text-gray-500" />
          {selectedComponent.label}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => saveComponentToLibrary(selectedComponent)}
            className="px-2 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            title="Save this component to your library"
          >
            Save
          </button>
          <button
            onClick={handleDeleteComponent}
            className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Delete component"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="border-b border-gray-200 mb-3">
        <div className="flex">
          <button
            onClick={() => setActiveTab("properties")}
            className={`py-2 px-4 ${
              activeTab === "properties"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab("layers")}
            className={`py-2 px-4 ${
              activeTab === "layers"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Layers
          </button>
        </div>
      </div>
      {activeTab === "properties" ? (
        <>
          {" "}
          {/* Common controls: position and dimensions */}
          <div className="space-y-5 mb-5">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Position & Size
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedComponent.box[0])}
                    onChange={(e) => handleSizeChange(e, 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedComponent.box[1])}
                    onChange={(e) => handleSizeChange(e, 1)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Width
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedComponent.box[2])}
                    onChange={(e) => handleSizeChange(e, 2)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Height
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedComponent.box[3])}
                    onChange={(e) => handleSizeChange(e, 3)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Text content for text-based components */}
          {[
            "text",
            "heading",
            "button",
            "input",
            "footer",
            "checkbox",
            "radio button",
          ].includes(selectedComponent.label) && (
            <div className="mb-3">
              <label className="block text-sm text-gray-500 mb-1.5">
                {selectedComponent.label === "button"
                  ? "Button Text"
                  : selectedComponent.label === "input"
                  ? "Placeholder Text"
                  : "Text Content"}
              </label>
              <textarea
                value={selectedComponent.text || ""}
                onChange={handleTextChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={selectedComponent.label === "text" ? 3 : 1}
                placeholder={
                  selectedComponent.label === "button"
                    ? "Button text"
                    : selectedComponent.label === "input"
                    ? "Placeholder..."
                    : "Enter text here"
                }
              />
            </div>
          )}
          {/* Component-specific controls */}
          {/* Text content for text-based components */}
          {[
            "text",
            "heading",
            "button",
            "input",
            "footer",
            "checkbox",
            "radio button",
            "nav",
          ].includes(selectedComponent.label) && (
            <>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Text Style
                </label>
                <div className="flex gap-2">
                  {/* Bold toggle button */}
                  <button
                    onClick={() =>
                      onUpdateComponent({
                        ...selectedComponent,
                        fontWeight:
                          selectedComponent.fontWeight === "bold"
                            ? "normal"
                            : "bold",
                      })
                    }
                    className={`px-3 py-1.5 border rounded-md flex items-center justify-center w-10 ${
                      selectedComponent.fontWeight === "bold"
                        ? "bg-blue-50 border-blue-300 text-blue-600"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                    title="Toggle Bold"
                  >
                    <span
                      className={`text-lg ${
                        selectedComponent.fontWeight === "bold"
                          ? "font-bold"
                          : "font-normal"
                      }`}
                    >
                      B
                    </span>
                  </button>

                  {/* Font Family dropdown */}
                  <select
                    value={selectedComponent.fontFamily || ""}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        fontFamily: e.target.value,
                      })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Theme Default</option>
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">
                      Times New Roman
                    </option>
                    <option value="'Courier New', monospace">
                      Courier New
                    </option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Trebuchet MS', sans-serif">
                      Trebuchet MS
                    </option>
                  </select>
                </div>
              </div>

              {/* Font size control - keep this as is */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Font Size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={selectedComponent.fontSize || 16}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        fontSize: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={selectedComponent.fontSize || 16}
                      onChange={(e) =>
                        onUpdateComponent({
                          ...selectedComponent,
                          fontSize: e.target.value,
                        })
                      }
                      className="w-16 px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="8"
                      max="72"
                    />
                    <span className="ml-1">px</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Styling section - applicable to virtually all components */}
          <div className="mb-5">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Styling
            </h3>

            {/* Text color - for components with text */}
            {[
              "text",
              "heading",
              "button",
              "input",
              "footer",
              "checkbox",
              "radio button",
              "nav",
            ].includes(selectedComponent.label) && (
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.color || "#000000"}
                      onChange={handleColorChange}
                      className="sr-only"
                      id="textColorPicker"
                    />
                    <label
                      htmlFor="textColorPicker"
                      className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: selectedComponent.color || "#000000",
                      }}
                    ></label>
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.color || "#000000"}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        color: e.target.value,
                      })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Background color - for most components */}
            {[
              "button",
              "nav",
              "footer",
              "input",
              "text",
              "heading",
              "checkbox",
              "radio button",
              "frame",
            ].includes(selectedComponent.label) && (
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={
                        selectedComponent.bgColor?.startsWith("#")
                          ? selectedComponent.bgColor
                          : "#ffffff"
                      }
                      onChange={(e) =>
                        onUpdateComponent({
                          ...selectedComponent,
                          bgColor: e.target.value,
                        })
                      }
                      className="sr-only"
                      id="bgColorPicker"
                    />
                    <label
                      htmlFor="bgColorPicker"
                      className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: selectedComponent.bgColor?.startsWith(
                          "#"
                        )
                          ? selectedComponent.bgColor
                          : "#ffffff",
                      }}
                    ></label>
                  </div>
                  <select
                    value={selectedComponent.bgColor || ""}
                    onChange={handleBgColorChange}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Custom</option>
                    <option value="bg-white">White</option>
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-gray-800">Dark Gray</option>
                    <option value="bg-transparent">Transparent</option>
                  </select>
                </div>
              </div>
            )}

            {/* Border options - new feature */}
            {["button", "input", "text", "heading", "frame", "image"].includes(
              selectedComponent.label
            ) && (
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Border Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedComponent.borderStyle || "none"}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderStyle: e.target.value,
                      })
                    }
                    className="px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Width"
                    value={selectedComponent.borderWidth || "0"}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderWidth: e.target.value,
                      })
                    }
                    className="px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="10"
                  />

                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={selectedComponent.borderColor || "#000000"}
                          onChange={(e) =>
                            onUpdateComponent({
                              ...selectedComponent,
                              borderColor: e.target.value,
                            })
                          }
                          className="sr-only"
                          id="borderColorPicker"
                        />
                        <label
                          htmlFor="borderColorPicker"
                          className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                          style={{
                            backgroundColor:
                              selectedComponent.borderColor || "#000000",
                          }}
                        ></label>
                      </div>
                      <input
                        type="text"
                        value={selectedComponent.borderColor || "#000000"}
                        onChange={(e) =>
                          onUpdateComponent({
                            ...selectedComponent,
                            borderColor: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Border color"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Corner radius - for components where it makes sense */}
            {["button", "input", "frame", "image"].includes(
              selectedComponent.label
            ) && (
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Corner Radius
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={selectedComponent.borderRadius || 0}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderRadius: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={selectedComponent.borderRadius || 0}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderRadius: e.target.value,
                      })
                    }
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Component-specific sections */}
          {/* Nav-specific properties */}
          {selectedComponent.label === "nav" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Navigation
              </h3>

              {/* Alignment */}
              <label className="block text-sm text-gray-500 mb-1.5">
                Alignment
              </label>
              <select
                value={selectedComponent.alignment || "center"}
                onChange={(e) =>
                  onUpdateComponent({
                    ...selectedComponent,
                    alignment: e.target.value,
                  })
                }
                className="w-full mb-3 px-2 py-1.5 border border-gray-300 rounded text-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>

              {/* Logo Settings */}
              <h4 className="text-xs font-semibold text-gray-600 mb-1 mt-2">
                Logo
              </h4>
              <select
                value={selectedComponent.logoType || "none"}
                onChange={(e) =>
                  onUpdateComponent({
                    ...selectedComponent,
                    logoType: e.target.value,
                  })
                }
                className="w-full mb-2 px-2 py-1.5 border border-gray-300 rounded text-md"
              >
                <option value="none">None</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>

              {selectedComponent.logoType === "text" && (
                <div className="space-y-2 mb-3">
                  <input
                    type="text"
                    placeholder="Logo text"
                    value={selectedComponent.logoText || ""}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        logoText: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    list="templateNames"
                    type="text"
                    placeholder="Home template (optional)"
                    value={selectedComponent.logoTemplate || ""}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        logoTemplate: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}

              {selectedComponent.logoType === "image" && (
                <div className="space-y-2 mb-3">
                  <input
                    type="text"
                    placeholder="Logo image URL"
                    value={selectedComponent.logoUrl || ""}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        logoUrl: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    list="templateNames"
                    type="text"
                    placeholder="Home template (optional)"
                    value={selectedComponent.logoTemplate || ""}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        logoTemplate: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}

              <datalist id="templateNames">
                {userTemplates.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>

              {/* Menu Items */}
              <label className="block text-sm text-gray-500 mb-1.5">
                Menu Items (one per line)
              </label>
              <textarea
                value={
                  selectedComponent.menuItems &&
                  Array.isArray(selectedComponent.menuItems)
                    ? selectedComponent.menuItems.join("\n")
                    : "Home\nAbout\nContact"
                }
                onChange={(e) => {
                  // ✅ FIX: Don't filter out empty strings - allow blank lines
                  const items = e.target.value.split("\n");
                  onUpdateComponent({
                    ...selectedComponent,
                    menuItems: items,
                  });
                }}
                rows={4}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                placeholder="One item per line&#10;Home&#10;About&#10;Services&#10;Contact"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedComponent.menuItems?.filter(Boolean).length || 0} menu
                items (excluding blank lines)
              </p>

              {/* Per-item link mapping */}
              <h4 className="text-xs font-semibold text-gray-600 mb-1">
                Link Targets (optional)
              </h4>
              <div className="space-y-2">
                {(selectedComponent.menuItems || []).map((mi, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1 text-xs truncate">{mi}</div>
                    <input
                      list="templateNames"
                      type="text"
                      placeholder="Template name"
                      value={
                        (selectedComponent.menuLinks &&
                          selectedComponent.menuLinks[mi]) ||
                        ""
                      }
                      onChange={(e) => {
                        const nextLinks = {
                          ...(selectedComponent.menuLinks || {}),
                          [mi]: e.target.value,
                        };
                        // remove if blank
                        if (!e.target.value.trim()) delete nextLinks[mi];
                        onUpdateComponent({
                          ...selectedComponent,
                          menuLinks: nextLinks,
                        });
                      }}
                      className="w-40 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Auto-link toggle (still available) */}
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!selectedComponent.enableAutoLinks}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      enableAutoLinks: e.target.checked,
                    })
                  }
                />
                <span>Auto-link matching template names</span>
              </label>
            </div>
          )}
          {/* Image-specific properties */}
          {["image", "frame", "icon"].includes(selectedComponent.label) && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Image Settings
              </h3>

              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={
                    selectedComponent.imgUrl ||
                    "https://archive.org/download/placeholder-image//placeholder-image.jpg"
                  }
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      imgUrl: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Object Fit
                </label>
                <select
                  value={selectedComponent.objectFit || "cover"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      objectFit: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          )}
          {/* Avatar-specific properties */}
          {selectedComponent.label === "avatar" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Avatar Settings
              </h3>

              {/* Current avatar preview */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Current Avatar
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200"
                    style={{
                      borderRadius: `${
                        selectedComponent.borderRadius || 9999
                      }px`,
                    }}
                  >
                    <img
                      src={
                        selectedComponent.imgUrl || "https://i.pravatar.cc/150"
                      }
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedComponent.imgUrl || ""}
                      onChange={(e) =>
                        onUpdateComponent({
                          ...selectedComponent,
                          imgUrl: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Image URL"
                    />
                  </div>
                </div>
              </div>

              {/* Upload image */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Upload New Image
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Convert to base64
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onUpdateComponent({
                          ...selectedComponent,
                          imgUrl: event.target.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>

              {/* Border radius control */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Corner Radius
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="9999"
                    value={selectedComponent.borderRadius || 9999}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderRadius: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={selectedComponent.borderRadius || 9999}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderRadius: parseInt(e.target.value),
                      })
                    }
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded text-md"
                    min="0"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderRadius: 9999,
                      })
                    }
                    className="flex-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Circle
                  </button>
                  <button
                    onClick={() =>
                      onUpdateComponent({
                        ...selectedComponent,
                        borderRadius: 8,
                      })
                    }
                    className="flex-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Rounded
                  </button>
                </div>
              </div>

              {/* Object fit */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Image Fit
                </label>
                <select
                  value={selectedComponent.objectFit || "cover"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      objectFit: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                >
                  <option value="cover">Cover (Fill)</option>
                  <option value="contain">Contain (Fit)</option>
                  <option value="fill">Fill (Stretch)</option>
                </select>
              </div>
            </div>
          )}
          {/* Hamburger Menu specific */}
          {selectedComponent.label === "hamburger" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Hamburger Menu
              </h3>

              {/* Toggle: show/hide menu in editor preview */}
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={!!selectedComponent.showMenu}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      showMenu: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Show menu in editor</span>
              </label>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Menu Items (one per line)
                </label>
                <textarea
                  value={
                    selectedComponent.menuItems &&
                    Array.isArray(selectedComponent.menuItems)
                      ? selectedComponent.menuItems.join("\n")
                      : "Home\nAbout\nContact"
                  }
                  onChange={(e) => {
                    // ✅ FIX: Don't filter out empty strings - allow blank lines
                    const items = e.target.value.split("\n");
                    onUpdateComponent({
                      ...selectedComponent,
                      menuItems: items,
                    });
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                  rows={4}
                  placeholder="One item per line&#10;Home&#10;About&#10;Services&#10;Contact&#10;More..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedComponent.menuItems?.filter(Boolean).length || 0}{" "}
                  menu items (excluding blank lines)
                </p>
              </div>
            </div>
          )}
          {/* Carousel specific */}
          {selectedComponent.label === "carousel" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Carousel Images
              </h3>

              {/* Image List */}
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                {(selectedComponent.images || []).map((img, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded bg-gray-50"
                  >
                    <img
                      src={img}
                      alt={`Slide ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const newImages = [
                            ...(selectedComponent.images || []),
                          ];
                          newImages[index] = e.target.value;
                          onUpdateComponent({
                            ...selectedComponent,
                            images: newImages,
                          });
                        }}
                        className="w-full px-2 py-1 text-xs border rounded"
                        placeholder="Image URL"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newImages = (
                          selectedComponent.images || []
                        ).filter((_, i) => i !== index);
                        onUpdateComponent({
                          ...selectedComponent,
                          images: newImages,
                        });
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove image"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Image Options */}
              <div className="space-y-2">
                {/* Add from URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="carousel-url-input"
                    placeholder="Image URL"
                    className="flex-1 px-2 py-1.5 border rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      const input =
                        document.getElementById("carousel-url-input");
                      const url = input.value.trim();
                      if (url) {
                        const newImages = [
                          ...(selectedComponent.images || []),
                          url,
                        ];
                        onUpdateComponent({
                          ...selectedComponent,
                          images: newImages,
                        });
                        input.value = "";
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Add URL
                  </button>
                </div>

                {/* Upload Image */}
                <label className="flex items-center justify-center gap-2 px-3 py-1.5 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Convert to base64
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newImages = [
                          ...(selectedComponent.images || []),
                          event.target.result,
                        ];
                        onUpdateComponent({
                          ...selectedComponent,
                          images: newImages,
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {/* Carousel Settings */}
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Auto-play Speed (seconds)
                </label>
                <input
                  type="number"
                  value={selectedComponent.autoplaySpeed || 3}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      autoplaySpeed: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  min="1"
                  max="10"
                />

                <label className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    checked={selectedComponent.showDots !== false}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        showDots: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Show navigation dots</span>
                </label>

                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={selectedComponent.showArrows !== false}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        showArrows: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Show navigation arrows</span>
                </label>
              </div>
            </div>
          )}
          {/* Card-specific properties */}
          {selectedComponent.label === "card" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Card Content
              </h3>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Card Title
                </label>
                <input
                  type="text"
                  value={selectedComponent.cardTitle || "Card Title"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      cardTitle: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Card Description
                </label>
                <textarea
                  value={
                    selectedComponent.cardDescription ||
                    "Card content goes here"
                  }
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      cardDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                />
              </div>
            </div>
          )}
          {/* Badge-specific properties */}
          {selectedComponent.label === "badge" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Badge Settings
              </h3>
              {/* ✅ NEW: Add text input for badge */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={selectedComponent.text || "Badge"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      text: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                  placeholder="Enter badge text"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Badge Type
                </label>
                <select
                  value={selectedComponent.badgeType || "primary"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      badgeType: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                >
                  <option value="primary">Primary</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>
          )}
          {/* Alert-specific properties */}
          {selectedComponent.label === "alert" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Alert Settings
              </h3>
              {/* ✅ NEW: Add text input for alert message */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Alert Message
                </label>
                <textarea
                  value={selectedComponent.text || "This is an alert message"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      text: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                  rows={2}
                  placeholder="Enter alert message"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Alert Type
                </label>
                <select
                  value={selectedComponent.alertType || "info"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      alertType: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedComponent.dismissible !== false}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      dismissible: e.target.checked,
                    })
                  }
                />
                <span>Dismissible</span>
              </label>
            </div>
          )}
          {/* Progress Bar specific (already exists but improve it) */}
          {selectedComponent.label === "progress" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Progress Settings
              </h3>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Progress Value (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedComponent.progressValue || 50}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        progressValue: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={selectedComponent.progressValue || 50}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        progressValue: parseInt(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded text-md"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedComponent.showLabel !== false}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      showLabel: e.target.checked,
                    })
                  }
                />
                <span>Show percentage label</span>
              </label>
            </div>
          )}
          {/* Tabs specific (already exists, keep as is) */}
          {selectedComponent.label === "tabs" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Tab Items
              </h3>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Tab Labels
                </label>
                <textarea
                  value={
                    selectedComponent.menuItems
                      ? selectedComponent.menuItems.join("\n")
                      : "Tab 1\nTab 2\nTab 3"
                  }
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      menuItems: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                  rows={4}
                  placeholder="One tab per line"
                />
              </div>
            </div>
          )}
          {/* Toggle specific */}
          {selectedComponent.label === "toggle" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Toggle Settings
              </h3>
              <label className="flex items-center gap-2 text-sm mb-3">
                <input
                  type="checkbox"
                  checked={selectedComponent.toggleState || false}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      toggleState: e.target.checked,
                    })
                  }
                />
                <span>Initial State (On/Off)</span>
              </label>
            </div>
          )}
          {/* Breadcrumb specific */}
          {selectedComponent.label === "breadcrumb" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Breadcrumb Items
              </h3>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Breadcrumb Path (separated by /)
                </label>
                <input
                  type="text"
                  value={
                    selectedComponent.breadcrumbPath || "Home / Products / Item"
                  }
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      breadcrumbPath: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                  placeholder="Home / Category / Page"
                />
              </div>
            </div>
          )}
          {/* Tooltip specific */}
          {selectedComponent.label === "tooltip" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Tooltip Settings
              </h3>
              {/* ✅ NEW: Add text input for tooltip content */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Tooltip Text
                </label>
                <input
                  type="text"
                  value={selectedComponent.text || "Tooltip text"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      text: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                  placeholder="Enter tooltip text"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.bgColor || "#1f2937"}
                      onChange={(e) =>
                        onUpdateComponent({
                          ...selectedComponent,
                          bgColor: e.target.value,
                        })
                      }
                      className="sr-only"
                      id="tooltipBgColorPicker"
                    />
                    <label
                      htmlFor="tooltipBgColorPicker"
                      className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: selectedComponent.bgColor || "#1f2937",
                      }}
                    ></label>
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.bgColor || "#1f2937"}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        bgColor: e.target.value,
                      })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-md"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.color || "#ffffff"}
                      onChange={(e) =>
                        onUpdateComponent({
                          ...selectedComponent,
                          color: e.target.value,
                        })
                      }
                      className="sr-only"
                      id="tooltipTextColorPicker"
                    />
                    <label
                      htmlFor="tooltipTextColorPicker"
                      className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: selectedComponent.color || "#ffffff",
                      }}
                    ></label>
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.color || "#ffffff"}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        color: e.target.value,
                      })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-md"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Divider specific */}
          {selectedComponent.label === "divider" && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Divider Style
              </h3>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Orientation
                </label>
                <select
                  value={selectedComponent.orientation || "horizontal"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      orientation: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Line Style
                </label>
                <select
                  value={selectedComponent.lineStyle || "solid"}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      lineStyle: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-md"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
              {/* ✅ NEW: Color picker for divider */}
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1.5">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.color || "#000000"}
                      onChange={(e) =>
                        onUpdateComponent({
                          ...selectedComponent,
                          color: e.target.value,
                        })
                      }
                      className="sr-only"
                      id="dividerColorPicker"
                    />
                    <label
                      htmlFor="dividerColorPicker"
                      className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: selectedComponent.color || "#000000",
                      }}
                    ></label>
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.color || "#000000"}
                    onChange={(e) =>
                      onUpdateComponent({
                        ...selectedComponent,
                        color: e.target.value,
                      })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-md"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Advanced section - for additional customization options */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Advanced
            </h3>

            {/* Shadow setting */}
            <div className="mb-3">
              <label className="block text-sm text-gray-500 mb-1.5">
                Shadow
              </label>
              <select
                value={selectedComponent.shadow || "none"}
                onChange={(e) =>
                  onUpdateComponent({
                    ...selectedComponent,
                    shadow: e.target.value,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="shadow-sm">Small</option>
                <option value="shadow-md">Medium</option>
                <option value="shadow-lg">Large</option>
                <option value="shadow-xl">Extra Large</option>
              </select>
            </div>

            {/* Opacity setting */}
            <div className="mb-3">
              <label className="block text-sm text-gray-500 mb-1.5">
                Opacity
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedComponent.opacity || 100}
                  onChange={(e) =>
                    onUpdateComponent({
                      ...selectedComponent,
                      opacity: e.target.value,
                    })
                  }
                  className="flex-1"
                />
                <span className="text-md text-gray-500">
                  {selectedComponent.opacity || 100}%
                </span>
              </div>
            </div>

            {/* Component ID (read-only) */}
            <div className="mt-4">
              <label className="block text-sm text-gray-500 mb-1.5">
                Component ID
              </label>
              <input
                type="text"
                value={selectedComponent.id}
                readOnly
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm text-gray-500"
              />
            </div>
          </div>
        </>
      ) : (
        <LayersPanel
          components={components}
          selectedComponentId={selectedComponent.id}
          onSelectComponent={onSelectComponent}
          onUpdateLayers={onUpdateLayers}
        />
      )}
    </div>
  );
};

const Canvas = ({
  components,
  onComponentChange,
  onComponentSelect,
  onDropComponent,
  selectedComponentId,
  gridEnabled,
  gridSize,
  snapToGrid,
  canvasWidth,
  canvasHeight,
  currentTheme,
  canEdit,
  comments,
  templateId,
  currentProjectId,
  resolveUserName,
  fetchComments,
  db,
  focusComponentId,
  pinMode,
  onPlacePin,
  tempPin,
  clearTempPin,
  initialOpenComponentId,
  openSignal,
  availableUsers,
  resolveNameToUid,
  hideAllComments,
  viewport,
  updateCursorPosition,
  cursors,
  collabMode,
  containerRef,
  showPresencePanel,
}) => {
  const [containerSize, setContainerSize] = useState({
    width: 640,
    height: 640,
  });
  const [projectCollaborators, setProjectCollaborators] = useState({});

  // ✅ FIX: Calculate actual canvas height (not min)
  const calculateCanvasHeight = () => {
    if (components.length === 0) return canvasHeight;

    const maxY = Math.max(
      ...components.map((c) => c.box[1] + c.box[3]), // y + height
      canvasHeight // At least viewport height
    );

    // Add some padding at the bottom
    return maxY + 100;
  };

  const actualCanvasHeight = calculateCanvasHeight();

  useEffect(() => {
    const fetchProjectCollaborators = async () => {
      if (!currentProjectId) {
        setProjectCollaborators({});
        return;
      }

      try {
        const projectRef = doc(db, "projects", currentProjectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          setProjectCollaborators(projectData.collaboratorNames || {});
        }
      } catch (err) {
        console.error("Error fetching project collaborators:", err);
      }
    };

    fetchProjectCollaborators();
  }, [currentProjectId, db]);

  // Merge availableUsers with project collaborators
  const allAvailableUsers = {
    ...availableUsers,
    ...projectCollaborators,
  };

  // ✅ FIX: Update calculation to use actual height
  const calculateScaledPosition = (x, y) => {
    const xScaled = (x / containerSize.width) * canvasWidth;
    const yScaled = (y / containerSize.height) * actualCanvasHeight; // ✅ Use actual height
    return [xScaled, yScaled];
  };

  // Update drop handling to use new canvas dimensions
  const [{ isOver }, drop] = useDrop({
    accept: "component",
    drop: (item, monitor) => {
      console.log("Drop detected:", item);
      if (!containerRef.current) return;
      const containerBounds = containerRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        console.error("No client offset detected");
        return;
      }
      const x = clientOffset.x - containerBounds.left;
      const y = clientOffset.y - containerBounds.top;
      const [xScaled, yScaled] = calculateScaledPosition(x, y);
      onDropComponent(item, xScaled, yScaled);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setContainerSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setContainerSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasWidth, actualCanvasHeight]); // ✅ Use actual height

  // Handle component position or size changes from dragging/resizing
  const snapToGridValue = (value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDragStop = (componentId, d) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    let x = d.x;
    let y = d.y;

    if (snapToGrid) {
      const gridSizeScaled = (gridSize / canvasWidth) * containerSize.width;
      x = Math.round(x / gridSizeScaled) * gridSizeScaled;
      y = Math.round(y / gridSizeScaled) * gridSizeScaled;
    }

    const [xScaled, yScaled] = calculateScaledPosition(x, y);
    const newBox = [xScaled, yScaled, component.box[2], component.box[3]];
    const updatedComponent = { ...component, box: newBox };
    onComponentChange(componentId, updatedComponent);
  };

  const handleResizeStop = (componentId, ref, position) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    let x = position.x;
    let y = position.y;
    let width = ref.offsetWidth;
    let height = ref.offsetHeight;

    if (snapToGrid) {
      const gridSizeScaled = (gridSize / canvasWidth) * containerSize.width;
      x = Math.round(x / gridSizeScaled) * gridSizeScaled;
      y = Math.round(y / gridSizeScaled) * gridSizeScaled;
      width = Math.round(width / gridSizeScaled) * gridSizeScaled;
      height = Math.round(height / gridSizeScaled) * gridSizeScaled;
    }

    const [xScaled, yScaled] = calculateScaledPosition(x, y);
    const widthScaled = (width / containerSize.width) * canvasWidth;
    const heightScaled = (height / containerSize.height) * actualCanvasHeight; // ✅ Use actual height

    const newBox = [xScaled, yScaled, widthScaled, heightScaled];
    const updatedComponent = { ...component, box: newBox };
    onComponentChange(componentId, updatedComponent);
  };

  const handleCanvasClick = (e) => {
    if (pinMode && onPlacePin && containerRef.current) {
      const containerBounds = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      const x = Math.max(
        0,
        Math.min(1, (clientX - containerBounds.left) / containerBounds.width)
      );
      const y = Math.max(
        0,
        Math.min(1, (clientY - containerBounds.top) / containerBounds.height)
      );
      onPlacePin({ x, y });
      e.stopPropagation();
      return;
    }
    onComponentSelect(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedComponentId && e.key === "Delete") {
        onComponentChange(selectedComponentId, null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponentId, onComponentChange]);

  return (
    <div
      ref={(node) => {
        drop(node);
        containerRef.current = node;
      }}
      className={`relative bg-white shadow-lg rounded-lg overflow-visible ${
        isOver ? "ring-2 ring-blue-400" : "border border-gray-300"
      }`}
      style={{
        width: `${canvasWidth}px`,
        height: `${actualCanvasHeight}px`, // ✅ Use fixed height, not minHeight
        maxWidth: "calc(100vw - 900px)",
        margin: "0 auto",
      }}
      onClick={handleCanvasClick}
      onMouseMove={(e) => {
        if (collabMode && updateCursorPosition) {
          updateCursorPosition(e);
        }
      }}
    >
      {/* Canvas grid background */}
      <GridOverlay
        size={(gridSize / canvasWidth) * containerSize.width}
        enabled={gridEnabled}
      />

      {/* Viewport Outline Indicator */}
      <div
        className="absolute border-4 border-blue-500 border-dashed pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: `${canvasHeight}px`,
          zIndex: 2,
        }}
      ></div>

      {/* Canvas content */}
      <div className="relative w-full h-full">
        {pinMode && (
          <div
            onClick={(e) => {
              if (!containerRef.current || !onPlacePin) return;
              const containerBounds =
                containerRef.current.getBoundingClientRect();
              const clientX = e.clientX;
              const clientY = e.clientY;
              const x = Math.max(
                0,
                Math.min(
                  1,
                  (clientX - containerBounds.left) / containerBounds.width
                )
              );
              const y = Math.max(
                0,
                Math.min(
                  1,
                  (clientY - containerBounds.top) / containerBounds.height
                )
              );
              onPlacePin({ x, y });
              e.stopPropagation();
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              cursor: "crosshair",
              background: "transparent",
            }}
          />
        )}
        {components.map((component) => {
          if (!component) return null;

          const [x, y, width, height] = component.box || [0, 0, 120, 60];
          // ✅ FIX: Scale based on actual canvas height
          const xScaled = (x / canvasWidth) * containerSize.width;
          const yScaled = (y / actualCanvasHeight) * containerSize.height;
          const widthScaled = (width / canvasWidth) * containerSize.width;
          const heightScaled =
            (height / actualCanvasHeight) * containerSize.height;

          const isSelected = component.id === selectedComponentId;

          return (
            <Rnd
              id={`component-${component.id}`}
              key={component.id}
              disableDragging={!canEdit}
              enableResizing={canEdit}
              position={{ x: xScaled, y: yScaled }}
              size={{ width: widthScaled, height: heightScaled }}
              style={{ zIndex: component.zIndex }}
              onDragStop={(e, d) => handleDragStop(component.id, d)}
              onResizeStop={(e, direction, ref, delta, position) =>
                handleResizeStop(component.id, ref, position)
              }
              bounds="parent"
              dragHandleClassName={
                component.label === "image" ? undefined : undefined
              }
              resizeHandleStyles={{
                bottomRight: { zIndex: 10 },
                bottomLeft: { zIndex: 10 },
                topRight: { zIndex: 10 },
                topLeft: { zIndex: 10 },
              }}
              className={`absolute ${
                isSelected
                  ? "ring-2 ring-blue-500 ring-offset-0"
                  : "hover:ring-1 hover:ring-blue-300"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onComponentSelect(component.id);
              }}
            >
              {renderComponent(component, currentTheme)}

              {isSelected && (
                <>
                  <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-0.5 z-20">
                    <Grip size={8} />
                  </div>
                  <div className="absolute -bottom-1.5 -left-1.5 bg-blue-500 w-3 h-3 rounded-full z-20"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 w-3 h-3 rounded-full z-20"></div>
                  <div className="absolute -top-1.5 -left-1.5 bg-blue-500 w-3 h-3 rounded-full z-20"></div>
                </>
              )}
            </Rnd>
          );
        })}

        {collabMode &&
          showPresencePanel &&
          Object.entries(cursors).map(([userId, cursor]) => (
            <CollaboratorCursor
              key={userId}
              cursor={cursor}
              containerRef={containerRef}
            />
          ))}

        <Comments
          db={db}
          templateId={templateId}
          currentProjectId={currentProjectId}
          comments={comments}
          resolveUserName={resolveUserName}
          canEdit={canEdit}
          onRefresh={fetchComments}
          initialOpenComponentId={initialOpenComponentId || focusComponentId}
          tempPin={tempPin}
          clearTempPin={clearTempPin}
          openSignal={openSignal}
          availableUsers={allAvailableUsers}
          resolveNameToUid={resolveNameToUid}
          hideAllComments={hideAllComments}
        />
      </div>
    </div>
  );
};
// Add this helper above renderComponent (shared by editor and preview)
const buildStyleAndClasses = (item, theme) => {
  const label = (item.label || "").toLowerCase();

  const themeBg =
    theme.colors?.componentSpecific?.[label]?.background ??
    (["button", "nav", "footer"].includes(label)
      ? theme.colors.neutral
      : undefined);

  const bgToken = item.bgColor ?? themeBg;
  const bgClass =
    typeof bgToken === "string" && bgToken.startsWith("bg-")
      ? bgToken
      : undefined;
  const backgroundStyle =
    bgToken && !bgClass ? { backgroundColor: bgToken } : {};

  let color =
    item.color ??
    theme.colors?.componentSpecific?.[label]?.textColor ??
    theme.colors.text;

  // Auto-contrast if background is dark and color not explicitly set
  const darkBgHexes = ["#111827", "#1f2937", "#000000"];
  if (
    !item.color &&
    backgroundStyle.backgroundColor &&
    darkBgHexes.includes(backgroundStyle.backgroundColor.toLowerCase())
  ) {
    color = "#ffffff";
  }

  const fontFamily =
    item.fontFamily ||
    (label === "heading"
      ? theme.typography.headingFont
      : theme.typography.bodyFont);

  const fontSize =
    item.fontSize ??
    (label === "heading"
      ? theme.typography.baseFontSize * 1.5
      : theme.typography.baseFontSize);

  const style = {
    ...backgroundStyle,
    color,
    ...(item.borderStyle && item.borderStyle !== "none"
      ? {
          borderStyle: item.borderStyle,
          borderWidth:
            item.borderWidth !== undefined
              ? `${item.borderWidth}px`
              : undefined,
          borderColor: item.borderColor || "#000000",
        }
      : {}),
    ...(item.opacity !== undefined ? { opacity: item.opacity / 100 } : {}),
    fontWeight: item.fontWeight ?? (label === "heading" ? "bold" : "normal"),
    fontSize: `${fontSize}px`,
    fontFamily,
    ...(item.borderRadius !== undefined
      ? { borderRadius: `${item.borderRadius}px` }
      : {}),
    ...(theme.shadows?.default && theme.shadows.default !== "none"
      ? {
          boxShadow:
            item.shadow && item.shadow !== "none"
              ? undefined
              : theme.shadows.default,
        }
      : {}),
  };

  const shadowClass = item.shadow && item.shadow !== "none" ? item.shadow : "";

  return { style, bgClass, shadowClass };
};
// Utility function to render different component types
const renderComponent = (item, theme) => {
  // Get component-specific styles from theme
  const getComponentThemeStyles = (component, themeObj) => {
    if (!themeObj || !themeObj.colors || !themeObj.colors.componentSpecific) {
      return {};
    }

    const componentType = component.label.toLowerCase();
    const componentTheme = themeObj.colors.componentSpecific[componentType];

    if (!componentTheme) {
      return {};
    }

    // Build style object based on component type
    const themeStyles = {};

    if (componentTheme.background) {
      themeStyles.backgroundColor = componentTheme.background;
    }

    if (componentTheme.textColor) {
      themeStyles.color = componentTheme.textColor;
    }

    if (
      componentType === "button" &&
      componentTheme.borderRadius !== undefined
    ) {
      themeStyles.borderRadius = `${componentTheme.borderRadius}px`;
    }

    return themeStyles;
  };

  // Get component-specific theme styles
  const componentThemeStyles = getComponentThemeStyles(item, theme);

  const text = item.text || "";

  const label = item.label?.toLowerCase();

  const bgColor =
    item.bgColor !== undefined && item.bgColor !== ""
      ? item.bgColor
      : theme.colors?.componentSpecific?.[label]?.background ??
        (["button", "nav", "footer"].includes(label)
          ? theme.colors.neutral
          : undefined);

  const color =
    item.color !== undefined && item.color !== ""
      ? item.color
      : theme.colors?.componentSpecific?.[label]?.textColor ??
        theme.colors.text;

  const fontFamily =
    item.fontFamily && item.fontFamily !== ""
      ? item.fontFamily
      : label === "heading" || "text"
      ? theme.typography.headingFont
      : theme.typography.bodyFont;

  const fontSize =
    item.fontSize !== undefined && item.fontSize !== ""
      ? item.fontSize
      : label === "heading"
      ? theme.typography.baseFontSize * 1.5
      : theme.typography.baseFontSize;
  const borderStyle =
    item.borderStyle && item.borderStyle !== "none"
      ? {
          borderStyle: item.borderStyle,
          borderWidth:
            item.borderWidth !== undefined
              ? `${item.borderWidth}px`
              : undefined,
          borderColor: item.borderColor || "#000000",
        }
      : {};

  const fontWeight =
    item.fontWeight !== undefined && item.fontWeight !== ""
      ? item.fontWeight
      : label === "heading"
      ? "bold"
      : "normal";

  const borderRadius =
    item.borderRadius !== undefined && item.borderRadius !== ""
      ? item.borderRadius
      : theme.spacing?.componentSpecific?.[label]?.borderRadius ??
        (["button", "input", "image", "nav", "footer"].includes(label)
          ? theme.spacing.borderRadius
          : undefined);

  // Create shadow styling
  const shadowClass =
    item.shadow && item.shadow !== "none"
      ? item.shadow
      : theme.shadows?.default && theme.shadows.default !== "none"
      ? ""
      : "";
  const boxShadow =
    item.shadow && item.shadow !== "none"
      ? undefined
      : theme.shadows?.default && theme.shadows.default !== "none"
      ? theme.shadows.default
      : undefined;
  // Create opacity styling
  const opacityStyle =
    item.opacity !== undefined
      ? {
          opacity: item.opacity / 100,
        }
      : {};

  // Combine all styles
  const combinedStyle = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    color,
    ...borderStyle,
    ...opacityStyle,
    ...(fontWeight ? { fontWeight } : {}),
    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(borderRadius !== undefined
      ? { borderRadius: `${borderRadius}px` }
      : {}),
    ...(boxShadow ? { boxShadow } : {}),
  };

  // Special component-specific style handling
  const getComponentSpecificStyles = (componentType) => {
    // Default border styles for specific components
    if (
      componentType === "input" &&
      (!item.borderStyle || item.borderStyle === "none")
    ) {
      return {
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "#d1d5db",
        borderRadius: item.borderRadius ? `${item.borderRadius}px` : "4px",
      };
    }

    if (
      componentType === "image" &&
      (!item.borderStyle || item.borderStyle === "none")
    ) {
      return {
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "#d1d5db",
      };
    }

    return {};
  };

  // Now in each component case, apply the specific styles

  switch (item.label) {
    // Other cases...

    case "input":
      return (
        <input
          className={`p-2 w-full h-full ${shadowClass}`}
          placeholder="Enter text..."
          value={text}
          readOnly
          style={{
            ...combinedStyle,
            ...getComponentSpecificStyles("input"),
          }}
        />
      );

    case "image":
      return (
        <div
          className={`w-full h-full overflow-hidden ${shadowClass}`}
          style={{
            ...combinedStyle,
            ...getComponentSpecificStyles("image"),
            position: "relative", // Needed for proper layout
          }}
        >
          <img
            src={
              item.imgUrl ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGh5WFH8TOIfRKxUrIgJZoDCs1yvQ4hIcppw&s"
            }
            alt="preview"
            className="w-full h-full"
            style={{
              objectFit: item.objectFit || "cover",
              ...opacityStyle,
              pointerEvents: "none", // This is the critical fix - prevents img from capturing events
              userSelect: "none", // Prevent selection highlighting
            }}
            draggable={false} // Prevent default HTML drag behavior
          />
        </div>
      );
    // Update the renderComponent function's icon case:

    case "icon":
      // If the component has an iconKey referencing a built-in react-icon, render that component.
      if (item.iconKey) {
        const comp = BUILT_IN_ICONS.find((b) => b.id === item.iconKey)?.Comp;
        if (comp) {
          const IconComp = comp;
          return (
            <div
              className={`flex items-center justify-center w-full h-full ${shadowClass}`}
              style={{
                ...combinedStyle,
                backgroundColor: item.bgColor || "transparent",
                pointerEvents: "none",
              }}
            >
              <IconComp
                size={Math.min(Math.max(item.box?.[2] || 24, 16), 64)}
                color={item.color || undefined}
              />
            </div>
          );
        }
      }
      // Fallback: render as image (SVG/PNG assets)
      return (
        <div
          className={`flex items-center justify-center w-full h-full ${shadowClass}`}
          style={{
            ...combinedStyle,
            backgroundColor: item.bgColor || "transparent",
            pointerEvents: "none",
          }}
        >
          <img
            src={
              item.imgUrl ||
              "https://www.iconpacks.net/icons/1/free-star-icon-984-thumb.png"
            }
            alt="icon"
            className="w-full h-full"
            style={{
              objectFit: item.objectFit || "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
            draggable={false}
          />
        </div>
      );
    case "nav": {
      const navItems = Array.isArray(item.menuItems)
        ? item.menuItems
        : ["Home", "About", "Contact"];
      const auto = !!item.enableAutoLinks;
      const alignment = item.alignment || "center"; // left | center | right
      const logoType = item.logoType || "none";
      const menuLinks = item.menuLinks || {};
      const logoTemplate = item.logoTemplate || "";
      const justify =
        alignment === "left"
          ? "justify-start"
          : alignment === "right"
          ? "justify-end"
          : "justify-center";

      // build logo element (static in editor)
      let logoEl = null;
      if (logoType === "text" && item.logoText) {
        logoEl = (
          <div
            className="font-semibold mr-6 select-none"
            style={{ color: item.color || combinedStyle.color }}
          >
            {item.logoText}
          </div>
        );
      } else if (logoType === "image" && item.logoUrl) {
        logoEl = (
          <div className="mr-6 select-none" style={{ width: 48, height: 32 }}>
            <img
              src={item.logoUrl}
              alt="logo"
              className="h-full w-full object-contain"
              draggable={false}
              style={{ pointerEvents: "none" }}
            />
          </div>
        );
      }

      return (
        <nav
          className={`flex items-center h-full px-4 gap-6 ${justify} ${
            bgColor?.startsWith("bg-") ? bgColor : ""
          } ${shadowClass}`}
          style={combinedStyle}
        >
          {logoEl}
          <div className={`flex gap-6 ${justify} flex-wrap`}>
            {navItems.map((navItem, i) => (
              <span
                key={i}
                className="cursor-default select-none"
                style={{ color: combinedStyle.color }}
                title={
                  auto || menuLinks[navItem]
                    ? `Link: /${(menuLinks[navItem] || navItem)
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")}`
                    : ""
                }
              >
                {navItem}
              </span>
            ))}
          </div>
        </nav>
      );
    }

    case "button":
      return (
        <button
          className={`${
            bgColor?.startsWith("bg-") ? bgColor : "bg-blue-500"
          } hover:opacity-90 text-white p-2 w-full h-full ${shadowClass}`}
          style={combinedStyle}
        >
          {text || "Button"}
        </button>
      );

    case "text":
      return (
        <p
          className={`text-base w-full h-full ${shadowClass}`}
          style={combinedStyle} // This already includes all our styles
        >
          {text || "Sample text goes here."}
        </p>
      );

    case "heading":
      return (
        <h2
          className={`text-2xl font-bold w-full h-full ${shadowClass}`}
          style={combinedStyle} // This already includes all our styles
        >
          {text || "Heading Text"}
        </h2>
      );

    case "radio button":
      return (
        <div
          className={`flex items-center gap-2 w-full h-full ${shadowClass}`}
          style={combinedStyle}
        >
          <input type="radio" className="w-4 h-4" />
          <span>{text || "Option"}</span>
        </div>
      );

    case "checkbox":
      return (
        <div
          className={`flex items-center gap-2 w-full h-full ${shadowClass}`}
          style={combinedStyle}
        >
          <input type="checkbox" className="w-4 h-4" />
          <span>{text || "Check me"}</span>
        </div>
      );

    case "footer":
      return (
        <footer
          className={`${
            bgColor?.startsWith("bg-") ? bgColor : ""
          } p-3 text-center w-full h-full ${shadowClass}`}
          style={combinedStyle} // This now properly includes component theme styles
        >
          {text || "Footer Content"}
        </footer>
      );
    case "card":
      return (
        <div
          className={`w-full h-full p-4 ${shadowClass}`}
          style={combinedStyle}
        >
          <div className="text-sm font-medium mb-2">
            {item.cardTitle || "Card Title"}
          </div>
          <div className="text-xs text-gray-600">
            {item.cardDescription ||
              "Card content goes here. This is a container for grouped information."}
          </div>
        </div>
      );

    case "badge":
      // Map badge types to colors
      const badgeColors = {
        primary: { bg: "#3b82f6", text: "#ffffff" },
        success: { bg: "#10b981", text: "#ffffff" },
        warning: { bg: "#f59e0b", text: "#ffffff" },
        danger: { bg: "#ef4444", text: "#ffffff" },
        info: { bg: "#06b6d4", text: "#ffffff" },
      };

      const badgeType = item.badgeType || "primary";
      const badgeColor = badgeColors[badgeType] || badgeColors.primary;

      return (
        <div
          className={`inline-flex items-center justify-center px-2 py-1 w-full h-full ${shadowClass}`}
          style={{
            ...combinedStyle,
            // ✅ FIX: Override bgColor and color with badge type colors
            backgroundColor: badgeColor.bg,
            color: badgeColor.text,
            whiteSpace: "nowrap",
          }}
        >
          {item.text || "Badge"}
        </div>
      );
    case "avatar":
      return (
        <div
          className={`overflow-hidden ${shadowClass}`}
          style={{
            ...combinedStyle,
            borderRadius: item.borderRadius || "9999px", // Circular by default
          }}
        >
          <img
            src={item.imgUrl || "https://i.pravatar.cc/150"}
            alt="avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: item.objectFit || "cover",
            }}
          />
        </div>
      );
    case "alert":
      // Map alert types to styles
      const alertStyles = {
        info: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
        success: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
        warning: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
        error: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
      };

      const alertType = item.alertType || "info";
      const alertStyle = alertStyles[alertType] || alertStyles.info;

      return (
        <div
          className={`w-full h-full p-3 flex items-center ${shadowClass}`}
          style={{
            ...combinedStyle,
            // ✅ FIX: Override bgColor and color with alert type colors
            backgroundColor: alertStyle.bg,
            color: alertStyle.text,
            borderColor: alertStyle.border,
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <div className="flex-1">
            {item.text || "This is an alert message"}
          </div>
          {item.dismissible !== false && (
            <button className="ml-2 opacity-50 hover:opacity-100">✕</button>
          )}
        </div>
      );
    case "progress":
      const progressValue = item.progressValue || 50;
      const showLabel = item.showLabel !== false;

      return (
        <div className={`w-full h-full ${shadowClass}`} style={combinedStyle}>
          <div className="w-full bg-gray-200 rounded-full h-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressValue}%`,
                backgroundColor: item.bgColor || "#3b82f6",
              }}
            />
            {showLabel && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {progressValue}%
              </div>
            )}
          </div>
        </div>
      );

    case "toggle":
      const toggleState = item.toggleState || false;

      return (
        <div
          className={`flex items-center gap-2 w-full h-full ${shadowClass}`}
          style={combinedStyle}
        >
          <div
            className={`w-12 h-6 rounded-full relative flex items-center transition-colors ${
              toggleState ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-transform ${
                toggleState ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm" style={{ color: combinedStyle.color }}>
            {item.text || "Toggle"}
          </span>
        </div>
      );

    case "tooltip":
      const tooltipPosition = item.tooltipPosition || "top";

      return (
        <div
          className={`inline-flex items-center justify-center px-3 py-1 w-full h-full ${shadowClass}`}
          style={{
            ...combinedStyle,
            whiteSpace: "nowrap",
            display: "inline-flex",
          }}
        >
          {item.text || "Tooltip"}
        </div>
      );

    case "divider":
      const orientation = item.orientation || "horizontal";
      const lineStyle = item.lineStyle || "solid";

      return (
        <div
          className={`w-full h-full ${shadowClass}`}
          style={{
            ...combinedStyle,
            borderStyle: lineStyle,
            borderWidth:
              orientation === "horizontal" ? "1px 0 0 0" : "0 0 0 1px",
            borderColor: item.color || "#000000", // ✅ Use color property, default to black
          }}
        />
      );
    case "tabs":
      const tabItems = item.menuItems || ["Tab 1", "Tab 2", "Tab 3"];

      // Check if this is the "Pills" style variant
      const isPillsStyle =
        item.bgColor === "#f3f4f6" && item.borderRadius >= 20;

      return (
        <div
          className={`w-full h-full flex ${shadowClass}`}
          style={{
            ...combinedStyle,
            gap: isPillsStyle ? "4px" : "0",
            padding: isPillsStyle ? "4px" : "0",
          }}
        >
          {tabItems.map((tab, i) => (
            <div
              key={i}
              className={`flex-1 flex items-center justify-center transition-all ${
                isPillsStyle ? "rounded-full px-4" : "border-b-2"
              } ${
                i === 0
                  ? isPillsStyle
                    ? "bg-white shadow-sm"
                    : "border-blue-500 text-blue-600"
                  : isPillsStyle
                  ? "hover:bg-white/50"
                  : "border-transparent text-gray-600"
              }`}
              style={{
                fontSize: combinedStyle.fontSize || "14px",
                fontFamily: combinedStyle.fontFamily,
                color:
                  i === 0 && !isPillsStyle ? "#2563eb" : combinedStyle.color,
              }}
            >
              <span className="text-sm">{tab}</span>
            </div>
          ))}
        </div>
      );

    case "breadcrumb":
      const breadcrumbPath = item.breadcrumbPath || "Home / Products / Item";

      // Split by / but preserve emojis/icons
      const parts = breadcrumbPath.split("/").map((s) => s.trim());

      return (
        <div
          className={`flex items-center w-full h-full ${shadowClass}`}
          style={combinedStyle}
        >
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {/* Render the part - emojis will naturally display */}
              <span style={{ whiteSpace: "pre" }}>{part}</span>
              {i < parts.length - 1 && (
                <span className="mx-2" style={{ opacity: 0.5 }}>
                  {/* Use › for better separator if the variant has it */}
                  {breadcrumbPath.includes("›") ? "›" : "/"}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      );

    case "hamburger":
      // Don't use hooks here - just render a static preview
      const menuItems = item.menuItems || ["Home", "About", "Contact"];

      return (
        <div
          className={`relative w-full h-full ${shadowClass}`}
          style={combinedStyle}
        >
          {/* Hamburger Icon Button - Static preview */}
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-1 p-2"
            style={{
              backgroundColor: combinedStyle.backgroundColor,
              borderRadius: combinedStyle.borderRadius,
            }}
          >
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: combinedStyle.color || "#111827" }}
            />
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: combinedStyle.color || "#111827" }}
            />
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: combinedStyle.color || "#111827" }}
            />
          </div>

          {/* Static dropdown preview (editor only) */}
          {item.showMenu && (
            <div
              className="absolute top-full right-0 min-w-[200px] shadow-lg rounded-md overflow-hidden z-50 pointer-events-none"
              style={{
                backgroundColor: combinedStyle.backgroundColor || "#ffffff",
                border: `1px solid ${combinedStyle.borderColor || "#e5e7eb"}`,
              }}
            >
              {/* ✅ FIX: Use actual menuItems from component, filter out empty items */}
              {menuItems.filter(Boolean).map((menuItem, i) => (
                <div
                  key={i}
                  className="px-4 py-3 border-b last:border-b-0"
                  style={{
                    color: combinedStyle.color || "#111827",
                    fontSize: combinedStyle.fontSize || "14px",
                    fontFamily: combinedStyle.fontFamily,
                    borderColor: combinedStyle.borderColor || "#e5e7eb",
                  }}
                >
                  {menuItem}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    // ...existing code...
    case "carousel":
      // Static preview for editor - no interactivity
      const images = item.images || [
        "https://picsum.photos/800/400?random=1",
        "https://picsum.photos/800/400?random=2",
        "https://picsum.photos/800/400?random=3",
      ];

      const showArrows = item.showArrows !== false;
      const showDots = item.showDots !== false;
      const currentSlideIndex = item.currentSlide || 0;

      return (
        <div
          className={`relative w-full h-full overflow-hidden ${shadowClass} z-50`}
          style={combinedStyle}
        >
          {/* Images - show only current slide */}
          <div className="relative w-full h-full">
            <img
              src={images[currentSlideIndex % images.length]}
              alt={`Slide ${currentSlideIndex + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
              style={{
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>

          {/* Static Navigation Arrows - visual only */}
          {showArrows && (
            <>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg z-10 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg z-10 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </>
          )}

          {/* Static Dots Indicator - visual only */}
          {showDots && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 pointer-events-none">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlideIndex ? "bg-white w-8" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Slide Counter */}
          <div
            className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10"
            style={{ pointerEvents: "none" }}
          >
            {currentSlideIndex + 1} / {images.length}
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center border border-dashed border-gray-300 w-full h-full rounded-lg">
          <span className="text-gray-400">Unknown component: {item.label}</span>
        </div>
      );
  }
};

const GridOverlay = ({ size, enabled }) => {
  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
            linear-gradient(to right, rgba(81, 92, 230, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(81, 92, 230, 0.1) 1px, transparent 1px)
          `,
        backgroundSize: `${size}px ${size}px`,
        zIndex: 1,
      }}
    />
  );
};

const CommentPin = ({ comment, onOpen }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation();
      onOpen?.(comment.componentId);
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
        onOpen?.(comment.componentId);
      }
    }}
    className="absolute cursor-pointer"
    style={{
      left: `${comment.x * 100}%`,
      top: `${comment.y * 100}%`,
      transform: "translate(-50%,-50%)",
      zIndex: 99, // high so pins sit above components
      pointerEvents: "auto",
    }}
  >
    <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center select-none">
      C
    </div>
  </div>
);

const Comments = ({
  db,
  templateId,
  currentProjectId,
  comments = [],
  resolveUserName,
  canEdit,
  onRefresh,
  initialOpenComponentId,
  tempPin,
  clearTempPin,
  openSignal,
  availableUsers = {},
  resolveNameToUid,
  hideAllComments = false,
}) => {
  const [openComponentId, setOpenComponentId] = useState(null);
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionRange, setMentionRange] = useState(null); // {start, end, query}
  const [localMentionUids, setLocalMentionUids] = useState([]); // uids selected via suggestions
  const textareaRef = useRef(null); // Add ref for textarea

  // parse @tokens into simple tag list (used for UI / legacy tags)
  const parseTags = (inputText = "") => {
    const tags = [];
    const re = /@([a-zA-Z0-9_.-]+)/g;
    let m;
    while ((m = re.exec(inputText))) {
      tags.push(m[1]);
    }
    return tags;
  };

  useEffect(() => {
    if (initialOpenComponentId) {
      setOpenComponentId(initialOpenComponentId);
    }
  }, [initialOpenComponentId, openSignal]);

  // Fixed mention detection and suggestion logic
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    const caret = e.target.selectionStart || 0;

    // Find the last @ symbol before the caret
    const textBeforeCaret = val.slice(0, caret);
    const lastAtIndex = textBeforeCaret.lastIndexOf("@");

    if (lastAtIndex === -1) {
      // No @ found
      setShowSuggestions(false);
      setSuggestions([]);
      setMentionRange(null);
      return;
    }

    // Get text after the @ symbol
    const afterAt = textBeforeCaret.slice(lastAtIndex + 1);

    // Check if there's a space after @ (which would close the mention)
    if (afterAt.includes(" ")) {
      setShowSuggestions(false);
      setSuggestions([]);
      setMentionRange(null);
      return;
    }

    // Valid mention query - show suggestions
    const query = afterAt.toLowerCase();
    const filteredUsers = Object.entries(availableUsers || {})
      .filter(([, name]) => name && name.toLowerCase().includes(query))
      .slice(0, 6)
      .map(([uid, name]) => ({ uid, name }));

    setSuggestions(filteredUsers);
    setShowSuggestions(filteredUsers.length > 0);
    setMentionRange({
      start: lastAtIndex,
      end: caret,
      query: afterAt,
    });
  };

  const chooseSuggestion = (suggestion) => {
    if (!mentionRange) return;

    // Replace the @query with @name
    const before = text.slice(0, mentionRange.start);
    const after = text.slice(mentionRange.end);
    const inserted = `@${suggestion.name} `;
    const newText = before + inserted + after;

    setText(newText);

    // Track the selected UID
    setLocalMentionUids((prev) =>
      Array.from(new Set([...prev, suggestion.uid]))
    );

    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionRange(null);

    // Focus textarea and move cursor to end of inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = before.length + inserted.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const parseTagsToUids = (text) => {
    // Parse @name tokens and try to resolve to uids
    const re = /@([a-zA-Z0-9_.-]+)/g;
    const uids = [];
    let m;

    while ((m = re.exec(text))) {
      const name = m[1];

      // Try to resolve name to UID
      const uid = resolveNameToUid ? resolveNameToUid(name) : null;
      if (uid && !uids.includes(uid)) {
        uids.push(uid);
      } else {
        // Try exact match in availableUsers values
        const found = Object.entries(availableUsers).find(
          ([, display]) =>
            display && display.toLowerCase() === name.toLowerCase()
        );
        if (found && !uids.includes(found[0])) {
          uids.push(found[0]);
        }
      }
    }

    // Include any local picks from suggestions
    localMentionUids.forEach((u) => {
      if (!uids.includes(u)) uids.push(u);
    });

    return uids;
  };

  const addComment = async (componentId, x = 0.5, y = 0.5) => {
    if (!canEdit && !auth?.currentUser)
      return alert("Login required to comment.");
    if (!templateId) {
      console.warn("addComment: no templateId", { componentId, x, y });
      alert("Open a template before adding comments.");
      return;
    }

    // Prefer coordinates from a tempPin (freshly placed pin)
    if (tempPin && tempPin.pinId === componentId) {
      x = tempPin.x;
      y = tempPin.y;
    } else {
      // If replying to an existing thread, reuse that thread's coords
      const existing = comments.find((c) => c.componentId === componentId);
      if (existing) {
        x = existing.x;
        y = existing.y;
      }
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    const mentionUids = parseTagsToUids(trimmed);

    const comment = {
      id: `c-${Date.now()}`,
      componentId,
      x,
      y,
      authorId: auth.currentUser?.uid || "anon",
      text: trimmed,
      tags: parseTags(trimmed),
      mentions: mentionUids,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    console.log("Adding comment:", comment);

    try {
      let ref;
      // Check if template is in a project or top-level
      if (currentProjectId) {
        const projectRef = doc(db, "projects", currentProjectId);
        ref = doc(projectRef, "templates", templateId);
      } else {
        ref = doc(db, "templates", templateId);
      }

      await updateDoc(ref, { comments: arrayUnion(comment) });

      setText("");
      setLocalMentionUids([]);
      onRefresh?.();
      setOpenComponentId(componentId);
      clearTempPin?.();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment: " + (error.message || error));
    }
  };

  const deleteComment = async (comment) => {
    if (!templateId || !comment) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      alert("Login required to delete comments.");
      return;
    }
    if (comment.authorId !== uid && !canEdit) {
      alert("You don't have permission to delete this comment.");
      return;
    }
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    try {
      let templateRef;
      // Check if template is in a project or top-level
      if (currentProjectId) {
        const projectRef = doc(db, "projects", currentProjectId);
        templateRef = doc(projectRef, "templates", templateId);
      } else {
        templateRef = doc(db, "templates", templateId);
      }

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(templateRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const updated = (data.comments || []).filter(
          (c) => c.id !== comment.id
        );
        tx.update(templateRef, { comments: updated });
      });

      onRefresh?.();
      const remaining = comments.filter(
        (c) => c.componentId === comment.componentId && c.id !== comment.id
      );
      if (remaining.length === 0) setOpenComponentId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment: " + (error.message || error));
    }
  };

  const openThread = (componentId) => {
    setOpenComponentId(componentId);
  };

  const threadComments = comments.filter(
    (c) => c.componentId === openComponentId
  );

  // anchor logic unchanged
  const anchor =
    comments.find((c) => c.componentId === openComponentId) ||
    (tempPin && tempPin.pinId === openComponentId ? tempPin : null);

  const anchorStyle = anchor && {
    position: "absolute",
    left: `${anchor.x * 100}%`,
    top: `${anchor.y * 100}%`,
    transform: "translate(-50%, -110%)",
    zIndex: 99999,
  };

  // render comment text with mentions shown as display names (highlight)
  const renderCommentText = (c) => {
    if (c.mentions && c.mentions.length > 0) {
      let t = c.text;
      c.mentions.forEach((uid) => {
        const name = resolveUserName
          ? resolveUserName(uid)
          : availableUsers[uid];
        if (!name) return;
        // replace '@name' (case-insensitive) with a highlighted span
        const re = new RegExp(
          `@${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          "gi"
        );
        t = t.replace(re, `@@@${uid}@@@`); // temporary marker
      });
      // split back into elements
      const parts = t.split(/(@@@.+?@@@)/g);
      return parts.map((p, i) => {
        const m = p.match(/^@@@(.+)@@@$/);
        if (m) {
          const uid = m[1];
          const name = resolveUserName
            ? resolveUserName(uid)
            : availableUsers[uid];
          return (
            <span key={i} className="text-blue-600 font-medium">
              {`@${name}`}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      });
    }
    // fallback: render raw text
    return <span>{c.text}</span>;
  };

  return (
    <>
      {/* tempPin + pins - hide if hideAllComments is true */}
      {!hideAllComments && tempPin && (
        <CommentPin
          comment={{
            id: tempPin.pinId,
            componentId: tempPin.pinId,
            x: tempPin.x,
            y: tempPin.y,
            text: "(new pin)",
          }}
          onOpen={() => {
            setOpenComponentId(tempPin.pinId);
          }}
        />
      )}
      {!hideAllComments &&
        comments.map((c) => (
          <CommentPin key={c.id} comment={c} onOpen={openThread} />
        ))}
      {anchor && openComponentId && (
        <div
          style={anchorStyle}
          onClick={(e) => e.stopPropagation()}
          className="w-80 bg-white border rounded-lg shadow-lg p-3"
        >
          {/* header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">
                {resolveUserName && auth.currentUser
                  ? (resolveUserName(auth.currentUser.uid) || "U").charAt(0)
                  : "U"}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {threadComments[0]
                    ? resolveUserName(threadComments[0].authorId)
                    : "New comment"}
                </div>
                <div className="text-xs text-gray-400">
                  {threadComments[0]
                    ? new Date(threadComments[0].createdAt).toLocaleString()
                    : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setOpenComponentId(null)}
              >
                Close
              </button>
            </div>
          </div>

          {/* thread messages */}
          <div className="max-h-40 overflow-y-auto mb-2 space-y-2">
            {threadComments.length === 0 && (
              <div className="text-sm text-gray-500">No comments yet.</div>
            )}
            {threadComments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {resolveUserName ? resolveUserName(c.authorId) : c.authorId}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm mt-1">{renderCommentText(c)}</div>
                {(auth.currentUser?.uid === c.authorId || canEdit) && (
                  <div className="flex justify-end mt-1">
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => deleteComment(c)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* composer + suggestions */}
          <div className="flex flex-col space-y-2 relative">
            <textarea
              ref={textareaRef}
              className="comments-textarea w-full px-2 py-2 border rounded resize-none text-sm"
              rows={3}
              value={text}
              onChange={handleTextChange}
              placeholder="Write a comment... use @ to mention"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 bottom-full mb-1 bg-white border rounded shadow-md w-full z-50 max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <div
                    key={s.uid}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => chooseSuggestion(s)}
                  >
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.uid}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {canEdit ? "" : "View-only"}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                  onClick={() => {
                    setText("");
                    setLocalMentionUids([]);
                    clearTempPin?.();
                    setOpenComponentId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  onClick={() => addComment(openComponentId)}
                  disabled={!canEdit || !text.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Visual Template Organizer — shows visual previews in a grid and lets user open a template

const TemplateOrganizer = ({
  templates = [],
  onOpen,
  onClose,
  previewWidth = 280,
}) => {
  const scaleFor = (tplWidth, tplHeight, maxW) => {
    if (!tplWidth || !tplHeight) return 1;
    return Math.min(1, maxW / tplWidth);
  };

  const modal = (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
      style={{ zIndex: 2147483647 }}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-auto p-6"
        style={{ zIndex: 2147483648 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Templates</h2>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-gray-500">You have no templates yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((tpl) => {
              const cw = tpl.canvasWidth || 640;
              const ch = tpl.canvasHeight || 640;
              const scale = scaleFor(cw, ch, previewWidth);
              const previewHeight = Math.max(80, Math.round(ch * scale));
              return (
                <div key={tpl.id} className="flex flex-col items-stretch gap-2">
                  <div
                    className="border rounded overflow-hidden bg-white shadow-sm cursor-pointer"
                    style={{ width: previewWidth, height: previewHeight }}
                    onClick={() => onOpen?.(tpl)}
                  >
                    <div
                      style={{
                        width: cw,
                        height: ch,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        position: "relative",
                        pointerEvents: "none",
                      }}
                    >
                      {(Array.isArray(tpl.components)
                        ? tpl.components
                        : []
                      ).map((c) => {
                        if (!c || !c.box) return null;
                        const [x, y, w, h] = c.box;
                        const style = {
                          position: "absolute",
                          left: x,
                          top: y,
                          width: w,
                          height: h,
                          overflow: "hidden",
                          pointerEvents: "none",
                        };
                        return (
                          <div
                            key={c.id || `${tpl.id}-${Math.random()}`}
                            style={style}
                          >
                            {renderComponent(c, tpl.theme || {})}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ maxWidth: previewWidth - 80 }}
                    >
                      {tpl.name || "Untitled"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen?.(tpl);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
};

const PreviewModal = ({ componentsByViewport, currentTheme, onClose }) => {
  const [selectedViewport, setSelectedViewport] = useState("desktop");

  const viewportDimensions = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  };

  // Render components for the selected viewport
  const renderPreview = () => {
    const viewportComponents = componentsByViewport[selectedViewport] || [];
    if (viewportComponents.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg">No components in {selectedViewport} view</p>
            <p className="text-sm mt-2">
              Switch to a different viewport or add components in the editor
            </p>
          </div>
        </div>
      );
    }

    const dims = viewportDimensions[selectedViewport];
    const sortedComponents = [...viewportComponents].sort(
      (a, b) => a.box[1] - b.box[1]
    );

    return (
      <div
        className="relative bg-white text-gray-800 mx-auto"
        style={{
          width: "100%",
          maxWidth: `${dims.width}px`,
          aspectRatio: `${dims.width} / ${dims.height}`,
          minHeight: "100%",
        }}
      >
        {sortedComponents.map((component) => {
          const [x, y, width, height] = component.box;
          const { width: vw, height: vh } = dims;

          // Position in % (matching editor)
          const pos = {
            position: "absolute",
            left: `${((x / vw) * 100).toFixed(2)}%`,
            top: `${((y / vh) * 100).toFixed(2)}%`,
            width: `${((width / vw) * 100).toFixed(2)}%`,
            height: `${((height / vh) * 100).toFixed(2)}%`,
          };

          // Get same style tokens as editor
          const {
            style: tokenStyle,
            bgClass,
            shadowClass,
          } = buildStyleAndClasses(component, currentTheme);

          // Merge (do NOT reassign color later)
          const style = { ...tokenStyle, ...pos };
          const twTokens = [bgClass, shadowClass].filter(Boolean).join(" ");

          // Render based on component type
          switch (component.label) {
            case "input":
              return (
                <input
                  key={component.id}
                  className={`p-2 border rounded ${twTokens}`}
                  style={style}
                  placeholder={component.text || "Enter text..."}
                  readOnly
                />
              );

            case "button":
              return (
                <button
                  key={component.id}
                  className={`text-white hover:opacity-90 ${twTokens}`}
                  style={style}
                >
                  {component.text || "Button"}
                </button>
              );

            case "heading":
              return (
                <h2
                  key={component.id}
                  className={`font-bold ${shadowClass}`}
                  style={style}
                >
                  {component.text || "Heading Text"}
                </h2>
              );

            case "text":
              return (
                <p key={component.id} className={shadowClass} style={style}>
                  {component.text || "Sample text goes here."}
                </p>
              );

            case "checkbox":
              return (
                <div
                  key={component.id}
                  className={`flex items-center gap-2 ${shadowClass}`}
                  style={style}
                >
                  <input type="checkbox" className="w-4 h-4" />
                  <span>{component.text || "Check me"}</span>
                </div>
              );

            case "radio button":
              return (
                <div
                  key={component.id}
                  className={`flex items-center gap-2 ${shadowClass}`}
                  style={style}
                >
                  <input type="radio" className="w-4 h-4" />
                  <span>{component.text || "Option"}</span>
                </div>
              );

            case "nav": {
              const menuItems = component.menuItems || [
                "Home",
                "About",
                "Contact",
              ];
              const alignment = component.alignment || "center";
              const logoType = component.logoType || "none";
              const menuLinks = component.menuLinks || {};
              const auto = !!component.enableAutoLinks;
              const logoTemplate = component.logoTemplate || "";
              const justify =
                alignment === "left"
                  ? "justify-start"
                  : alignment === "right"
                  ? "justify-end"
                  : "justify-center";

              const toSlug = (s) =>
                s
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "") || "page";

              const linkFor = (item) =>
                menuLinks[item]
                  ? toSlug(menuLinks[item])
                  : auto
                  ? toSlug(item)
                  : null;

              let logoEl = null;
              if (logoType === "text" && component.logoText) {
                const logoSlug = logoTemplate ? toSlug(logoTemplate) : null;
                logoEl = logoSlug ? (
                  <a
                    href={`/${logoSlug}`}
                    className="font-semibold mr-6"
                    style={{ color: style.color }}
                    onClick={(e) => e.preventDefault()}
                  >
                    {component.logoText}
                  </a>
                ) : (
                  <div
                    className="font-semibold mr-6 select-none"
                    style={{ color: style.color }}
                  >
                    {component.logoText}
                  </div>
                );
              } else if (logoType === "image" && component.logoUrl) {
                const logoSlug = logoTemplate ? toSlug(logoTemplate) : null;
                logoEl = (
                  <a
                    href={logoSlug ? `/${logoSlug}` : "#"}
                    className="mr-6 block"
                    onClick={(e) => e.preventDefault()}
                    style={{ width: 48, height: 32 }}
                  >
                    <img
                      src={component.logoUrl}
                      alt="logo"
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  </a>
                );
              }

              return (
                <nav
                  key={component.id}
                  className={`flex items-center px-4 gap-6 ${justify} ${shadowClass}`}
                  style={style}
                >
                  {logoEl}
                  <div className={`flex gap-6 ${justify} flex-wrap`}>
                    {menuItems.map((item, i) => {
                      const slug = linkFor(item);
                      return slug ? (
                        <a
                          key={i}
                          href={`/${slug}`}
                          className="hover:underline"
                          style={{ color: style.color }}
                          onClick={(e) => e.preventDefault()}
                        >
                          {item}
                        </a>
                      ) : (
                        <span
                          key={i}
                          className="select-none"
                          style={{ color: style.color }}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </nav>
              );
            }

            case "footer":
              return (
                <footer
                  key={component.id}
                  className={`p-3 text-center ${shadowClass}`}
                  style={style}
                >
                  {component.text || "Footer Content"}
                </footer>
              );

            case "image":
              return (
                <div
                  key={component.id}
                  className={`overflow-hidden ${shadowClass}`}
                  style={style}
                >
                  <img
                    src={component.imgUrl || "https://picsum.photos/300/200"}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: component.objectFit || "cover",
                    }}
                  />
                </div>
              );

            case "icon":
              return (
                <div
                  key={component.id}
                  className={`flex items-center justify-center ${shadowClass}`}
                  style={style}
                >
                  <img
                    src={
                      component.imgUrl ||
                      "https://www.iconpacks.net/icons/1/free-star-icon-984-thumb.png"
                    }
                    alt="icon"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: component.objectFit || "contain",
                    }}
                  />
                </div>
              );

            case "frame":
              return (
                <div key={component.id} className={shadowClass} style={style} />
              );
            case "hamburger":
              // This can use hooks because it's in a stable React component context
              const HamburgerMenu = ({ component: comp }) => {
                const [isOpen, setIsOpen] = React.useState(false);
                const items = comp.menuItems || ["Home", "About", "Contact"];

                return (
                  <div className="relative w-full h-full" style={style}>
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 hover:opacity-80"
                      style={{
                        backgroundColor: comp.bgColor,
                        borderRadius: `${comp.borderRadius}px`,
                      }}
                    >
                      <div
                        className="w-6 h-0.5 transition-transform"
                        style={{
                          backgroundColor: comp.color || "#111827",
                          transform: isOpen
                            ? "rotate(45deg) translateY(8px)"
                            : "none",
                        }}
                      />
                      <div
                        className="w-6 h-0.5 transition-opacity"
                        style={{
                          backgroundColor: comp.color || "#111827",
                          opacity: isOpen ? 0 : 1,
                        }}
                      />
                      <div
                        className="w-6 h-0.5 transition-transform"
                        style={{
                          backgroundColor: comp.color || "#111827",
                          transform: isOpen
                            ? "rotate(-45deg) translateY(-8px)"
                            : "none",
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="absolute top-full right-0 min-w-[200px] shadow-lg rounded-md overflow-hidden z-50"
                        style={{
                          backgroundColor: comp.bgColor || "#ffffff",
                          border: `1px solid ${comp.borderColor || "#e5e7eb"}`,
                        }}
                      >
                        {items.map((item, i) => (
                          <a
                            key={i}
                            href="#"
                            className="block px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                            style={{
                              color: comp.color || "#111827",
                              fontSize: `${comp.fontSize || 14}px`,
                              borderColor: comp.borderColor || "#e5e7eb",
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              };

              return <HamburgerMenu key={component.id} component={component} />;

            // Around line 4000 - Replace the carousel case in PreviewModal's renderPreview function:

            case "carousel":
              const CarouselPreview = ({ component: comp }) => {
                const [currentSlide, setCurrentSlide] = React.useState(
                  comp.currentSlide || 0
                );
                const images = comp.images || [
                  "https://picsum.photos/800/400?random=1",
                  "https://picsum.photos/800/400?random=2",
                  "https://picsum.photos/800/400?random=3",
                ];

                const nextSlide = () => {
                  setCurrentSlide((prev) => (prev + 1) % images.length);
                };

                const prevSlide = () => {
                  setCurrentSlide(
                    (prev) => (prev - 1 + images.length) % images.length
                  );
                };

                const goToSlide = (index) => {
                  setCurrentSlide(index);
                };

                // Only show controls if settings allow
                const showArrows = comp.showArrows !== false;
                const showDots = comp.showDots !== false;

                return (
                  <div
                    className={`relative w-full h-full overflow-hidden`}
                    style={style} // Use the style from parent scope
                  >
                    {/* Images */}
                    <div className="relative w-full h-full">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="absolute inset-0 transition-opacity duration-500"
                          style={{
                            opacity: index === currentSlide ? 1 : 0,
                            pointerEvents:
                              index === currentSlide ? "auto" : "none",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Navigation Arrows - MATCH EDITOR STYLING */}
                    {showArrows && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <svg
                            className="w-5 h-5 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <svg
                            className="w-5 h-5 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Dots Indicator - MATCH EDITOR STYLING */}
                    {showDots && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentSlide
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Slide Counter - MATCH EDITOR STYLING */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentSlide + 1} / {images.length}
                    </div>
                  </div>
                );
              };

              return (
                <CarouselPreview key={component.id} component={component} />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black z-[999999] flex flex-col"
      style={{ zIndex: 2147483647 }}
    >
      {/* Preview Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Preview</h2>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSelectedViewport("desktop")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                selectedViewport === "desktop"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Desktop
            </button>
            <button
              onClick={() => setSelectedViewport("tablet")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                selectedViewport === "tablet"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Tablet
            </button>
            <button
              onClick={() => setSelectedViewport("mobile")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                selectedViewport === "mobile"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Mobile
            </button>
          </div>

          <div className="text-sm text-gray-400">
            {viewportDimensions[selectedViewport].width}×
            {viewportDimensions[selectedViewport].height}
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Close Preview
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 pt-4">
        {renderPreview()}
      </div>
    </div>,
    document.body
  );
};

// Project Manager Component
const ProjectManager = ({
  onClose,
  projects,
  setProjects,
  currentProjectId,
  setCurrentProjectId,
  fetchUserProjects,
  createProject,
  openProjectFromWelcome,
}) => {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999999]"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[800px] max-w-[95vw] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Projects</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Your Projects</h3>
            <button
              onClick={async () => {
                await createProject();
                const updated = await fetchUserProjects();
                setProjects(updated);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg
                className="w-20 h-20 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <p className="text-xl font-medium mb-2">No projects yet</p>
              <p className="text-sm mb-6">
                Create your first project to organize your templates
              </p>
              <button
                onClick={async () => {
                  const projectId = await createProject();
                  if (projectId) {
                    await refreshExplorer(); // ✅ Ensure projects list is updated
                  }
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => {
                const templateCount = project.templates?.length || 0;
                const collaboratorCount =
                  Object.keys(project.collaborators || {}).length + 1; // +1 for owner

                return (
                  <div
                    key={project.id}
                    className={`border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer group ${
                      currentProjectId === project.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-blue-300"
                    }`}
                    onClick={() => {
                      openProjectFromWelcome(project.id);
                      onClose();
                    }}
                  >
                    {/* Project Icon & Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg text-gray-900 truncate">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>
                          {templateCount} template
                          {templateCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>
                          {collaboratorCount} member
                          {collaboratorCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">
                          {new Date(
                            project.createdAt?.seconds
                              ? project.createdAt.seconds * 1000
                              : project.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Current Project Badge */}
                    {currentProjectId === project.id && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Currently Open
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const NewTemplateWizard = ({
  projectId,
  onClose,
  onComplete,
  currentTheme,
}) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview/Name, 3: Processing
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDetectObjects = async () => {
    if (!image) return;
    setLoading(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = async () => {
      const aspectRatio = img.width / img.height;
      let targetWidth, targetHeight;

      if (aspectRatio > 1) {
        targetWidth = Math.min(640, img.width);
        targetHeight = targetWidth / aspectRatio;
      } else {
        targetHeight = Math.min(640, img.height);
        targetWidth = targetHeight * aspectRatio;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        async (blob) => {
          const formData = new FormData();
          formData.append("image", blob, "resized-wireframe.jpg");
          formData.append("originalWidth", img.width);
          formData.append("originalHeight", img.height);

          try {
            const response = await fetch(
              "http://localhost:5000/api/detect-objects",
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(errorDetails.message || response.statusText);
            }

            const data = await response.json();
            setDetectionResult(data);
            setStep(2);
          } catch (error) {
            console.error("Error:", error);
            alert("Failed to detect objects: " + error.message);
          } finally {
            setLoading(false);
          }
        },
        "image/jpeg",
        0.9
      );
    };

    img.src = URL.createObjectURL(image);
  };

  const transformDetections = () => {
    if (!detectionResult?.detections) return [];

    const containerTypes = ["container"];

    const navElements = detectionResult.detections
      .filter((detection) => detection.label.toLowerCase() === "nav")
      .map((detection) => {
        const [x, y, width, height] = detection.box;
        return {
          label: detection.label.toLowerCase(),
          x1: x - width / 2,
          y1: y - height / 2,
          x2: x + width / 2,
          y2: y + height / 2,
        };
      });

    const isInsideNav = (box) => {
      const [x, y, width, height] = box;
      const x1 = x - width / 2;
      const y1 = y - height / 2;
      const x2 = x + width / 2;
      const y2 = y + height / 2;

      return navElements.some((nav) => {
        if (nav.x1 === x1 && nav.y1 === y1 && nav.x2 === x2 && nav.y2 === y2) {
          return false;
        }
        return x1 >= nav.x1 && x2 <= nav.x2 && y1 >= nav.y1 && y2 <= nav.y2;
      });
    };

    return detectionResult.detections
      .filter((detection) => {
        const label = detection.label.toLowerCase();
        if (containerTypes.includes(label)) return false;
        if (label === "text" && isInsideNav(detection.box)) return false;
        return true;
      })
      .map((detection) => {
        const [x, y, width, height] = detection.box;
        const id =
          detection.id || `comp-${Math.random().toString(36).substr(2, 9)}`;

        return {
          id,
          label: detection.label.toLowerCase(),
          box: [x - width / 2, y - height / 2, width, height],
          text: detection.text || "",
          confidence: detection.confidence,
        };
      });
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    try {
      setLoading(true);

      const transformedDetections = transformDetections();

      // Determine canvas size from detections
      let maxX = 0,
        maxY = 0;
      transformedDetections.forEach((det) => {
        const [x, y, w, h] = det.box;
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      // Determine viewport based on detected dimensions
      let targetViewport = "desktop";
      let canvasWidth = Math.max(1920, Math.ceil(maxX + 50));
      let canvasHeight = Math.max(1080, Math.ceil(maxY + 50));

      // Determine viewport type based on the wireframe dimensions
      if (maxX <= 500 && maxY <= 800) {
        // Mobile dimensions
        targetViewport = "mobile";
        canvasWidth = 375;
        canvasHeight = 667;
      } else if (maxX <= 900 && maxY <= 1200) {
        // Tablet dimensions
        targetViewport = "tablet";
        canvasWidth = 768;
        canvasHeight = 1024;
      } else {
        // Desktop dimensions
        targetViewport = "desktop";
        canvasWidth = 1920;
        canvasHeight = 1080;
      }

      // Scale components to fit the target viewport if needed
      const scaleX = canvasWidth / (maxX + 100);
      const scaleY = canvasHeight / (maxY + 100);
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed

      // Convert detections to component format with scaling
      // Convert detections to component format with scaling
      const components = transformedDetections.map((detection) => {
        const [x, y, w, h] = detection.box;
        const label = detection.label.toLowerCase();

        // Get theme defaults for this component type
        const componentTheme = currentTheme.colors?.componentSpecific?.[label];

        // Create base component with THEME DEFAULTS (not null)
        let component = {
          id: detection.id,
          label,
          box: [x * scale, y * scale, w * scale, h * scale],
          zIndex: 0,
          text:
            detection.text ||
            (label === "button"
              ? "Button"
              : label === "heading"
              ? "Heading Text"
              : label === "text"
              ? "Sample text"
              : label === "input"
              ? "Enter text..."
              : label === "checkbox"
              ? "Check me"
              : label === "radio button"
              ? "Option"
              : label === "footer"
              ? "Footer Content"
              : ""),
        };

        // ✅ FIX: Change newComponent to component
        if (label === "nav" && component.menuItems === undefined) {
          component.menuItems = ["Home", "About", "Contact"];
        }
        if (label === "nav" && component.alignment === undefined) {
          component.alignment = "center"; // left | center | right
        }
        if (label === "nav" && component.menuLinks === undefined) {
          component.menuLinks = {}; // { MenuItem: TemplateName }
        }
        if (label === "nav" && component.logoType === undefined) {
          component.logoType = "none"; // none | text | image
          component.logoText = "";
          component.logoUrl = "";
          component.logoTemplate = ""; // template name target
        }
        if (label === "hamburger") {
          if (component.menuItems === undefined) {
            component.menuItems = ["Home", "About", "Contact"];
          }
          if (component.showMenu === undefined) {
            component.showMenu = false;
          }
        }
        if (label === "carousel" && component.images === undefined) {
          component.images = [
            "https://picsum.photos/800/400?random=1",
            "https://picsum.photos/800/400?random=2",
            "https://picsum.photos/800/400?random=3",
          ];
          component.currentSlide = 0;
          component.autoplaySpeed = 3;
          component.showDots = true;
          component.showArrows = true;
        }
        if (label === "image") {
          component.imgUrl =
            detection.imgUrl || "https://picsum.photos/300/200";
          component.objectFit = "cover";
        }

        if (label === "icon") {
          component.imgUrl =
            detection.imgUrl ||
            "https://www.iconpacks.net/icons/1/free-star-icon-984-thumb.png";
          component.objectFit = "contain";
        }

        // ✅ APPLY THEME DEFAULTS (same logic as in handleDropComponent)
        // Background color
        component.bgColor =
          componentTheme?.background ??
          (["button", "nav", "footer"].includes(label)
            ? currentTheme.colors.neutral
            : null);

        // Text color
        component.color =
          componentTheme?.textColor ?? currentTheme.colors?.text;

        // Font settings
        component.fontFamily =
          label === "heading"
            ? currentTheme.typography?.headingFont
            : currentTheme.typography?.bodyFont;

        component.fontSize =
          label === "heading"
            ? (currentTheme.typography?.baseFontSize || 16) * 1.5
            : currentTheme.typography?.baseFontSize || 16;

        component.fontWeight = label === "heading" ? "bold" : "normal";

        // Border radius
        component.borderRadius =
          componentTheme?.borderRadius ??
          (["button", "input", "image", "nav", "footer"].includes(label)
            ? currentTheme.spacing?.borderRadius || 4
            : null);

        // Shadow
        component.shadow =
          currentTheme.shadows?.default !== "none"
            ? currentTheme.shadows?.default
            : null;

        component.opacity = 100;

        return component;
      });

      // Create componentsByViewport object with components in the detected viewport
      const componentsByViewport = {
        mobile: targetViewport === "mobile" ? components : [],
        tablet: targetViewport === "tablet" ? components : [],
        desktop: targetViewport === "desktop" ? components : [],
      };

      // Create template data
      const templateData = {
        name: templateName,
        componentsByViewport,
        theme: currentTheme,
        canvasWidth,
        canvasHeight,
        ownerId: auth.currentUser.uid,
        tasks: [],
        comments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save to Firestore
      const projectRef = doc(db, "projects", projectId);
      const docRef = await addDoc(
        collection(projectRef, "templates"),
        templateData
      );

      onComplete(docRef.id, templateData, targetViewport);
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update the wizard modal rendering to show detected viewport (around line 2850)
  // In the Step 2 section, add this after the template name input:

  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Template Name
    </label>
    <input
      type="text"
      value={templateName}
      onChange={(e) => setTemplateName(e.target.value)}
      placeholder="e.g., Homepage, Dashboard, Login Page"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      autoFocus
    />
  </div>;

  {
    /* NEW: Show detected viewport */
  }
  {
    detectionResult && (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">
            Detected viewport:{" "}
            {(() => {
              const transformedDetections = transformDetections();
              let maxX = 0,
                maxY = 0;
              transformedDetections.forEach((det) => {
                const [x, y, w, h] = det.box;
                maxX = Math.max(maxX, x + w);
                maxY = Math.max(maxY, y + h);
              });

              if (maxX <= 500 && maxY <= 800) return "📱 Mobile (375×667)";
              if (maxX <= 900 && maxY <= 1200) return "📱 Tablet (768×1024)";
              return "🖥️ Desktop (1920×1080)";
            })()}
          </span>
        </div>
      </div>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999]"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-w-[95vw] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {step === 1 ? "Upload Wireframe" : "Name Your Template"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {step === 1 ? (
            // Step 1: Upload Image
            <div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center">
                  {preview ? (
                    <div className="w-full max-h-96 overflow-hidden mb-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-4 text-lg text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                  <label
                    htmlFor="wireframe-upload"
                    className={`${
                      preview ? "mt-2" : ""
                    } inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer`}
                  >
                    {preview ? "Change Image" : "Upload Image"}
                  </label>
                  <input
                    id="wireframe-upload"
                    name="wireframe-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDetectObjects}
                  disabled={loading || !image}
                  className={`px-6 py-2 rounded-md text-white ${
                    loading || !image
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Detecting...
                    </>
                  ) : (
                    "Detect Components"
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Name Template & Preview
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Homepage, Dashboard, Login Page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              {/* NEW: Show detected viewport */}
              {detectionResult && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      Detected viewport:{" "}
                      {(() => {
                        const transformedDetections = transformDetections();
                        let maxX = 0,
                          maxY = 0;
                        transformedDetections.forEach((det) => {
                          const [x, y, w, h] = det.box;
                          maxX = Math.max(maxX, x + w);
                          maxY = Math.max(maxY, y + h);
                        });

                        if (maxX <= 500 && maxY <= 800)
                          return "📱 Mobile (375×667)";
                        if (maxX <= 900 && maxY <= 1200)
                          return "📱 Tablet (768×1024)";
                        return "🖥️ Desktop (1920×1080)";
                      })()}
                    </span>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="p-4 max-h-96 overflow-auto">
                    {preview && (
                      <img
                        src={preview}
                        alt="Wireframe"
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                </div>
              </div>

              {detectionResult && (
                <div className="text-sm text-gray-600 mb-4">
                  Detected {transformDetections().length} components
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={loading || !templateName.trim()}
                  className={`px-6 py-2 rounded-md text-white ${
                    loading || !templateName.trim()
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Creating..." : "Create Template"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const FileExplorer = ({
  projects,
  currentProjectId,
  currentTemplateId,
  onOpenProject,
  onOpenTemplate,
  onCreateProject,
  onCreateTemplate,
  onDeleteProject,
  onDeleteTemplate,
  onRefresh,
}) => {
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false); // Add collapsed state

  // Auto-expand current project
  useEffect(() => {
    if (currentProjectId) {
      setExpandedProjects((prev) => new Set([...prev, currentProjectId]));
    }
  }, [currentProjectId]);

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  // Filter to only show current project
  const displayProjects = currentProjectId
    ? projects.filter((p) => p.id === currentProjectId)
    : [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-800"
          onClick={() => setIsCollapsed((v) => !v)}
          aria-expanded={!isCollapsed}
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${
              isCollapsed ? "-rotate-90" : "rotate-0"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          Explorer
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={onCreateProject}
            className="p-1 hover:bg-gray-100 rounded"
            title="New Project"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* File Tree - Only show if not collapsed */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto text-sm">
          {displayProjects.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-xs">
              <p>No project open</p>
              <button
                onClick={onCreateProject}
                className="mt-2 text-blue-500 hover:underline"
              >
                Create or open a project
              </button>
            </div>
          ) : (
            <div className="py-1">
              {displayProjects.map((project) => {
                const isExpanded = expandedProjects.has(project.id);
                const isCurrentProject = project.id === currentProjectId;

                return (
                  <div key={project.id} className="select-none">
                    {/* Project Row */}
                    <div
                      className={`flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer group ${
                        isCurrentProject ? "bg-blue-50" : ""
                      }`}
                      onClick={() => toggleProject(project.id)}
                    >
                      {/* ...existing project row content... */}
                      <svg
                        className={`w-3 h-3 text-gray-600 mr-1 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>

                      <svg
                        className={`w-4 h-4 mr-2 ${
                          isExpanded ? "text-blue-500" : "text-gray-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>

                      <span className="flex-1 truncate text-gray-700 font-medium">
                        {project.name}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateTemplate(project.id);
                          }}
                          className="p-0.5 hover:bg-gray-200 rounded"
                          title="New Template"
                        >
                          <svg
                            className="w-3 h-3 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Templates */}
                    {isExpanded && (
                      <div className="ml-4">
                        {(project.templates || []).length === 0 ? (
                          <div className="px-6 py-2 text-xs text-gray-400">
                            No templates
                          </div>
                        ) : (
                          (project.templates || []).map((template) => {
                            const isCurrentTemplate =
                              template.id === currentTemplateId;

                            return (
                              <div
                                key={template.id}
                                className={`flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer group ${
                                  isCurrentTemplate ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                  onOpenTemplate(project.id, template.id)
                                }
                              >
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>

                                <span
                                  className={`flex-1 truncate ${
                                    isCurrentTemplate
                                      ? "text-blue-700 font-medium"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {template.name}
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTemplate(project.id, template.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <svg
                                    className="w-3 h-3 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WelcomeScreen = ({
  projects,
  onOpenProject,
  onCreateProject,
  openProjectFromWelcome,
  recentTemplates = [],
}) => {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full mx-auto p-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <LayoutDashboard className="text-blue-500 mr-3" size={48} />
            <h1 className="text-4xl font-bold text-gray-800">UI Builder</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Create beautiful wireframes and prototypes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create New Project */}
          <button
            onClick={onCreateProject}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
              <svg
                className="w-8 h-8 text-blue-500 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              New Project
            </h3>
            <p className="text-gray-600">Start fresh with a new project</p>
          </button>

          {/* Open Existing */}
          <button
            onClick={() => onOpenProject()}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
              <svg
                className="w-8 h-8 text-purple-500 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Open Project
            </h3>
            <p className="text-gray-600">Browse your existing projects</p>
          </button>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Projects
            </h3>
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    console.log("Opening project:", project.id); // Debug log
                    openProjectFromWelcome(project.id); // ✅ Ensure we're passing the ID string
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(project.templates || []).length} templates
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VersionHistoryModal = ({
  templateId,
  templateName,
  onClose,
  onRestore,
  fetchVersionHistory,
  restoreVersion,
  compareVersions,
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState([null, null]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedViewport, setSelectedViewport] = useState("desktop"); // For comparison view

  useEffect(() => {
    const loadVersions = async () => {
      setLoading(true);
      const history = await fetchVersionHistory(templateId);
      setVersions(history);
      setLoading(false);
    };
    loadVersions();
  }, [templateId]);

  const handleRestore = async (versionId) => {
    if (
      !confirm(
        "Restore this version? Your current work will be saved as a new version."
      )
    ) {
      return;
    }
    await restoreVersion(templateId, versionId);
    onRestore?.();
    onClose();
  };

  const handleCompare = () => {
    if (!selectedVersions[0] || !selectedVersions[1]) {
      alert("Please select two versions to compare");
      return;
    }
    setShowComparison(true);
  };

  const toggleVersionSelection = (version) => {
    if (selectedVersions[0] === version.id) {
      setSelectedVersions([null, selectedVersions[1]]);
    } else if (selectedVersions[1] === version.id) {
      setSelectedVersions([selectedVersions[0], null]);
    } else if (!selectedVersions[0]) {
      setSelectedVersions([version.id, selectedVersions[1]]);
    } else if (!selectedVersions[1]) {
      setSelectedVersions([selectedVersions[0], version.id]);
    } else {
      setSelectedVersions([selectedVersions[1], version.id]);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Render a version's UI preview
  // Around line 5350 - Update the renderVersionPreview function with better scaling

  const renderVersionPreview = (version, viewport) => {
    if (!version || !version.componentsByViewport) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No components</p>
        </div>
      );
    }

    const components = version.componentsByViewport[viewport] || [];
    const theme = version.theme || {};
    const dims = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 },
    };
    const { width: vw, height: vh } = dims[viewport];

    if (components.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No components in {viewport} view</p>
        </div>
      );
    }

    // ✅ IMPROVED: Better scaling with minimum readable font size
    const previewMaxHeight = 500; // Increased from 400
    const previewMaxWidth = 650; // Increased from 600
    const scaleToFit = Math.min(previewMaxWidth / vw, previewMaxHeight / vh, 1);

    // Helper to render component with better text handling
    const renderComp = (comp) => {
      const [x, y, w, h] = comp.box || [0, 0, 100, 100];

      // ✅ FIXED: Better font size calculation with readable minimums
      const baseFontSize = comp.fontSize || 16;
      const scaledFontSize = baseFontSize * scaleToFit;

      // Set appropriate font size based on viewport with proper min values
      let adjustedFontSize;
      if (viewport === "mobile") {
        // Mobile: smallest minimum (text should be smallest)
        adjustedFontSize = Math.max(scaledFontSize, 6); // Min 6px
      } else if (viewport === "tablet") {
        // Tablet: medium minimum
        adjustedFontSize = Math.max(scaledFontSize, 8); // Min 8px
      } else {
        // Desktop: largest minimum (needs to be more readable due to more scaling)
        adjustedFontSize = Math.max(scaledFontSize, 10); // Min 10px
      }

      const style = {
        position: "absolute",
        left: `${x * scaleToFit}px`,
        top: `${y * scaleToFit}px`,
        width: `${w * scaleToFit}px`,
        height: `${h * scaleToFit}px`,
        backgroundColor: comp.bgColor,
        color: comp.color,
        fontSize: `${adjustedFontSize}px`,
        fontFamily: comp.fontFamily,
        fontWeight: comp.fontWeight,
        lineHeight: "1.2",
        borderRadius: comp.borderRadius
          ? `${comp.borderRadius * scaleToFit}px`
          : undefined,
        opacity: comp.opacity !== undefined ? comp.opacity / 100 : 1,
        border:
          comp.borderStyle && comp.borderStyle !== "none"
            ? `${Math.max(1, (comp.borderWidth || 1) * scaleToFit)}px ${
                comp.borderStyle
              } ${comp.borderColor || "#000"}`
            : undefined,
        boxShadow:
          comp.shadow && comp.shadow !== "none"
            ? comp.shadow === "shadow-sm"
              ? "0 1px 2px rgba(0,0,0,.05)"
              : comp.shadow === "shadow-md"
              ? "0 4px 6px rgba(0,0,0,.10)"
              : comp.shadow === "shadow-lg"
              ? "0 10px 15px rgba(0,0,0,.15)"
              : comp.shadow === "shadow-xl"
              ? "0 20px 25px rgba(0,0,0,.20)"
              : undefined
            : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: comp.label === "nav" ? "flex-start" : "center",
        padding: `${Math.max(2, 4 * scaleToFit)}px`,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: comp.label === "nav" ? "nowrap" : "normal",
        wordBreak: "break-word",
      };

      const renderContent = () => {
        switch (comp.label) {
          case "text":
          case "heading":
            return <div style={style}>{comp.text || "Text"}</div>;
          case "button":
            return <button style={style}>{comp.text || "Button"}</button>;
          case "input":
            return (
              <input
                style={{
                  ...style,
                  padding: `${Math.max(1, 2 * scaleToFit)}px ${Math.max(
                    2,
                    4 * scaleToFit
                  )}px`,
                }}
                placeholder={comp.text || "Input"}
                readOnly
              />
            );
          case "image":
            return (
              <div style={{ ...style, padding: 0 }}>
                <img
                  src={comp.imgUrl || "https://picsum.photos/300/200"}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: comp.objectFit || "cover",
                  }}
                />
              </div>
            );
          case "nav":
            return (
              <nav
                style={{
                  ...style,
                  gap: `${Math.max(4, 8 * scaleToFit)}px`,
                }}
              >
                {(comp.menuItems || ["Home", "About"]).map((item, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: style.fontSize,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </nav>
            );
          case "footer":
            return <footer style={style}>{comp.text || "Footer"}</footer>;
          case "frame":
          default:
            return <div style={{ ...style, padding: 0 }}></div>;
        }
      };

      return <div key={comp.id}>{renderContent()}</div>;
    };

    return (
      <div className="relative w-full h-full bg-white border border-gray-200 rounded overflow-hidden">
        <div
          className="relative mx-auto bg-gray-50"
          style={{
            width: `${vw * scaleToFit}px`,
            height: `${vh * scaleToFit}px`,
            maxHeight: `${previewMaxHeight}px`,
          }}
        >
          {components.map((comp) => renderComp(comp))}
        </div>
        {/* ✅ IMPROVED: Better scale indicator */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
          {Math.round(scaleToFit * 100)}%
        </div>
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999]"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1400px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Version History
            </h2>
            <p className="text-sm text-gray-600 mt-1">{templateName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {!showComparison && (
          <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedVersions.filter(Boolean).length > 0 ? (
                <span>
                  {selectedVersions.filter(Boolean).length} version(s) selected
                </span>
              ) : (
                <span>Click checkboxes to select versions to compare</span>
              )}
            </div>
            {selectedVersions.filter(Boolean).length === 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Compare Selected
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {showComparison ? (
            // ✅ Enhanced Comparison View with UI Previews
            <div>
              <button
                onClick={() => {
                  setShowComparison(false);
                  setSelectedVersions([null, null]);
                }}
                className="mb-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                ← Back to version list
              </button>

              {(() => {
                const v1 = versions.find((v) => v.id === selectedVersions[0]);
                const v2 = versions.find((v) => v.id === selectedVersions[1]);
                const changes = compareVersions(v1, v2);

                return (
                  <div>
                    {/* Version Info Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <h3 className="font-semibold mb-2 text-blue-900">
                          Version 1 (Older)
                        </h3>
                        <p className="text-sm text-gray-700">{v1?.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(v1?.createdAt)}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          by {v1?.createdByName || "Unknown"}
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 bg-green-50">
                        <h3 className="font-semibold mb-2 text-green-900">
                          Version 2 (Newer)
                        </h3>
                        <p className="text-sm text-gray-700">{v2?.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(v2?.createdAt)}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          by {v2?.createdByName || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Viewport Selector for Comparison */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Compare:
                      </span>
                      <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                        {["desktop", "tablet", "mobile"].map((vp) => (
                          <button
                            key={vp}
                            onClick={() => setSelectedViewport(vp)}
                            className={`px-3 py-1 rounded text-sm ${
                              selectedViewport === vp
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {vp.charAt(0).toUpperCase() + vp.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Side-by-side UI Comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-sm text-blue-900">
                          Version 1 - {selectedViewport}
                        </h3>
                        <div
                          className="bg-gray-50 rounded overflow-auto"
                          style={{ maxHeight: "450px" }}
                        >
                          {renderVersionPreview(v1, selectedViewport)}
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {v1?.componentsCount?.[selectedViewport] || 0}{" "}
                          components
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-sm text-green-900">
                          Version 2 - {selectedViewport}
                        </h3>
                        <div
                          className="bg-gray-50 rounded overflow-auto"
                          style={{ maxHeight: "450px" }}
                        >
                          {renderVersionPreview(v2, selectedViewport)}
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {v2?.componentsCount?.[selectedViewport] || 0}{" "}
                          components
                        </div>
                      </div>
                    </div>

                    {/* Text Changes Summary */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Summary of Changes</h3>
                      {changes.length === 0 ? (
                        <p className="text-gray-500">No changes detected</p>
                      ) : (
                        <ul className="space-y-2">
                          {changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              <span className="text-sm">{change}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            // Version List
            <div className="space-y-3">
              {versions.map((version, index) => {
                const isLatest = index === 0;
                const isSelected = selectedVersions.includes(version.id);
                const totalComponents =
                  (version.componentsCount?.desktop || 0) +
                  (version.componentsCount?.tablet || 0) +
                  (version.componentsCount?.mobile || 0);

                return (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      isLatest
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleVersionSelection(version)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isLatest && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                              Current
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {version.message || "Unnamed version"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {version.createdByName || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {getTimeSince(version.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                              />
                            </svg>
                            {totalComponents} components
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          {formatDate(version.createdAt)}
                        </div>

                        <div className="mt-2 flex gap-3 text-xs">
                          {version.componentsCount?.desktop > 0 && (
                            <span className="text-gray-600">
                              🖥️ {version.componentsCount.desktop} desktop
                            </span>
                          )}
                          {version.componentsCount?.tablet > 0 && (
                            <span className="text-gray-600">
                              📱 {version.componentsCount.tablet} tablet
                            </span>
                          )}
                          {version.componentsCount?.mobile > 0 && (
                            <span className="text-gray-600">
                              📱 {version.componentsCount.mobile} mobile
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isLatest && (
                          <button
                            onClick={() => handleRestore(version.id)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {versions.length} version{versions.length !== 1 ? "s" : ""} total
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Add Change History Modal component (around line 5000)
const ChangeHistoryModal = ({ onClose, fetchChangeHistory }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await fetchChangeHistory(100);
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case "add":
        return "➕";
      case "delete":
        return "🗑️";
      case "update":
        return "✏️";
      case "move":
        return "↔️";
      case "resize":
        return "↕️";
      default:
        return "📝";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.seconds) return "Unknown";
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999]"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[700px] max-w-[95vw] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Change History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No changes recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="text-2xl">{getActionIcon(entry.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {entry.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {entry.action === "add" &&
                        `Added ${entry.details?.type || "component"}`}
                      {entry.action === "delete" && "Deleted component"}
                      {entry.action === "update" && "Updated component"}
                      {entry.action === "move" && `Moved component`}
                      {entry.action === "resize" && `Resized component`}
                      {entry.viewport && ` in ${entry.viewport} view`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Add Presence Panel component (around line 5100)
const PresencePanel = ({ collaborators, onClose }) => {
  return (
    <div className="fixed top-20 right-4 w-64 bg-white rounded-lg shadow-lg border p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Active Collaborators</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={14} />
        </button>
      </div>

      {collaborators.length === 0 ? (
        <div className="text-sm text-gray-500">No one else is editing</div>
      ) : (
        <div className="space-y-2">
          {collaborators.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user.displayName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.viewport} view
                  {user.selectedComponentId && " • Editing"}
                  {/* ✅ NEW: Show actual role */}
                  {user.role && (
                    <span className="ml-1 text-gray-400">• {user.role}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add Cursor overlay component (around line 5150)
const CollaboratorCursor = ({ cursor, containerRef }) => {
  if (!containerRef.current) return null;

  const bounds = containerRef.current.getBoundingClientRect();
  const left = cursor.x * bounds.width;
  const top = cursor.y * bounds.height;

  // ✅ Truncate display name to first word only
  const truncatedName = cursor.displayName.split(/[\s@]/)[0];

  return (
    <div
      className="absolute pointer-events-none z-[9999]"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* Cursor pointer */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      {/* Name label - truncated to first word */}
      <div
        className="absolute top-6 left-2 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
        style={{ backgroundColor: cursor.color }}
        title={cursor.displayName} // ✅ Show full name on hover
      >
        {truncatedName}
      </div>
    </div>
  );
};

// Add Conflict Resolution Modal (around line 5190)
const ConflictModal = ({ conflict, onResolve, onCancel }) => {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999]"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[95vw] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Edit Conflict Detected
            </h3>
            <p className="text-sm text-gray-600">
              <strong>{conflict.conflictingUser}</strong> just modified this
              component. What would you like to do?
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel My Changes
          </button>
          <button
            onClick={onResolve}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Keep My Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Test = () => {
  // Move state definitions inside the component
  const [gridEnabled, setGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(15);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(375); // Mobile width default
  const [canvasHeight, setCanvasHeight] = useState(667); // Mobile height default
  const [showThemePanel, setShowThemePanel] = useState(false);
  const location = useLocation();
  const initialComponents = [];
  const [lastOpenedProject, setLastOpenedProject] = useState(null);
  const [lastOpenedTemplate, setLastOpenedTemplate] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showCollabMenu, setShowCollabMenu] = useState(false);
  const commentsMenuTimeoutRef = useRef(null);
  const collabMenuTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [showTemplateOrganizer, setShowTemplateOrganizer] = useState(false);
  const [showTaskManagement, setShowTaskManagement] = useState(false);
  const [userTemplates, setUserTemplates] = useState([]);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [collabMode, setCollabMode] = useState(false);
  const [collaborators, setCollaborators] = useState([]); // Online users
  const [cursors, setCursors] = useState({}); // Other users' cursor positions
  const [showChangeHistory, setShowChangeHistory] = useState(false);
  const [showPresencePanel, setShowPresencePanel] = useState(true); // Show by default in collab mode
  const [changeHistory, setChangeHistory] = useState([]); // Audit log
  const [conflictData, setConflictData] = useState(null); // Conflict detection
  const [localCursorPosition, setLocalCursorPosition] = useState({
    x: 0,
    y: 0,
  });
  const [presenceUpdateTimer, setPresenceUpdateTimer] = useState(null);
  const [showFinishedTasks, setShowFinishedTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [userMap, setUserMap] = useState({}); // uid -> displayName/email-prefix cache
  const [comments, setComments] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  // Add viewport state - default to mobile (wireframes are mobile-first)
  const [viewport, setViewport] = useState("mobile"); // 'desktop' | 'tablet' | 'mobile'

  // Viewport-specific components
  const [componentsByViewport, setComponentsByViewport] = useState({
    desktop: [],
    tablet: [],
    mobile: initialComponents, // Start with mobile view
  });

  // Viewport dimensions mapping
  const viewportDimensions = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  };

  // Derived values based on current viewport
  const components = Array.isArray(componentsByViewport[viewport])
    ? componentsByViewport[viewport]
    : [];

  const setComponents = (newComps) => {
    if (!Array.isArray(newComps)) {
      console.error("setComponents called with non-array:", newComps);
      return;
    }
    setComponentsByViewport((prev) => ({
      ...prev,
      [viewport]: newComps,
    }));
  };

  const [pinMode, setPinMode] = useState(false); // Add Pin mode toggle
  const [showCommentsMenu, setShowCommentsMenu] = useState(false);
  const [hideAllComments, setHideAllComments] = useState(false);
  const [tempPin, setTempPin] = useState(null); // temp pin before first comment
  const [initialOpenPinId, setInitialOpenPinId] = useState(null);
  const [commentOpenSignal, setCommentOpenSignal] = useState(0); // signal to force open comment UI
  // --- Component Library (Custom Components) ---
  const [libraryComponents, setLibraryComponents] = useState([]);
  const [libCollapsed, setLibCollapsed] = useState(false);
  // UI state for library component preview modal
  const [activeLibComp, setActiveLibComp] = useState(null);
  const closeLibModal = () => setActiveLibComp(null);
  const openLibModal = (lib) => setActiveLibComp(lib);
  // Hover preview state (small preview -> full preview popover)
  const [hoveredLib, setHoveredLib] = useState(null); // library item being hovered
  const [hoverRect, setHoverRect] = useState(null); // DOM rect of the hovered item
  const hoverTimeoutRef = useRef(null);
  const [hoveredPaletteItem, setHoveredPaletteItem] = useState(null);
  const [paletteHoverRect, setPaletteHoverRect] = useState(null);
  const paletteHoverTimeoutRef = useRef(null);
  // Project management states
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [projectTemplates, setProjectTemplates] = useState([]); // Templates in current project
  const [leftPanelTab, setLeftPanelTab] = useState("explorer"); // 'explorer' | 'components'
  const [showTemplateWizard, setShowTemplateWizard] = useState(false);
  const [wizardProjectId, setWizardProjectId] = useState(null);
  const [componentsCollapsed, setComponentsCollapsed] = useState(true);
  const [assetsCollapsed, setAssetsCollapsed] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  // Add a function to fetch and populate project templates
  const refreshExplorer = async () => {
    const userProjects = await fetchUserProjects();

    // Fetch templates for each project
    const projectsWithTemplates = await Promise.all(
      userProjects.map(async (project) => {
        const templates = await fetchProjectTemplates(project.id);
        return { ...project, templates };
      })
    );

    setProjects(projectsWithTemplates); // ✅ This updates the state used by WelcomeScreen
    return projectsWithTemplates; // ✅ Return for immediate use
  };

  // Around line 10850 - Update the useEffect that loads projects
  useEffect(() => {
    if (auth.currentUser) {
      refreshExplorer();
    }
  }, [auth.currentUser]);

  // Fetch user's projects
  const fetchUserProjects = async () => {
    if (!auth.currentUser) return [];
    const userId = auth.currentUser.uid;
    const projectsRef = collection(db, "projects");

    // Owned projects
    const ownedQuery = query(projectsRef, where("ownerId", "==", userId));
    const ownedSnap = await getDocs(ownedQuery);
    const ownedProjects = ownedSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Collaborator projects
    const colabQuery = query(
      projectsRef,
      where("collaboratorIds", "array-contains", userId)
    );
    const colabSnap = await getDocs(colabQuery);
    const colabProjects = colabSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Merge and deduplicate
    const allProjects = [...ownedProjects, ...colabProjects];
    const uniqueProjects = Array.from(
      new Map(allProjects.map((p) => [p.id, p])).values()
    );

    return uniqueProjects;
  };

  // Fetch templates within a project
  const fetchProjectTemplates = async (projectId) => {
    // ✅ Add validation
    if (!projectId || typeof projectId !== "string") {
      console.error("fetchProjectTemplates: invalid projectId", projectId);
      return [];
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      const templatesRef = collection(projectRef, "templates");
      const snap = await getDocs(templatesRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("fetchProjectTemplates error:", err);
      return [];
    }
  };

  // Create a new project
  const createProject = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to create projects.");
      return;
    }

    const name = prompt("Enter project name:", "My Project");
    if (!name) return;

    const description = prompt("Enter project description (optional):", "");

    try {
      const projectData = {
        name,
        description: description || "",
        ownerId: auth.currentUser.uid,
        collaborators: {},
        collaboratorIds: [],
        collaboratorNames: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      alert("Project created!");

      // ✅ Refresh both ProjectManager and WelcomeScreen
      await refreshExplorer();

      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project.");
    }
  };

  // Add cursor tracking function (around line 10750)
  const updateCursorPosition = useCallback(
    (e) => {
      if (!collabMode || !currentTemplateId || !containerRef.current) {
        console.log("Cursor update blocked:", {
          collabMode,
          currentTemplateId,
          hasRef: !!containerRef.current,
        });
        return;
      }

      const containerBounds = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - containerBounds.left) / containerBounds.width;
      const y = (e.clientY - containerBounds.top) / containerBounds.height;

      // ✅ Clamp values between 0 and 1
      const clampedX = Math.max(0, Math.min(1, x));
      const clampedY = Math.max(0, Math.min(1, y));

      // ✅ Only update if position actually changed (avoid unnecessary updates)
      if (
        Math.abs(clampedX - localCursorPosition.x) > 0.001 ||
        Math.abs(clampedY - localCursorPosition.y) > 0.001
      ) {
        setLocalCursorPosition({ x: clampedX, y: clampedY });
      }
    },
    [collabMode, currentTemplateId, localCursorPosition]
  );

  // Debounced cursor broadcast (around line 10770)
  // Around line 10770 - Fix the useEffect dependency array

  useEffect(() => {
    if (
      !collabMode ||
      !currentTemplateId ||
      !currentProjectId ||
      !auth.currentUser
    )
      return;

    const broadcastCursor = async () => {
      try {
        const projectRef = doc(db, "projects", currentProjectId);
        const templateRef = doc(projectRef, "templates", currentTemplateId);
        const presenceRef = doc(
          collection(templateRef, "presence"),
          auth.currentUser.uid
        );

        await setDoc(
          presenceRef,
          {
            userId: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || auth.currentUser.email,
            cursor: localCursorPosition,
            lastActive: Timestamp.now(),
            viewport,
            selectedComponentId: selectedComponentId || null,
            color: getRandomColor(auth.currentUser.uid),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Cursor broadcast error:", err);
      }
    };

    const timeoutId = setTimeout(broadcastCursor, 100);
    return () => clearTimeout(timeoutId);
  }, [
    localCursorPosition,
    collabMode,
    currentTemplateId,
    currentProjectId,
    viewport,
    selectedComponentId, // ✅ This was sometimes not included, causing the array size to change
  ]); // Keep all dependencies in a consistent order

  // Generate consistent color for each user (around line 10810)
  const getRandomColor = (uid) => {
    const colors = [
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f97316",
    ];
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Real-time presence listener (around line 10830)
  useEffect(() => {
    if (!collabMode || !currentTemplateId || !currentProjectId) {
      setCollaborators([]);
      setCursors({});
      return;
    }

    const projectRef = doc(db, "projects", currentProjectId);
    const templateRef = doc(projectRef, "templates", currentTemplateId);
    const presenceRef = collection(templateRef, "presence");

    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const activeUsers = [];
      const cursorMap = {};

      // ✅ Get project data to access collaborator roles
      const getProjectData = async () => {
        const projectSnap = await getDoc(projectRef);
        const projectData = projectSnap.data();
        const collaborators = projectData?.collaborators || {};
        const ownerId = projectData?.ownerId;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const userId = doc.id;

          // Skip current user
          if (userId === auth.currentUser?.uid) return;

          // Check if user is still active (within last 30 seconds)
          const lastActive = data.lastActive?.seconds
            ? data.lastActive.seconds * 1000
            : 0;
          const isActive = Date.now() - lastActive < 30000;

          if (isActive) {
            // ✅ Determine user's role
            const role =
              userId === ownerId ? "owner" : collaborators[userId] || "viewer";

            activeUsers.push({
              userId,
              displayName: data.displayName || resolveUserName(userId),
              color: data.color || getRandomColor(userId),
              viewport: data.viewport || "desktop",
              selectedComponentId: data.selectedComponentId,
              role, // ✅ Add role to user object
            });

            // Only show cursor if user is on same viewport AND cursor data exists
            if (data.viewport === viewport && data.cursor) {
              if (
                typeof data.cursor.x === "number" &&
                typeof data.cursor.y === "number"
              ) {
                cursorMap[userId] = {
                  x: data.cursor.x,
                  y: data.cursor.y,
                  displayName: data.displayName || resolveUserName(userId),
                  color: data.color || getRandomColor(userId),
                };
              }
            }
          }
        });

        setCollaborators(activeUsers);
        setCursors(cursorMap);
      };

      getProjectData();
    });

    return () => unsubscribe();
  }, [collabMode, currentTemplateId, currentProjectId, viewport]);

  // Heartbeat to keep presence alive (around line 10890)
  useEffect(() => {
    if (
      !collabMode ||
      !currentTemplateId ||
      !currentProjectId ||
      !auth.currentUser
    )
      return;

    const interval = setInterval(async () => {
      try {
        const projectRef = doc(db, "projects", currentProjectId);
        const templateRef = doc(projectRef, "templates", currentTemplateId);
        const presenceRef = doc(
          collection(templateRef, "presence"),
          auth.currentUser.uid
        );

        await updateDoc(presenceRef, {
          lastActive: Timestamp.now(),
        }).catch(async (err) => {
          if (err.code === "not-found") {
            await setDoc(presenceRef, {
              userId: auth.currentUser.uid,
              displayName:
                auth.currentUser.displayName || auth.currentUser.email,
              cursor: localCursorPosition,
              lastActive: Timestamp.now(),
              viewport,
              selectedComponentId: selectedComponentId || null,
              color: getRandomColor(auth.currentUser.uid),
            });
          }
        });
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [collabMode, currentTemplateId, currentProjectId, viewport]);

  // Cleanup presence on unmount (around line 10930)
  useEffect(() => {
    return () => {
      if (auth.currentUser && currentTemplateId && currentProjectId) {
        const cleanup = async () => {
          try {
            const projectRef = doc(db, "projects", currentProjectId);
            const templateRef = doc(projectRef, "templates", currentTemplateId);
            const presenceRef = doc(
              collection(templateRef, "presence"),
              auth.currentUser.uid
            );
            await deleteDoc(presenceRef);
          } catch (err) {
            console.error("Presence cleanup error:", err);
          }
        };
        cleanup();
      }
    };
  }, []);

  // Change history tracking (around line 10950)
  const logChange = async (action, componentId = null, details = {}) => {
    if (!currentTemplateId || !currentProjectId || !auth.currentUser) return;

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const templateRef = doc(projectRef, "templates", currentTemplateId);
      const historyRef = collection(templateRef, "changeHistory");

      const changeEntry = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        action, // 'add', 'update', 'delete', 'move', 'resize'
        componentId,
        viewport,
        timestamp: Timestamp.now(),
        details,
      };

      await addDoc(historyRef, changeEntry);
    } catch (err) {
      console.error("Log change error:", err);
    }
  };

  // Fetch change history (around line 10980)
  const fetchChangeHistory = async (maxResults = 50) => {
    if (!currentTemplateId || !currentProjectId) return [];

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const templateRef = doc(projectRef, "templates", currentTemplateId);
      const historyRef = collection(templateRef, "changeHistory");

      const q = query(
        historyRef,
        orderBy("timestamp", "desc"),
        limit(maxResults)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    } catch (err) {
      console.error("Fetch history error:", err);
      return [];
    }
  };

  // Conflict detection (around line 11010)
  const detectConflict = useCallback(
    (incomingData) => {
      if (!collabMode) return false;

      // Check if someone else modified the same component recently
      const recentChanges = changeHistory.filter(
        (change) =>
          Date.now() - (change.timestamp?.seconds || 0) * 1000 < 5000 && // Within last 5 seconds
          change.userId !== auth.currentUser?.uid &&
          change.componentId === selectedComponentId
      );

      if (recentChanges.length > 0) {
        setConflictData({
          component: selectedComponentId,
          conflictingUser: recentChanges[0].userName,
          timestamp: recentChanges[0].timestamp,
          action: recentChanges[0].action,
        });
        return true;
      }

      return false;
    },
    [changeHistory, selectedComponentId, collabMode]
  );

  // Create a version snapshot of a template
  const createVersionSnapshot = async (templateId, message = "Auto-save") => {
    if (!currentProjectId || !templateId) return null;

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const templateRef = doc(projectRef, "templates", templateId);
      const versionsRef = collection(templateRef, "versions");

      const versionData = {
        componentsByViewport,
        theme: currentTheme,
        canvasWidth,
        canvasHeight,
        message,
        createdBy: auth.currentUser.uid,
        createdByName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: Timestamp.now(),
        // Add metadata for easier browsing
        timestamp: Date.now(),
        componentsCount: {
          desktop: componentsByViewport.desktop?.length || 0,
          tablet: componentsByViewport.tablet?.length || 0,
          mobile: componentsByViewport.mobile?.length || 0,
        },
      };

      const docRef = await addDoc(versionsRef, versionData);
      console.log("Version created:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating version:", error);
      alert("Failed to create version: " + error.message);
      return null;
    }
  };

  // Fetch version history for a template
  const fetchVersionHistory = async (templateId) => {
    if (!currentProjectId || !templateId) return [];

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const templateRef = doc(projectRef, "templates", templateId);
      const versionsRef = collection(templateRef, "versions");

      const q = query(versionsRef, where("createdAt", "!=", null));
      const snapshot = await getDocs(q);

      const versions = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Sort by creation date, newest first
      return versions.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error("Error fetching version history:", error);
      return [];
    }
  };

  // Restore a specific version
  const restoreVersion = async (templateId, versionId) => {
    if (!currentProjectId || !templateId || !versionId) return;

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const templateRef = doc(projectRef, "templates", templateId);
      const versionRef = doc(templateRef, "versions", versionId);

      const versionSnap = await getDoc(versionRef);

      if (!versionSnap.exists()) {
        alert("Version not found");
        return;
      }

      const versionData = versionSnap.data();

      // Create a backup of current state before restoring
      await createVersionSnapshot(
        templateId,
        `After restoring to version from ${new Date(
          versionData.createdAt.seconds * 1000
        ).toLocaleString()}` // ✅ Changed from "Before" to "After"
      );

      // Restore the version data
      setComponentsByViewport(
        versionData.componentsByViewport || {
          desktop: [],
          tablet: [],
          mobile: [],
        }
      );
      setCurrentTheme(versionData.theme || currentTheme);
      setCanvasWidth(versionData.canvasWidth || 1920);
      setCanvasHeight(versionData.canvasHeight || 1080);

      // Save the restored state to the template
      await updateDoc(templateRef, {
        componentsByViewport: versionData.componentsByViewport,
        theme: versionData.theme,
        canvasWidth: versionData.canvasWidth,
        canvasHeight: versionData.canvasHeight,
        updatedAt: Timestamp.now(),
      });

      alert("Version restored successfully!");
    } catch (error) {
      console.error("Error restoring version:", error);
      alert("Failed to restore version: " + error.message);
    }
  };

  // Compare two versions (returns diff summary)
  const compareVersions = (version1, version2) => {
    const changes = [];

    // Compare component counts
    ["desktop", "tablet", "mobile"].forEach((viewport) => {
      const count1 = version1.componentsByViewport?.[viewport]?.length || 0;
      const count2 = version2.componentsByViewport?.[viewport]?.length || 0;
      if (count1 !== count2) {
        changes.push(`${viewport}: ${count1} → ${count2} components`);
      }
    });

    // Compare canvas dimensions
    if (
      version1.canvasWidth !== version2.canvasWidth ||
      version1.canvasHeight !== version2.canvasHeight
    ) {
      changes.push(
        `Canvas: ${version1.canvasWidth}×${version1.canvasHeight} → ${version2.canvasWidth}×${version2.canvasHeight}`
      );
    }

    return changes;
  };

  // Save template to project
  const saveTemplateToProject = async (
    projectId,
    createVersion = true,
    versionMessage = null
  ) => {
    if (!auth.currentUser) {
      alert("You must be logged in to save templates.");
      return;
    }

    if (!projectId && !currentProjectId) {
      alert("Please select or create a project first.");
      return;
    }

    const targetProjectId = projectId || currentProjectId;

    const data = {
      theme: currentTheme,
      componentsByViewport,
      canvasWidth,
      canvasHeight,
      ownerId: auth.currentUser.uid,
      tasks: tasks || [],
      comments: comments || [],
      updatedAt: Timestamp.now(),
    };

    try {
      if (currentTemplateId) {
        // Update existing template
        const projectRef = doc(db, "projects", targetProjectId);
        const templateRef = doc(projectRef, "templates", currentTemplateId);

        // Create version snapshot before saving (if requested)
        if (createVersion) {
          const message =
            versionMessage ||
            prompt("Version message (optional):", "Auto-save") ||
            "Auto-save";
          await createVersionSnapshot(currentTemplateId, message);
        }

        await updateDoc(templateRef, data);
        clearLocalDraft(currentTemplateId);
        clearLocalDraft(null);
        alert("Template saved!");
      } else {
        // Create new template
        const name = prompt("Enter template/page name:", "Page 1");
        if (!name) return;

        const payload = {
          ...data,
          name,
          createdAt: Timestamp.now(),
        };

        const projectRef = doc(db, "projects", targetProjectId);
        const docRef = await addDoc(
          collection(projectRef, "templates"),
          payload
        );

        setCurrentTemplateId(docRef.id);

        // Create initial version
        await createVersionSnapshot(docRef.id, "Initial version");

        clearLocalDraft(null);
        clearLocalDraft(docRef.id);
        alert("Template saved to project!");

        // Refresh project templates
        const templates = await fetchProjectTemplates(targetProjectId);
        setProjectTemplates(templates);
      }
    } catch (error) {
      console.error("Error saving template to project:", error);
      alert("Failed to save template: " + (error.message || error));
    }
  };

  // Open a template from project
  // Around line 6200 - Update openProjectTemplate function

  const openProjectTemplate = async (projectId, templateId) => {
    try {
      console.log("🔄 Loading template:", templateId);

      // ✅ CRITICAL: Check for draft BEFORE loading from Firebase
      const draftKey = getDraftKey(templateId);
      const draftRaw = localStorage.getItem(draftKey);

      if (draftRaw) {
        try {
          const draft = JSON.parse(draftRaw);
          const draftAge = Date.now() - (draft.updatedAt || 0);
          const oneHour = 60 * 60 * 1000;

          // Only prompt if draft is recent
          if (draftAge < oneHour) {
            const shouldRestore = window.confirm(
              "A local draft was found for this template. Restore unsaved changes?"
            );

            if (shouldRestore) {
              // ✅ Restore from draft instead of Firebase
              setCurrentTemplateId(templateId);
              setCurrentProjectId(projectId);

              if (draft.componentsByViewport) {
                setComponentsByViewport(draft.componentsByViewport);
              }
              if (draft.theme) setCurrentTheme(draft.theme);
              if (draft.canvasWidth) setCanvasWidth(draft.canvasWidth);
              if (draft.canvasHeight) setCanvasHeight(draft.canvasHeight);

              console.log("✅ Draft restored successfully");
              return; // ✅ Exit early - don't load from Firebase
            } else {
              // User declined - clear the draft
              localStorage.removeItem(draftKey);
            }
          } else {
            // Draft is too old - clear it
            localStorage.removeItem(draftKey);
          }
        } catch (err) {
          console.warn("Failed to parse draft:", err);
          localStorage.removeItem(draftKey);
        }
      }

      // ✅ No draft or user declined - load from Firebase
      setCurrentTemplateId(templateId);
      setCurrentProjectId(projectId);

      const projectRef = doc(db, "projects", projectId);
      const templateRef = doc(projectRef, "templates", templateId);
      const snap = await getDoc(templateRef);

      if (!snap.exists()) {
        alert("Template not found.");
        setCurrentTemplateId(null);
        setCurrentProjectId(null);
        return;
      }

      const tpl = snap.data();

      if (tpl.theme) {
        setCurrentTheme(tpl.theme);
      }

      if (tpl.componentsByViewport) {
        setComponentsByViewport(tpl.componentsByViewport);
      } else if (tpl.components) {
        setComponentsByViewport({
          desktop: tpl.components,
          tablet: [],
          mobile: [],
        });
      }

      setCanvasWidth(tpl.canvasWidth || 375);
      setCanvasHeight(tpl.canvasHeight || 667);
      setTasks(tpl.tasks || []);
      setComments(tpl.comments || []);

      localStorage.setItem(`uibuilder:lastProject`, projectId);
      localStorage.setItem(`uibuilder:lastTemplate:${projectId}`, templateId);

      console.log("✅ Template loaded from Firebase:", templateId);
    } catch (error) {
      console.error("Error opening template:", error);
      alert("Failed to open template.");
      setCurrentTemplateId(null);
      setCurrentProjectId(null);
    }
  };

  const openProjectFromWelcome = async (projectId) => {
    // ✅ Add validation
    if (!projectId || typeof projectId !== "string") {
      console.error("openProjectFromWelcome: invalid projectId", projectId);
      alert("Invalid project ID");
      return;
    }

    try {
      console.log("Opening project:", projectId);

      // ✅ IMPORTANT: Clear template state FIRST before setting new project
      setCurrentTemplateId(null);
      setComponentsByViewport({
        desktop: [],
        tablet: [],
        mobile: [],
      });

      // Set the current project
      setCurrentProjectId(projectId);

      // Try to load the last opened template for this project
      const lastTemplateId = localStorage.getItem(
        `uibuilder:lastTemplate:${projectId}`
      );

      if (lastTemplateId) {
        // Verify the template still exists
        const projectRef = doc(db, "projects", projectId);
        const templateRef = doc(projectRef, "templates", lastTemplateId);
        const snap = await getDoc(templateRef);

        if (snap.exists()) {
          console.log("Loading last template:", lastTemplateId);
          // ✅ REMOVED: Don't set template ID here - let openProjectTemplate do it
          // Open the last template
          await openProjectTemplate(projectId, lastTemplateId);
          return;
        } else {
          console.log("Last template not found, loading first available");
        }
      }

      // If no last template or it doesn't exist, fetch templates and open first one
      const templates = await fetchProjectTemplates(projectId);

      if (templates.length > 0) {
        // Sort by updatedAt to get most recent
        const sortedTemplates = templates.sort((a, b) => {
          const aTime = a.updatedAt?.seconds || 0;
          const bTime = b.updatedAt?.seconds || 0;
          return bTime - aTime;
        });

        console.log("Opening first available template:", sortedTemplates[0].id);

        // ✅ REMOVED: Don't set template ID here - let openProjectTemplate do it
        await openProjectTemplate(projectId, sortedTemplates[0].id);
      } else {
        console.log("No templates in project, showing empty canvas");
        // No templates - just show empty canvas
        setComponentsByViewport({
          desktop: [],
          tablet: [],
          mobile: [],
        });
      }

      // Refresh explorer to show the project
      await refreshExplorer();
    } catch (error) {
      console.error("Error opening project:", error);
      alert("Failed to open project.");
    }
  };

  // Delete template from project
  const deleteProjectTemplate = async (projectId, templateId) => {
    if (!confirm("Delete this template? This cannot be undone.")) return;

    try {
      const projectRef = doc(db, "projects", projectId);
      const templateRef = doc(projectRef, "templates", templateId);
      await deleteDoc(templateRef);

      alert("Template deleted.");

      // Refresh templates
      const templates = await fetchProjectTemplates(projectId);
      setProjectTemplates(templates);

      // Clear current template if it was deleted
      if (currentTemplateId === templateId) {
        setCurrentTemplateId(null);
        setComponentsByViewport({
          desktop: [],
          tablet: [],
          mobile: [],
        });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template.");
    }
  };

  // Add project collaborator
  const addProjectCollaborator = async (projectId, collaboratorEmail) => {
    const userDoc = await getUidByEmail(collaboratorEmail);
    if (!userDoc) {
      alert("No user found with that email.");
      return;
    }

    const uid = userDoc.uid;
    const displayName =
      userDoc.displayName ||
      (userDoc.email ? userDoc.email.split("@")[0] : uid);

    const role = prompt(
      "Assign a role for this collaborator (editor/viewer):",
      "editor"
    );

    if (!role || !["editor", "viewer"].includes(role)) {
      alert("Invalid role. Please enter 'editor' or 'viewer'.");
      return;
    }

    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      alert("Project not found.");
      return;
    }

    const data = projectSnap.data();

    if (data.collaborators && data.collaborators[uid]) {
      alert("User is already a collaborator.");
      return;
    }

    await updateDoc(projectRef, {
      [`collaborators.${uid}`]: role,
      collaboratorIds: Array.from(
        new Set([...(data.collaboratorIds || []), uid])
      ),
      [`collaboratorNames.${uid}`]: displayName,
    });

    alert("Collaborator added to project!");
  };

  // Save last opened when template changes
  useEffect(() => {
    if (currentProjectId && currentTemplateId) {
      localStorage.setItem("uibuilder:lastProject", currentProjectId);
      localStorage.setItem("uibuilder:lastTemplate", currentTemplateId);
    }
  }, [currentProjectId, currentTemplateId]);

  const hideCommentsMenuDelayed = () => {
    if (commentsMenuTimeoutRef.current)
      clearTimeout(commentsMenuTimeoutRef.current);
    commentsMenuTimeoutRef.current = setTimeout(() => {
      setShowCommentsMenu(false);
      commentsMenuTimeoutRef.current = null;
    }, 150);
  };

  const cancelHideCommentsMenu = () => {
    if (commentsMenuTimeoutRef.current) {
      clearTimeout(commentsMenuTimeoutRef.current);
      commentsMenuTimeoutRef.current = null;
    }
  };

  const hideCollabMenuDelayed = () => {
    if (collabMenuTimeoutRef.current)
      clearTimeout(collabMenuTimeoutRef.current);
    collabMenuTimeoutRef.current = setTimeout(() => {
      setShowCollabMenu(false);
      collabMenuTimeoutRef.current = null;
    }, 150);
  };

  const cancelHideCollabMenu = () => {
    if (collabMenuTimeoutRef.current) {
      clearTimeout(collabMenuTimeoutRef.current);
      collabMenuTimeoutRef.current = null;
    }
  };

  const showPaletteHoverPreview = (item, rect) => {
    if (paletteHoverTimeoutRef.current) {
      clearTimeout(paletteHoverTimeoutRef.current);
      paletteHoverTimeoutRef.current = null;
    }
    setHoveredPaletteItem(item);
    setPaletteHoverRect(rect);
    console.log("preview test");
  };

  const hidePaletteHoverPreviewDelayed = (delay = 120) => {
    if (paletteHoverTimeoutRef.current)
      clearTimeout(paletteHoverTimeoutRef.current);
    paletteHoverTimeoutRef.current = setTimeout(() => {
      setHoveredPaletteItem(null);
      setPaletteHoverRect(null);
      paletteHoverTimeoutRef.current = null;
    }, delay);
  };

  const showHoverPreview = (lib, rect) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredLib(lib);
    setHoverRect(rect);
  };

  const hideHoverPreviewDelayed = (delay = 120) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredLib(null);
      setHoverRect(null);
      hoverTimeoutRef.current = null;
    }, delay);
  };

  // Icon assets
  const [assets, setAssets] = useState([]);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const fetchAssets = async () => {
    if (!auth.currentUser) {
      setAssets([]);
      return;
    }

    // ✅ CHANGE: Only require project (not template)
    if (!currentProjectId) {
      setAssets([]);
      return;
    }

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const colRef = collection(projectRef, "assets"); // ✅ Direct child of project
      const snap = await getDocs(colRef);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAssets(list);
    } catch (err) {
      console.error("fetchAssets error:", err);
    }
  };

  // ✅ Update dependency - remove currentTemplateId
  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser, currentProjectId]); // Removed currentTemplateId

  // Around line 4700 - Update the useEffect dependency for fetchAssets
  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser, currentTemplateId, currentProjectId]); // Add currentProjectId

  // Handle viewport switching - auto-copy mobile components to larger viewports
  useEffect(() => {
    const dims = viewportDimensions[viewport];
    setCanvasWidth(dims.width);
    setCanvasHeight(dims.height);

    // Add prompt to copy from mobile when switching to empty desktop/tablet
    if (componentsByViewport[viewport].length === 0 && viewport !== "mobile") {
      const hasMobileComponents = componentsByViewport.mobile.length > 0;
      if (hasMobileComponents) {
        const shouldCopy = window.confirm(
          `The ${viewport} view is empty. Copy components from mobile view as a starting point?`
        );
        if (shouldCopy) {
          // Deep clone mobile components
          const clonedComponents = JSON.parse(
            JSON.stringify(componentsByViewport.mobile)
          );

          // Scale positions/sizes to fit new viewport
          const scaleX = dims.width / viewportDimensions.mobile.width;
          const scaleY = dims.height / viewportDimensions.mobile.height;

          // ✅ FIX: Generate completely new unique IDs instead of appending viewport name
          const scaledComponents = clonedComponents.map((comp) => {
            const newId = `added-${nextIdRef.current++}`;
            return {
              ...comp,
              id: newId, // ✅ Use fresh unique ID
              box: [
                comp.box[0] * scaleX,
                comp.box[1] * scaleY,
                comp.box[2] * scaleX,
                comp.box[3] * scaleY,
              ],
            };
          });

          // ✅ Update nextComponentId to stay ahead
          setNextComponentId(nextIdRef.current);

          setComponentsByViewport((prev) => ({
            ...prev,
            [viewport]: scaledComponents,
          }));
        }
      }
    }
  }, [viewport]);

  const uploadAsset = async (file) => {
    if (!file) return;
    if (!auth.currentUser) return alert("Log in to upload assets.");

    // ✅ CHANGE: Only require project
    if (!currentProjectId) {
      alert("Please open a project first to upload assets.");
      return;
    }

    const readFileAsDataURL = (f) =>
      new Promise((res, rej) => {
        const r = new FileReader();
        r.onerror = () => rej(new Error("File read error"));
        r.onload = () => res(r.result);
        r.readAsDataURL(f);
      });

    const resizeDataUrl = async (dataUrl, maxDim = 1024, quality = 0.8) => {
      return new Promise((resolve) => {
        const img = typeof window !== "undefined" ? new window.Image() : null;
        if (!img) {
          return resolve(dataUrl);
        }
        img.onload = () => {
          const { width, height } = img;
          let w = width;
          let h = height;
          if (Math.max(w, h) > maxDim) {
            const scale = maxDim / Math.max(w, h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const useJpeg = !dataUrl.startsWith("data:image/png");
          const out = canvas.toDataURL(
            useJpeg ? "image/jpeg" : "image/png",
            quality
          );
          resolve(out);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });
    };

    try {
      setUploadingAsset(true);
      const rawDataUrl = await readFileAsDataURL(file);
      const dataUrl = await resizeDataUrl(rawDataUrl, 1024, 0.8);

      const approxBytes = Math.ceil(
        ((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4
      );
      if (approxBytes > 900000) {
        if (
          !confirm(
            "Image is large and may exceed Firestore document size. Continue storing it in Firestore?"
          )
        ) {
          setUploadingAsset(false);
          return;
        }
      }

      const payload = {
        ownerId: auth.currentUser.uid,
        name: file.name,
        url: dataUrl,
        createdAt: Timestamp.now(),
        type: "icon",
        sizeApprox: approxBytes,
      };

      // ✅ CHANGE: Save to project level
      const projectRef = doc(db, "projects", currentProjectId);
      await addDoc(collection(projectRef, "assets"), payload);

      await fetchAssets();
    } catch (err) {
      console.error("uploadAsset error:", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploadingAsset(false);
    }
  };

  // Around line 4820 - Update deleteAsset function
  const deleteAsset = async (asset) => {
    if (!asset) return;
    if (!confirm(`Delete asset "${asset.name}"?`)) return;

    try {
      // ✅ CHANGE: Delete from project level
      if (currentProjectId) {
        const projectRef = doc(db, "projects", currentProjectId);
        await deleteDoc(doc(projectRef, "assets", asset.id));
      } else {
        alert("No project open.");
        return;
      }

      await fetchAssets();
    } catch (err) {
      console.error("deleteAsset error:", err);
      alert("Failed to delete asset.");
    }
  };

  // add AssetItem component (draggable)
  const AssetItem = ({ asset, onInsert, onDelete }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "component",
      item: {
        label: "icon",
        variant: { imgUrl: asset.url, box: [0, 0, 48, 48] },
      },
      collect: (m) => ({ isDragging: !!m.isDragging() }),
    });
    return (
      <div
        ref={drag}
        className={`flex items-center justify-between p-2 border rounded bg-white ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <img
            src={asset.url}
            alt={asset.name}
            className="w-8 h-8 object-cover rounded"
            draggable={false}
          />
          <div className="text-sm truncate max-w-[140px]">{asset.name}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() =>
              onInsert?.({
                label: "icon",
                variant: { imgUrl: asset.url, box: [0, 0, 48, 48] },
              })
            }
          >
            Insert
          </button>
          <button
            className="text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
            onClick={() => onDelete?.(asset)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  // Autosave refs/state
  const autosaveTimer = useRef(null);
  const getDraftKey = (tplId) =>
    tplId ? `uibuilder:draft:${tplId}` : "uibuilder:draft:unsaved";
  // Clear a local draft
  const clearLocalDraft = (tplId = currentTemplateId) => {
    try {
      localStorage.removeItem(getDraftKey(tplId));
    } catch (e) {
      /* ignore */
    }
  };

  const clearTempPin = () => {
    setTempPin(null);
    setInitialOpenPinId(null);
  };
  // helper to fetch comments for current template
  const fetchComments = async () => {
    if (!currentProjectId || !currentTemplateId) {
      console.warn("fetchComments: no project or template");
      setComments([]);
      return;
    }

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const ref = doc(projectRef, "templates", currentTemplateId);

      const snap = await getDoc(ref);
      if (!snap.exists()) {
        console.warn("fetchComments: template not found");
        return;
      }

      const data = snap.data();
      setComments(data.comments || []);
      fetchCommentAuthors(data.comments || []);
    } catch (err) {
      console.error("fetchComments error:", err);
    }
  };

  // ensure display names for comment authors are cached in userMap
  const fetchCommentAuthors = async (commentArray = []) => {
    const ids = Array.from(
      new Set(commentArray.map((c) => c.authorId).filter(Boolean))
    );
    // prefer collaboratorNames on template (no need to fetch those)
    const tpl = userTemplates.find((t) => t.id === currentTemplateId) || {};
    const stored = tpl.collaboratorNames || {};
    const toFetch = ids.filter((id) => id && !userMap[id] && !stored[id]);
    if (toFetch.length === 0) return;
    await Promise.all(toFetch.map((id) => getUserByUid(id)));
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTemplateId, currentProjectId]);

  // Called by Canvas when user clicks to place a pin (normalized coords)
  const handlePlacePinRequest = ({ x, y }) => {
    console.log("handlePlacePinRequest:", { x, y });
    if (!currentTemplateId) {
      alert("Open a template first to place pins.");
      return;
    }
    const pinId = `pin-${Date.now()}`;
    setTempPin({ pinId, x, y });
    // focus the comments UI on this new pin (will show "No comments yet" until user adds one)
    setInitialOpenPinId(pinId);
    // increment signal to ensure Comments opens immediately
    setCommentOpenSignal((s) => s + 1);
    setPinMode(false); // exit pin mode after placing
  };

  const getUserByUid = async (uid) => {
    if (!uid) return null;
    if (userMap[uid]) return userMap[uid];
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        const u = userSnap.data();
        const name = u.displayName || (u.email ? u.email.split("@")[0] : uid);
        setUserMap((prev) => ({ ...prev, [uid]: name }));
        return name;
      }
    } catch (err) {
      console.error("getUserByUid error:", err);
    }
    // fallback to truncated uid
    const short = uid?.length > 8 ? uid.slice(0, 8) + "..." : uid;
    setUserMap((prev) => ({ ...prev, [uid]: short }));
    return short;
  };

  const fetchCollaboratorNames = async () => {
    if (!currentTemplateId) return;
    const tpl = userTemplates.find((t) => t.id === currentTemplateId);
    if (!tpl) return;
    // prefer collaboratorNames stored on template
    const stored = tpl.collaboratorNames || {};
    if (Object.keys(stored).length) {
      setUserMap((prev) => ({ ...prev, ...stored }));
    }
    const ids =
      tpl.collaboratorIds?.length > 0
        ? tpl.collaboratorIds
        : Object.keys(tpl.collaborators || {});
    const toFetch = ids.filter((id) => id && !userMap[id] && !stored[id]);
    await Promise.all(toFetch.map((id) => getUserByUid(id)));
  };

  const resolveUserName = (uid) => {
    if (!uid) return "Unassigned";
    const tpl = userTemplates.find((t) => t.id === currentTemplateId);
    if (tpl?.collaboratorNames && tpl.collaboratorNames[uid])
      return tpl.collaboratorNames[uid];
    if (userMap[uid]) return userMap[uid];
    return uid.length > 10 ? uid.slice(0, 8) + "..." : uid;
  };
  const tpl = userTemplates.find((t) => t.id === currentTemplateId) || {};
  const availableUsers = { ...(tpl.collaboratorNames || {}), ...userMap };

  const resolveNameToUid = (name) => {
    if (!name) return null;
    // check collaboratorNames first
    const tpl = userTemplates.find((t) => t.id === currentTemplateId) || {};
    const stored = tpl.collaboratorNames || {};
    for (const [uid, display] of Object.entries(stored)) {
      if (display.toLowerCase() === name.toLowerCase()) return uid;
    }
    // check userMap
    for (const [uid, display] of Object.entries(userMap || {})) {
      if (display.toLowerCase() === name.toLowerCase()) return uid;
    }
    return null;
  };

  // ...existing code...

  // Helper: slugify
  const slugify = (s = "") =>
    s
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";

  // Helper: dataURL -> Uint8Array + ext
  const dataUrlToBytes = (dataUrl = "") => {
    try {
      const [meta, b64] = dataUrl.split(",");
      const m = /data:(.*?);base64/.exec(meta);
      const mime = m ? m[1] : "application/octet-stream";
      const bin = atob(b64 || "");
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const ext =
        mime === "image/png"
          ? "png"
          : mime === "image/jpeg"
          ? "jpg"
          : mime === "image/svg+xml"
          ? "svg"
          : mime === "image/webp"
          ? "webp"
          : "bin";
      return { bytes, ext, mime };
    } catch {
      return {
        bytes: new Uint8Array(),
        ext: "bin",
        mime: "application/octet-stream",
      };
    }
  };

  // ...existing code...
  // Helper: keep slug for routes, add PascalCase for filenames/components
  const toPascalCase = (s = "") => {
    const name = (s || "Page")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    return /^[A-Za-z]/.test(name) ? name : `Page${name || "Page"}`;
  };
  const shadowToCss = (s) => {
    switch (s) {
      case "shadow-sm":
        return "0 1px 2px rgba(0,0,0,.05)";
      case "shadow-md":
      case "shadow":
        return "0 4px 6px rgba(0,0,0,.10)";
      case "shadow-lg":
        return "0 10px 15px rgba(0,0,0,.15)";
      case "shadow-xl":
        return "0 20px 25px rgba(0,0,0,.20)";
      default:
        return "none";
    }
  };

  const generateMultiPageFromTemplates = (
    templates = [],
    themeFallback = {}
  ) => {
    const routeSlug = (s) =>
      (s || "page")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "page";

    const files = [];

    // helper to style an absolute element in a fixed box with percentage coords
    const styleFor = (c, vw, vh) => {
      const [x, y, w, h] = c.box;
      const o = {
        position: "absolute",
        left: `${((x / vw) * 100).toFixed(2)}%`,
        top: `${((y / vh) * 100).toFixed(2)}%`,
        width: `${((w / vw) * 100).toFixed(2)}%`,
        height: `${((h / vh) * 100).toFixed(2)}%`,
      };
      if (c.bgColor && c.bgColor !== "transparent")
        o.backgroundColor = c.bgColor;
      if (c.color) o.color = c.color;
      if (c.fontSize) o.fontSize = `${c.fontSize}px`;
      if (c.fontFamily) o.fontFamily = c.fontFamily;
      if (c.fontWeight && c.fontWeight !== "normal")
        o.fontWeight = c.fontWeight;
      if (c.borderRadius) o.borderRadius = `${c.borderRadius}px`;
      if (c.opacity !== undefined && c.opacity !== 100)
        o.opacity = c.opacity / 100;
      const cssShadow = shadowToCss(
        c.shadow || themeFallback?.shadows?.default
      );
      if (cssShadow && cssShadow !== "none") o.boxShadow = cssShadow;
      return o;
    };

    const viewDims = {
      mobile: { w: 375, h: 667 },
      tablet: { w: 768, h: 1024 },
      desktop: { w: 1920, h: 1080 },
    };

    // per-component renderer (no Tailwind; inline CSS only)
    const renderComp = (c, vw, vh) => {
      const st = styleFor(c, vw, vh);
      const style = JSON.stringify(st);
      const txt = c.text || "";
      switch (c.label) {
        case "input":
          return `<input style={${style}} placeholder="${
            txt || "Enter text..."
          }" readOnly />`;
        case "button":
          return `<button style={${style}}>${txt || "Button"}</button>`;
        case "heading":
          return `<h2 style={${style}}>${txt || "Heading"}</h2>`;
        case "text":
          return `<p style={${style}}>${txt || "Text"}</p>`;
        case "checkbox":
          return `<div style={${style}}><input type="checkbox" /><span style={{marginLeft:6}}>${
            txt || "Check me"
          }</span></div>`;
        case "radio button":
          return `<div style={${style}}><input type="radio" /><span style={{marginLeft:6}}>${
            txt || "Option"
          }</span></div>`;
        case "image":
          return `<div style={${style}}><img src="${
            c.imgUrl || "https://picsum.photos/300/200"
          }" alt="" style={{width:"100%",height:"100%",objectFit:"${
            c.objectFit || "cover"
          }"}} /></div>`;
        case "icon":
          return `<div style={${style}}><img src="${
            c.imgUrl ||
            "https://www.iconpacks.net/icons/1/free-star-icon-984-thumb.png"
          }" alt="" style={{width:"100%",height:"100%",objectFit:"${
            c.objectFit || "contain"
          }"}} /></div>`;
        case "footer":
          return `<footer style={${style}}>${txt || "Footer"}</footer>`;
        case "nav": {
          const items = c.menuItems || ["Home", "About", "Contact"];
          const alignment = c.alignment || "center";
          const logoType = c.logoType || "none";
          const menuLinks = c.menuLinks || {};
          const auto = !!c.enableAutoLinks;
          const logoTemplate = c.logoTemplate || "";
          const justify =
            alignment === "left"
              ? "justify-start"
              : alignment === "right"
              ? "justify-end"
              : "justify-center";
          const toSlug = (s) =>
            s
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") || "page";
          const logoSlug = logoTemplate ? toSlug(logoTemplate) : null;
          const logo =
            logoType === "text" && c.logoText
              ? logoSlug
                ? `<Link to="/${logoSlug}" style={{ color: ${
                    st.color ? `'${st.color}'` : "undefined"
                  } }} className="font-semibold mr-6">${c.logoText}</Link>`
                : `<div style={{ color: ${
                    st.color ? `'${st.color}'` : "undefined"
                  } }} className="font-semibold mr-6">${c.logoText}</div>`
              : logoType === "image" && c.logoUrl
              ? logoSlug
                ? `<Link to="/${logoSlug}" className="mr-6 block" style={{ width:48,height:32 }}><img src="${c.logoUrl}" alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}} /></Link>`
                : `<div className="mr-6" style={{ width:48,height:32 }}><img src="${c.logoUrl}" alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}} /></div>`
              : "";

          const itemHtml = items
            .map((mi) => {
              const slug = menuLinks[mi]
                ? toSlug(menuLinks[mi])
                : auto
                ? toSlug(mi)
                : null;
              if (slug) {
                return `<Link to="/${slug}" style={{ color: ${
                  st.color ? `'${st.color}'` : "undefined"
                } }}>${mi}</Link>`;
              }
              return `<span style={{ color: ${
                st.color ? `'${st.color}'` : "undefined"
              } }}>${mi}</span>`;
            })
            .join(" ");

          return `<nav className="flex items-center px-4 gap-6 ${justify}" style={${style}}>
    ${logo}
    <div className="flex gap-6 ${justify} flex-wrap">${itemHtml}</div>
  </nav>`;
        }
        case "frame":
        default:
          return `<div style={${style}}></div>`;
      }
    };

    // Build per-page components with ALL viewports
    templates.forEach((tpl) => {
      const byV = tpl.componentsByViewport || {};
      const comps = {
        mobile: byV.mobile || [],
        tablet: byV.tablet || [],
        desktop: byV.desktop || [],
      };
      const dims = {
        mobile: viewDims.mobile,
        tablet: viewDims.tablet,
        desktop: viewDims.desktop,
      };

      const section = (vp) => {
        const { w, h } = dims[vp];
        const list = comps[vp]
          .map((c) => renderComp(c, w, h))
          .join("\n        ");
        // absolute positioned children container
        return `
      <div className="${vp}">
        <div style={{ position:'relative', width:'100%', maxWidth:'${w}px', aspectRatio:'${w} / ${h}', margin:'0 auto' }}>
        ${list}
        </div>
      </div>`;
      };

      const CompName = toPascalCase(tpl.name || tpl.id || "Page");
      const page = `import React from 'react';
import { Link } from 'react-router-dom';

const ${CompName} = () => {
  return (
    <div>
      ${section("mobile")}
      ${section("tablet")}
      ${section("desktop")}
    </div>
  );
};

export default ${CompName};
`;
      files.push({ filename: `src/pages/${CompName}.jsx`, content: page });
    });

    // App.jsx with Router + responsive CSS import (once)
    const importsPages = templates
      .map((t) => {
        const n = toPascalCase(t.name || t.id || "Page");
        return `import ${n} from './pages/${n}';`;
      })
      .join("\n");
    const routes = templates
      .map((t) => {
        const n = toPascalCase(t.name || t.id || "Page");
        const p = routeSlug(t.name || t.id || "page");
        return `<Route path="/${p}" element={<${n} />} />`;
      })
      .join("\n          ");
    const first = routeSlug(templates[0]?.name || templates[0]?.id || "home");

    const appFile = `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/responsive.css';
${importsPages}

const App = () => (
  <BrowserRouter>
    <Routes>
      ${routes}
      <Route path="*" element={<Navigate to="/${first}" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;`;

    files.push({ filename: "src/App.jsx", content: appFile });
    files.push({
      filename: "src/index.jsx",
      content:
        "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\ncreateRoot(document.getElementById('root')).render(<App />);",
    });

    // Add responsive CSS (no Tailwind needed)
    files.push({
      filename: "src/styles/responsive.css",
      content: `.mobile{display:block}.tablet{display:none}.desktop{display:none}
@media (min-width: 768px){.mobile{display:none}.tablet{display:block}.desktop{display:none}}
@media (min-width: 1024px){.mobile{display:none}.tablet{display:none}.desktop{display:block}}`,
    });

    return files;
  };
  // ...existing code...

  // Export the currently opened project as a ZIP
  const exportCurrentProjectZip = async () => {
    if (!currentProjectId) {
      alert("Open a project first.");
      return;
    }

    try {
      // Fetch project meta
      const projectRef = doc(db, "projects", currentProjectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        alert("Project not found.");
        return;
      }
      const project = { id: projectSnap.id, ...projectSnap.data() };
      const projectName = project.name || `project-${projectSnap.id}`;
      const rootName = slugify(projectName);

      // Fetch templates for this project
      const templates = await fetchProjectTemplates(currentProjectId);

      // Build ZIP
      const zip = new JSZip();
      const root = zip.folder(rootName);

      // Code generation (src/)
      const codeFiles = generateMultiPageFromTemplates(templates, currentTheme);
      codeFiles.forEach((f) => root.file(f.filename, f.content));

      // Scaffolding
      root.file(
        "package.json",
        JSON.stringify(
          {
            name: rootName,
            version: "1.0.0",
            private: true,
            scripts: { start: "vite", build: "vite build" },
            dependencies: {
              react: "^18.2.0",
              "react-dom": "^18.2.0",
              "react-router-dom": "^6.22.3",
            },
            devDependencies: { vite: "^5.0.0" },
          },
          null,
          2
        )
      );
      root.file(
        "index.html",
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${projectName}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="min-h-screen bg-white">
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>`
      );
      root.file(
        "README.md",
        `# ${projectName}

Exported from UI Builder.

- Code pages in src/pages/
- Raw project data in raw/
- Assets (if any) under public/assets/

Run:
npm install
npm start
`
      );
      root.file(".gitignore", "node_modules\ndist\n.DS_Store\n.env\n");

      // Raw project data
      const raw = root.folder("raw");
      raw.file("project.json", JSON.stringify(project, null, 2));

      // Per-template raw JSON and subcollections (assets, componentsLibrary)
      for (const tpl of templates) {
        const tplFolder = raw.folder(
          `templates/${slugify(tpl.name || tpl.id)}`
        );
        tplFolder.file("template.json", JSON.stringify(tpl, null, 2));

        // Fetch subcollections
        const tplRef = doc(projectRef, "templates", tpl.id);
        const assetsSnap = await getDocs(collection(tplRef, "assets"));
        const libSnap = await getDocs(collection(tplRef, "componentsLibrary"));

        const assets = assetsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const libs = libSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        tplFolder.file("assets.json", JSON.stringify(assets, null, 2));
        tplFolder.file("componentsLibrary.json", JSON.stringify(libs, null, 2));

        // Write asset binaries (if data URLs)
        if (assets.length) {
          const pubAssets = root.folder(
            `public/assets/${slugify(tpl.name || tpl.id)}`
          );
          assets.forEach((a, idx) => {
            if (
              a.url &&
              typeof a.url === "string" &&
              a.url.startsWith("data:")
            ) {
              const { bytes, ext } = dataUrlToBytes(a.url);
              const baseName = a.name
                ? a.name.replace(/\s+/g, "_")
                : `${a.id || idx}.${ext}`;
              const fileName = baseName.toLowerCase().endsWith(`.${ext}`)
                ? baseName
                : `${baseName}.${ext}`;
              pubAssets.file(fileName, bytes, { binary: true });
            }
          });
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${rootName}.zip`);
    } catch (err) {
      console.error("Export project ZIP failed:", err);
      alert("Export failed: " + (err.message || err));
    }
  };

  // ...existing code...

  // Generate React code from components
  const generateReactCode = () => {
    let imports = `import React from 'react';\n\n`;

    let componentCode = `const ResponsiveWireframe = () => {\n`;
    componentCode += `  return (\n`;
    componentCode += `    <>\n`;

    // Generate code for each viewport with media query wrappers
    const viewports = ["mobile", "tablet", "desktop"];

    viewports.forEach((viewportName) => {
      const viewportComponents = componentsByViewport[viewportName] || [];
      if (viewportComponents.length === 0) return; // Skip empty viewports

      const dims = viewportDimensions[viewportName];
      const { width: vw, height: vh } = dims;

      // Add viewport-specific wrapper with CSS classes for responsive display
      const displayClass =
        viewportName === "mobile"
          ? "block md:hidden"
          : viewportName === "tablet"
          ? "hidden md:block lg:hidden"
          : "hidden lg:block";

      componentCode += `      {/* ${viewportName.toUpperCase()} view (${vw}×${vh}) */}\n`;
      componentCode += `      <div className="${displayClass}">\n`;
      // Use 100% width/height with max constraints and aspect ratio to fill available space
      componentCode += `        <div className="relative bg-white text-gray-800 mx-auto" style={{ width: '100%', maxWidth: '${vw}px', aspectRatio: '${vw} / ${vh}' }}>\n`;

      const sortedComponents = [...viewportComponents].sort(
        (a, b) => a.box[1] - b.box[1]
      );

      sortedComponents.forEach((component) => {
        const [x, y, width, height] = component.box;

        // Build style object with PERCENTAGE values for responsive scaling
        const styleObj = {
          position: "absolute",
          left: `${((x / vw) * 100).toFixed(2)}%`,
          top: `${((y / vh) * 100).toFixed(2)}%`,
          width: `${((width / vw) * 100).toFixed(2)}%`,
          height: `${((height / vh) * 100).toFixed(2)}%`,
        };

        // Add styling properties
        const fontFamily =
          component.fontFamily || currentTheme.typography?.headingFont;
        const fontSize =
          component.fontSize || currentTheme.typography?.baseFontSize;
        const fontWeight = component.fontWeight || "normal";
        const color =
          component.color ||
          currentTheme.colors?.componentSpecific?.[component.label]?.text ||
          currentTheme.colors?.text;
        const bgColor =
          component.bgColor ||
          currentTheme.colors?.componentSpecific?.[component.label]?.background;
        const borderRadius =
          component.borderRadius !== undefined
            ? component.borderRadius
            : currentTheme.spacing?.borderRadius || 4;
        const opacity =
          component.opacity !== undefined ? component.opacity / 100 : 1;

        if (fontFamily) styleObj.fontFamily = fontFamily;
        if (fontSize) styleObj.fontSize = `${fontSize}px`;
        if (fontWeight && fontWeight !== "normal")
          styleObj.fontWeight = fontWeight;
        if (borderRadius) styleObj.borderRadius = `${borderRadius}px`;
        if (opacity !== 1) styleObj.opacity = opacity;
        if (color) styleObj.color = color;
        if (bgColor && bgColor !== "transparent")
          styleObj.backgroundColor = bgColor;

        const styleString = JSON.stringify(styleObj);
        const shadow = component.shadow || currentTheme.shadows?.default;
        const shadowClass = shadow && shadow !== "none" ? shadow : "";

        // Generate component JSX
        switch (component.label) {
          case "input":
            componentCode += `          <input className="p-2 border rounded ${shadowClass}" style={${styleString}} placeholder="${
              component.text || "Enter text..."
            }" />\n`;
            break;

          case "button":
            componentCode += `          <button className="text-white hover:opacity-90 ${shadowClass}" style={${styleString}}>${
              component.text || "Button"
            }</button>\n`;
            break;

          case "heading":
            componentCode += `          <h2 className="font-bold ${shadowClass}" style={${styleString}}>${
              component.text || "Heading Text"
            }</h2>\n`;
            break;

          case "text":
            componentCode += `          <p className="${shadowClass}" style={${styleString}}>${
              component.text || "Sample text goes here."
            }</p>\n`;
            break;

          case "checkbox":
            componentCode += `          <div className="flex items-center gap-2 ${shadowClass}" style={${styleString}}>\n`;
            componentCode += `            <input type="checkbox" className="w-4 h-4" />\n`;
            componentCode += `            <span>${
              component.text || "Check me"
            }</span>\n`;
            componentCode += `          </div>\n`;
            break;

          case "radio button":
            componentCode += `          <div className="flex items-center gap-2 ${shadowClass}" style={${styleString}}>\n`;
            componentCode += `            <input type="radio" className="w-4 h-4" />\n`;
            componentCode += `            <span>${
              component.text || "Option"
            }</span>\n`;
            componentCode += `          </div>\n`;
            break;

          case "nav": {
            const navItems = component.menuItems || [
              "Home",
              "About",
              "Contact",
            ];
            const alignment = component.alignment || "center";
            const logoType = component.logoType || "none";
            const menuLinks = component.menuLinks || {};
            const auto = !!component.enableAutoLinks;
            const logoTemplate = component.logoTemplate || "";
            const justify =
              alignment === "left"
                ? "justify-start"
                : alignment === "right"
                ? "justify-end"
                : "justify-center";
            const toSlug = (s) =>
              s
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || "page";
            const logoSlug = logoTemplate ? toSlug(logoTemplate) : null;
            const logoJsx =
              logoType === "text" && component.logoText
                ? logoSlug
                  ? `<a href="/${logoSlug}" style={{ color: '${
                      styleObj.color || ""
                    }' }} className="font-semibold mr-6">${
                      component.logoText
                    }</a>`
                  : `<div style={{ color: '${
                      styleObj.color || ""
                    }' }} className="font-semibold mr-6">${
                      component.logoText
                    }</div>`
                : logoType === "image" && component.logoUrl
                ? logoSlug
                  ? `<a href="/${logoSlug}" className="mr-6 block" style={{ width:48,height:32 }}><img src="${component.logoUrl}" alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}} /></a>`
                  : `<div className="mr-6" style={{ width:48,height:32 }}><img src="${component.logoUrl}" alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}} /></div>`
                : "";
            componentCode += `          <nav className="flex items-center px-4 gap-6 ${justify} ${shadowClass}" style={${styleString}}>\n`;
            if (logoJsx) componentCode += `            ${logoJsx}\n`;
            componentCode += `            <div className="flex gap-6 ${justify} flex-wrap">\n`;
            navItems.forEach((item) => {
              const target = menuLinks[item]
                ? toSlug(menuLinks[item])
                : auto
                ? toSlug(item)
                : null;
              if (target) {
                componentCode += `              <a href="/${target}" className="hover:underline" style={{ color: '${
                  styleObj.color || ""
                }' }}>${item}</a>\n`;
              } else {
                componentCode += `              <span style={{ color: '${
                  styleObj.color || ""
                }' }}>${item}</span>\n`;
              }
            });
            componentCode += `            </div>\n`;
            componentCode += `          </nav>\n`;
            break;
          }

          case "footer":
            componentCode += `          <footer className="p-3 text-center ${shadowClass}" style={${styleString}}>${
              component.text || "Footer Content"
            }</footer>\n`;
            break;

          case "image":
            componentCode += `          <div className="overflow-hidden ${shadowClass}" style={${styleString}}>\n`;
            componentCode += `            <img src="${
              component.imgUrl || "https://picsum.photos/300/200"
            }" alt="image" style={{ width: '100%', height: '100%', objectFit: '${
              component.objectFit || "cover"
            }' }} />\n`;
            componentCode += `          </div>\n`;
            break;

          case "icon":
            componentCode += `          <div className="flex items-center justify-center ${shadowClass}" style={${styleString}}>\n`;
            componentCode += `            <img src="${
              component.imgUrl ||
              "https://www.iconpacks.net/icons/1/free-star-icon-984-thumb.png"
            }" alt="icon" style={{ width: '100%', height: '100%', objectFit: '${
              component.objectFit || "contain"
            }' }} />\n`;
            componentCode += `          </div>\n`;
            break;

          case "frame":
            componentCode += `          <div className="${shadowClass}" style={${styleString}}></div>\n`;
            break;
        }
      });

      componentCode += `        </div>\n`;
      componentCode += `      </div>\n\n`;
    });

    componentCode += `    </>\n`;
    componentCode += `  );\n`;
    componentCode += `};\n\n`;
    componentCode += `export default ResponsiveWireframe;\n`;

    return imports + componentCode;
  };

  // Handle export as React code
  const handleExportReactCode = () => {
    const code = generateReactCode();
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "WireframeTemplate.jsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    const data = {
      theme: currentTheme,
      componentsByViewport, // Save all viewport designs
      canvasWidth,
      canvasHeight,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "uibuilder-project.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!collabMode || !currentTemplateId) return;

    let templateRef;

    // Check if template is in a project or top-level
    if (currentProjectId) {
      const projectRef = doc(db, "projects", currentProjectId);
      templateRef = doc(projectRef, "templates", currentTemplateId);
    } else {
      templateRef = doc(db, "templates", currentTemplateId);
    }

    const unsubscribe = onSnapshot(templateRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        // Handle both old (components) and new (componentsByViewport) format
        if (data.componentsByViewport) {
          setComponentsByViewport(data.componentsByViewport);

          // Find max ID across all viewports
          const allComps = [
            ...(data.componentsByViewport.desktop || []),
            ...(data.componentsByViewport.tablet || []),
            ...(data.componentsByViewport.mobile || []),
          ];
          const maxId = allComps
            .filter(
              (c) =>
                c.id && typeof c.id === "string" && c.id.startsWith("added-")
            )
            .map((c) => parseInt(c.id.replace("added-", ""), 10))
            .reduce((m, v) => Math.max(m, v), -1);
          const nextVal = Math.max(
            allComps.length,
            maxId + 1,
            nextIdRef.current
          );
          setNextComponentId(nextVal);
          nextIdRef.current = Math.max(nextIdRef.current, nextVal);
        } else if (data.components) {
          // Old format: migrate to desktop viewport
          setComponentsByViewport({
            desktop: data.components,
            tablet: [],
            mobile: [],
          });

          const serverComps = data.components || [];
          const maxId = serverComps
            .filter(
              (c) =>
                c.id && typeof c.id === "string" && c.id.startsWith("added-")
            )
            .map((c) => parseInt(c.id.replace("added-", ""), 10))
            .reduce((m, v) => Math.max(m, v), -1);
          const nextVal = Math.max(
            serverComps.length,
            maxId + 1,
            nextIdRef.current
          );
          setNextComponentId(nextVal);
          nextIdRef.current = Math.max(nextIdRef.current, nextVal);
        }

        setCurrentTheme(data.theme || currentTheme);
        setCanvasWidth(data.canvasWidth || 640);
        setCanvasHeight(data.canvasHeight || 640);
      }
    });
    return () => unsubscribe();
  }, [collabMode, currentTemplateId, currentProjectId]); // Add currentProjectId dependency

  // Around line 4000 - Update saveTemplateRealtime function
  const saveTemplateRealtime = async (updatedData) => {
    if (!collabMode || !currentTemplateId) return;

    let templateRef;

    // Check if template is in a project or top-level
    if (currentProjectId) {
      const projectRef = doc(db, "projects", currentProjectId);
      templateRef = doc(projectRef, "templates", currentTemplateId);
    } else {
      templateRef = doc(db, "templates", currentTemplateId);
    }

    await updateDoc(templateRef, updatedData);
  };

  const getCurrentUserRole = () => {
    if (!auth.currentUser) return null;

    // Check project role first (if in project context)
    if (currentProjectId) {
      const project = projects.find((p) => p.id === currentProjectId);
      if (!project) return null;
      if (project.ownerId === auth.currentUser.uid) return "owner";
      if (project.collaborators && project.collaborators[auth.currentUser.uid])
        return project.collaborators[auth.currentUser.uid];
      return null;
    }

    // Fallback: Check template role (old format)
    if (currentTemplateId) {
      const tpl = userTemplates.find((t) => t.id === currentTemplateId);
      if (!tpl) return null;
      if (tpl.ownerId === auth.currentUser.uid) return "owner";
      if (tpl.collaborators && tpl.collaborators[auth.currentUser.uid])
        return tpl.collaborators[auth.currentUser.uid];
      return null;
    }

    return null;
  };

  const currentUserRole = getCurrentUserRole();
  const canEdit = currentUserRole !== "viewer";

  const addTask = async (newTask) => {
    if (!currentTemplateId) return;

    let templateRef;

    // Check if template is in a project or top-level
    if (currentProjectId) {
      const projectRef = doc(db, "projects", currentProjectId);
      templateRef = doc(projectRef, "templates", currentTemplateId);
    } else {
      templateRef = doc(db, "templates", currentTemplateId);
    }

    // Atomically append the new task to tasks array
    await updateDoc(templateRef, {
      tasks: arrayUnion(newTask),
    });
    // refresh local list (optional, onSnapshot will update if active)
    await fetchTasks();
    await fetchCollaboratorNames();
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    if (!currentTemplateId) return;

    let templateRef;

    // Check if template is in a project or top-level
    if (currentProjectId) {
      const projectRef = doc(db, "projects", currentProjectId);
      templateRef = doc(projectRef, "templates", currentTemplateId);
    } else {
      templateRef = doc(db, "templates", currentTemplateId);
    }

    // Use a transaction to avoid clobbering concurrent changes
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(templateRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const existingTasks = data.tasks || [];
      const updatedTasks = existingTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      tx.update(templateRef, { tasks: updatedTasks });
    });
    await fetchTasks();
    await fetchCollaboratorNames();
  };

  const fetchTasks = async () => {
    if (!currentTemplateId) return;

    let templateRef;

    // Check if template is in a project or top-level
    if (currentProjectId) {
      const projectRef = doc(db, "projects", currentProjectId);
      templateRef = doc(projectRef, "templates", currentTemplateId);
    } else {
      templateRef = doc(db, "templates", currentTemplateId);
    }

    const snapshot = await getDoc(templateRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setTasks(data.tasks || []);
      await fetchCollaboratorNames();
    }
  };

  const getUidByEmail = async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      // return the full user document data (uid, email, displayName, etc.)
      return snap.docs[0].data();
    }
    return null;
  };

  // Add this function inside your Test component
  const addCollaborator = async (templateId, collaboratorEmail) => {
    const userDoc = await getUidByEmail(collaboratorEmail);
    if (!userDoc) {
      alert("No user found with that email.");
      return;
    }
    const uid = userDoc.uid;
    const displayName =
      userDoc.displayName ||
      (userDoc.email ? userDoc.email.split("@")[0] : uid);
    // Prompt for role
    const role = prompt(
      "Assign a role for this collaborator (editor/viewer):",
      "editor"
    );
    if (!role || !["editor", "viewer"].includes(role)) {
      alert("Invalid role. Please enter 'editor' or 'viewer'.");
      return;
    }
    const templateRef = doc(db, "templates", templateId);
    const templateSnap = await getDoc(templateRef);
    if (!templateSnap.exists()) {
      alert("Template not found.");
      return;
    }
    const data = templateSnap.data();
    // Prevent duplicates
    if (data.collaborators && data.collaborators[uid]) {
      alert("User is already a collaborator.");
      return;
    }
    // Update both collaborators object and collaboratorIds array
    await updateDoc(templateRef, {
      [`collaborators.${uid}`]: role,
      collaboratorIds: Array.from(
        new Set([...(data.collaboratorIds || []), uid])
      ),
      // store friendly name so UI can display username without extra lookups
      [`collaboratorNames.${uid}`]: displayName,
    });
    alert("Collaborator added!");
  };

  // Add this function near addCollaborator (inside Test component)
  const removeCollaborator = async (templateId, uid) => {
    if (!templateId && !currentTemplateId) return;
    const tplId = templateId || currentTemplateId;

    // Only owner should remove collaborators (ui-level guard)
    if (getCurrentUserRole() !== "owner") {
      alert("Only the owner can remove collaborators.");
      return;
    }

    const templateRef = doc(db, "templates", tplId);
    const templateSnap = await getDoc(templateRef);
    if (!templateSnap.exists()) {
      alert("Template not found.");
      return;
    }
    const data = templateSnap.data();
    if (!data.collaborators || !data.collaborators[uid]) {
      alert("User is not a collaborator.");
      return;
    }

    const confirmed = window.confirm(
      `Remove collaborator ${uid} from this template? This cannot be undone in UI.`
    );
    if (!confirmed) return;

    await updateDoc(templateRef, {
      [`collaborators.${uid}`]: deleteField(),
      collaboratorIds: arrayRemove(uid),
      [`collaboratorNames.${uid}`]: deleteField(),
    });

    // refresh local templates/tasks if needed
    const templates = await fetchUserTemplates();
    setUserTemplates(templates);
    if (tplId === currentTemplateId) {
      const snap = await getDoc(templateRef);
      if (snap.exists()) {
        const tpl = snap.data();
        setTasks(tpl.tasks || []);
      }
    }

    alert("Collaborator removed.");
  };

  // helper to remove by email (uses existing getUidByEmail)
  const removeCollaboratorByEmail = async (templateId, email) => {
    const userDoc = await getUidByEmail(email);
    if (!userDoc) {
      alert("No user found with that email.");
      return;
    }
    const uid = userDoc.uid || userDoc.id || null;
    if (!uid) {
      alert("User record is missing uid.");
      return;
    }
    await removeCollaborator(templateId, uid);
  };

  const fetchLibraryComponents = async () => {
    if (!auth.currentUser) {
      setLibraryComponents([]);
      return;
    }

    // ✅ CHANGE: Only require project (not template)
    if (!currentProjectId) {
      setLibraryComponents([]);
      return;
    }

    try {
      const projectRef = doc(db, "projects", currentProjectId);
      const colRef = collection(projectRef, "componentsLibrary"); // ✅ Direct child of project
      const snap = await getDocs(colRef);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLibraryComponents(list);
    } catch (err) {
      console.error("fetchLibraryComponents error:", err);
    }
  };

  // ✅ Update dependency - remove currentTemplateId
  useEffect(() => {
    fetchLibraryComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser, currentProjectId]); // Removed currentTemplateId

  // Update the useEffect dependency for fetchLibraryComponents (around line 5680):
  useEffect(() => {
    fetchLibraryComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser, currentTemplateId, currentProjectId]); // Add currentProjectId

  // Update the saveComponentToLibrary function (around line 5700):
  const saveComponentToLibrary = async (component, nameOverride) => {
    if (!auth.currentUser) {
      alert("Log in to save components.");
      return;
    }
    if (!component) {
      alert("No component selected.");
      return;
    }

    // ✅ CHANGE: Only require project
    if (!currentProjectId) {
      alert("Please open a project first to save components.");
      return;
    }

    const name =
      nameOverride ||
      prompt(
        "Name this component for your library:",
        component.label || "Component"
      );
    if (!name) return;

    const cleanedComponent = JSON.parse(JSON.stringify(component));
    delete cleanedComponent.id;
    delete cleanedComponent.zIndex;

    const payload = {
      ownerId: auth.currentUser.uid,
      name,
      component: cleanedComponent,
      createdAt: Timestamp.now(),
    };

    try {
      console.log(
        "saveComponentToLibrary: currentProjectId=",
        currentProjectId,
        "uid=",
        auth.currentUser?.uid
      );

      // ✅ CHANGE: Save to project level
      const projectRef = doc(db, "projects", currentProjectId);
      const colRef = collection(projectRef, "componentsLibrary");
      await addDoc(colRef, payload);

      alert("Component saved to library.");
      fetchLibraryComponents();
    } catch (err) {
      console.error("saveComponentToLibrary error:", err);
      if (err?.code === "permission-denied") {
        alert(
          "Permission denied when saving component. Check Firestore rules."
        );
      } else {
        alert("Failed to save component: " + (err.message || err));
      }
    }
  };

  // Update the deleteLibraryComponent function (around line 5750):
  const deleteLibraryComponent = async (libId) => {
    if (!libId) return;

    try {
      // ✅ CHANGE: Delete from project level
      if (currentProjectId) {
        const projectRef = doc(db, "projects", currentProjectId);
        const docRef = doc(projectRef, "componentsLibrary", libId);
        await deleteDoc(docRef);
      } else {
        alert("No project open.");
        return;
      }

      await fetchLibraryComponents();
      alert("Library item deleted.");
    } catch (err) {
      console.error("deleteLibraryComponent error:", err);
      alert("Failed to delete library item. Check permissions.");
    }
  };

  const insertLibraryComponent = (libComp) => {
    if (!libComp || !libComp.component) return;
    // deep-clone saved component so runtime mutations don't affect library entry
    const base = JSON.parse(JSON.stringify(libComp.component));
    // ensure no saved id / zIndex is reused
    delete base.id;
    delete base.zIndex;

    const width = base.box?.[2] || 120;
    const height = base.box?.[3] || 60;
    const x = Math.max(20, (canvasWidth - width) / 2);
    const y = Math.max(20, (canvasHeight - height) / 2);

    const newId = `added-${nextIdRef.current++}`;
    setNextComponentId(nextIdRef.current);
    const newComp = applyThemeToComponent({
      ...base,
      id: newId,
      box: [x, y, width, height],
      zIndex: components.length,
    });
    const updated = [...components, newComp];
    setComponents(updated);
    setSelectedComponentId(newId);
    // keep nextComponentId monotonic to avoid collisions
    setNextComponentId((p) =>
      Math.max(p + 1, parseInt(newId.replace("added-", "") || 0, 10) + 1)
    );
    addToHistory(updated);
  };

  const handleOpenFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // Handle both old format (components array) and new format (componentsByViewport)
        if (data.theme) {
          setCurrentTheme(data.theme);

          // New format: componentsByViewport
          if (data.componentsByViewport) {
            setComponentsByViewport(data.componentsByViewport);

            // Find max ID across all viewports
            const allComps = [
              ...(data.componentsByViewport.desktop || []),
              ...(data.componentsByViewport.tablet || []),
              ...(data.componentsByViewport.mobile || []),
            ];
            const maxId = allComps
              .filter((comp) => comp.id && comp.id.startsWith("added-"))
              .map((comp) => parseInt(comp.id.replace("added-", ""), 10))
              .reduce((max, id) => Math.max(max, id), -1);
            const nextVal = Math.max(
              initialComponents.length,
              maxId + 1,
              nextIdRef.current
            );
            setNextComponentId(nextVal);
            nextIdRef.current = Math.max(nextIdRef.current, nextVal);
          }
          // Old format: single components array - migrate to desktop viewport
          else if (data.components) {
            setComponentsByViewport({
              desktop: data.components,
              tablet: [],
              mobile: [],
            });

            const maxId = data.components
              .filter((comp) => comp.id && comp.id.startsWith("added-"))
              .map((comp) => parseInt(comp.id.replace("added-", ""), 10))
              .reduce((max, id) => Math.max(max, id), -1);
            const nextVal = Math.max(
              initialComponents.length,
              maxId + 1,
              nextIdRef.current
            );
            setNextComponentId(nextVal);
            nextIdRef.current = Math.max(nextIdRef.current, nextVal);
          } else {
            console.error("Invalid file format: missing components data");
            alert("Invalid file format: missing components data");
            e.target.value = "";
            setShowFileMenu(false);
            return;
          }

          if (data.canvasWidth) setCanvasWidth(data.canvasWidth);
          if (data.canvasHeight) setCanvasHeight(data.canvasHeight);
          console.log("File loaded successfully:", data);
        } else {
          console.error("Invalid file format: missing theme");
          alert("Invalid file format: missing theme");
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        alert("Invalid file format: " + err.message);
      }
      // Reset input value
      e.target.value = "";
      setShowFileMenu(false);
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      alert("Error reading file");
    };
    reader.readAsText(file);
  };
  // const detections = location.state?.detections || [];
  const [currentTheme, setCurrentTheme] = useState({
    colors: {
      neutral: "#1f2937",
      text: "#111827",
      componentSpecific: {
        nav: {
          background: "#1f2937",
          textColor: "#ffffff",
        },
        footer: {
          background: "#1f2937",
          textColor: "#ffffff",
        },
        button: {
          background: "#3b82f6",
          textColor: "#ffffff",
          borderRadius: 4,
        },
      },
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      baseFontSize: 16,
    },
    spacing: {
      borderRadius: 4,
      containerPadding: 16,
    },
    shadows: {
      default: "none",
    },
  });

  const handleThemeChange = (newTheme) => {
    if (!canEdit) return;
    setCurrentTheme(newTheme);
    addToHistory(components, newTheme);

    if (collabMode && currentTemplateId) {
      saveTemplateRealtime({
        components,
        theme: newTheme,
        canvasWidth,
        canvasHeight,
      });
    }
  };
  const updateLayers = (newComponents) => {
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const [nextComponentId, setNextComponentId] = useState(
    initialComponents.length
  );

  // stable monotonic id generator to avoid collisions from stale state/closures
  const nextIdRef = useRef(initialComponents.length);

  // initialize ref so it's beyond any existing added-* ids
  useEffect(() => {
    const maxAdded = initialComponents
      .map((c) =>
        typeof c.id === "string" && c.id.startsWith("added-")
          ? parseInt(c.id.replace("added-", ""), 10)
          : -1
      )
      .reduce((m, v) => Math.max(m, v), -1);
    const start = Math.max(
      nextIdRef.current,
      maxAdded + 1,
      initialComponents.length
    );
    nextIdRef.current = start;
    setNextComponentId(start);
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Track history for undo/redo
  const [history, setHistory] = useState([
    { components: initialComponents, theme: currentTheme },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  // Create refs for the sidebars
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);

  // Grid overlay component (defined inside the parent component)

  // Move utility functions inside the component
  const snapToGridValue = (value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Auto-resize canvas when viewport changes
  useEffect(() => {
    const dims = viewportDimensions[viewport];
    setCanvasWidth(dims.width);
    setCanvasHeight(dims.height);

    // Add prompt to copy from mobile when switching to empty desktop/tablet
    if (componentsByViewport[viewport].length === 0 && viewport !== "mobile") {
      const hasMobileComponents = componentsByViewport.mobile.length > 0;
      if (hasMobileComponents) {
        const shouldCopy = window.confirm(
          `The ${viewport} view is empty. Copy components from mobile view as a starting point?`
        );
        if (shouldCopy) {
          // Deep clone mobile components
          const clonedComponents = JSON.parse(
            JSON.stringify(componentsByViewport.mobile)
          );

          // Scale positions/sizes to fit new viewport
          const scaleX = dims.width / viewportDimensions.mobile.width;
          const scaleY = dims.height / viewportDimensions.mobile.height;

          const scaledComponents = clonedComponents.map((comp) => ({
            ...comp,
            id: `${comp.id}-${viewport}`, // Make IDs unique per viewport
            box: [
              comp.box[0] * scaleX,
              comp.box[1] * scaleY,
              comp.box[2] * scaleX,
              comp.box[3] * scaleY,
            ],
          }));

          setComponentsByViewport((prev) => ({
            ...prev,
            [viewport]: scaledComponents,
          }));
        }
      }
    }
  }, [viewport]);

  // Debounced local autosave when key state changes
  useEffect(() => {
    // ✅ FIX: Don't autosave on initial mount or when state is being loaded
    if (!componentsByViewport) {
      console.log("⏸️ Autosave skipped: componentsByViewport not initialized");
      return;
    }

    // ✅ FIX: Don't autosave if we're in a project but no template is open yet
    if (currentProjectId && !currentTemplateId) {
      console.log("⏸️ Autosave skipped: project open but no template loaded");
      return;
    }

    // ✅ NEW: Don't autosave if all viewports are empty (likely initial state)
    const totalComponents =
      (componentsByViewport.desktop?.length || 0) +
      (componentsByViewport.tablet?.length || 0) +
      (componentsByViewport.mobile?.length || 0);

    if (totalComponents === 0 && !currentTemplateId) {
      console.log("⏸️ Autosave skipped: empty canvas, no template");
      return;
    }

    const key = getDraftKey(currentTemplateId);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      try {
        const payload = {
          componentsByViewport,
          theme: currentTheme,
          canvasWidth,
          canvasHeight,
          updatedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
        console.log("💾 Draft auto-saved locally", key);
      } catch (err) {
        console.warn("Draft save failed", err);
      }
    }, 1500); // debounce 1.5s

    return () => clearTimeout(autosaveTimer.current);
  }, [
    componentsByViewport,
    currentTheme,
    canvasWidth,
    canvasHeight,
    currentTemplateId,
    currentProjectId,
  ]);

  // Ctrl+S / Cmd+S handler -> save to Firebase (prompts when needed)
  useEffect(() => {
    const onKeyDown = (e) => {
      const isSave =
        (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S");
      if (!isSave) return;
      e.preventDefault();

      (async () => {
        try {
          if (!currentProjectId) {
            alert("Please open or create a project first.");
            setShowProjectManager(true);
            return;
          }
          await saveTemplateToProject(currentProjectId);

          // ✅ Clear draft after successful save
          clearLocalDraft(currentTemplateId);

          // ✅ Clear prompted flag so user can restore future drafts
          sessionStorage.removeItem(
            `uibuilder:prompted:${currentTemplateId || "unsaved"}`
          );

          console.log("✅ Saved to Firebase and cleared draft");
        } catch (err) {
          console.error("Save failed:", err);
          alert("Save failed: " + (err.message || err));
        }
      })();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    currentProjectId,
    currentTemplateId,
    componentsByViewport,
    currentTheme,
    canvasWidth,
    canvasHeight,
  ]);
  // Save grid preferences when they change
  useEffect(() => {
    localStorage.setItem(
      "uibuilder_grid",
      JSON.stringify({
        enabled: gridEnabled,
        size: gridSize,
        snap: snapToGrid,
      })
    );
  }, [gridEnabled, gridSize, snapToGrid]);
  useEffect(() => {
    const savedCanvas = localStorage.getItem("uibuilder_canvas");
    if (savedCanvas) {
      try {
        const { width, height } = JSON.parse(savedCanvas);
        setCanvasWidth(width);
        setCanvasHeight(height);
      } catch (e) {
        console.error("Error loading canvas dimensions:", e);
      }
    }
  }, []);
  // Load grid preferences on component mount
  useEffect(() => {
    const savedGrid = localStorage.getItem("uibuilder_grid");
    if (savedGrid) {
      try {
        const { enabled, size, snap } = JSON.parse(savedGrid);
        setGridEnabled(enabled);
        setGridSize(size);
        setSnapToGrid(snap);
      } catch (e) {
        console.error("Error loading grid preferences:", e);
      }
    }
  }, []);
  useEffect(() => {
    // Load saved theme if it exists
    const savedTheme = localStorage.getItem("uibuilder_theme");
    if (savedTheme) {
      try {
        setCurrentTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error("Error loading theme:", e);
      }
    }
  }, []);
  useEffect(() => {
    // When theme changes, update components that should use theme values

    // Save the theme to localStorage
    localStorage.setItem("uibuilder_theme", JSON.stringify(currentTheme));
  }, [currentTheme]);
  const applyThemeToComponent = (component) => {
    // Apply theme-based values if component doesn't have specific settings
    const themedComponent = { ...component };

    if (component.label === "button" && !component.bgColor) {
      themedComponent.bgColor = currentTheme.colors.primary;
    }

    if (
      ["heading", "text"].includes(component.label) &&
      !component.fontFamily
    ) {
      themedComponent.fontFamily =
        component.label === "heading"
          ? currentTheme.typography.headingFont
          : currentTheme.typography.bodyFont;
    }

    if (
      !component.borderRadius &&
      ["button", "input", "image"].includes(component.label)
    ) {
      themedComponent.borderRadius = currentTheme.spacing.borderRadius;
    }

    return themedComponent;
  };
  // Find the currently selected component
  const selectedComponent = components.find(
    (c) => c.id === selectedComponentId
  );

  // Handle when a component is dropped onto the canvas
  const handleDropComponent = (itemOrLabel, x, y) => {
    if (!canEdit) return;
    const newId = `added-${nextIdRef.current++}`;
    setNextComponentId(nextIdRef.current);

    // Support: palette drag with variant => itemOrLabel = { label, variant }
    // library drag => itemOrLabel.libraryComponent
    // built-in icon drag => itemOrLabel.iconKey
    const isPaletteVariant =
      typeof itemOrLabel === "object" && itemOrLabel.variant;
    const isBuiltInIcon =
      typeof itemOrLabel === "object" && itemOrLabel.iconKey;
    const base = isBuiltInIcon
      ? {
          label: "icon",
          iconKey: itemOrLabel.iconKey,
          box: itemOrLabel.variant?.box || [0, 0, 48, 48],
        }
      : isPaletteVariant
      ? {
          label: itemOrLabel.label,
          ...(itemOrLabel.variant.box ? { box: itemOrLabel.variant.box } : {}),
        }
      : typeof itemOrLabel === "object" && itemOrLabel.libraryComponent
      ? JSON.parse(JSON.stringify(itemOrLabel.libraryComponent.component))
      : null;

    const label =
      typeof itemOrLabel === "string" ? itemOrLabel : base?.label || "frame";

    // If a variant was provided, merge variant styles/props onto base
    if (isPaletteVariant) {
      const v = itemOrLabel.variant;
      base.text = v.text || base.text || "";
      base.imgUrl = v.imgUrl || base.imgUrl;
      base.box = v.box || base.box || [x, y, 120, 60];

      // ✅ ADD: Handle component-specific properties from variants
      if (v.menuItems) base.menuItems = v.menuItems;
      if (v.progressValue !== undefined) base.progressValue = v.progressValue;
      if (v.breadcrumbPath) base.breadcrumbPath = v.breadcrumbPath; // ✅ Add this line

      // shallow merge styles into component root (bgColor, color, fontSize, etc.)
      if (v.styles) {
        Object.assign(base, v.styles);
      }
    }

    // If a built-in icon was dragged, set iconKey on the component so renderer knows
    if (isBuiltInIcon) {
      base.iconKey = itemOrLabel.iconKey;
    }

    // Default new component if no base provided
    let newComponent = base
      ? base
      : {
          label,
          box: [x, y, 120, 60],
          text: "",
          borderWidth: 0,
          fontSize: 16,
          fontWeight: "normal",
        };

    // Remove any saved id/zIndex so we don't reuse them
    delete newComponent.id;
    delete newComponent.zIndex;

    const width = newComponent.box?.[2] || 120;
    const height = newComponent.box?.[3] || (label === "icon" ? 30 : 60);

    newComponent.id = newId;
    newComponent.box = [x, y, width, height];
    newComponent.zIndex = components.length;

    // ✅ FIX: Only set properties if they don't exist, and use null instead of undefined
    // Remove all undefined checks - let properties be missing if not needed
    if (!("text" in newComponent)) newComponent.text = "";

    // Component-specific defaults
    if (label === "nav" && !("menuItems" in newComponent)) {
      newComponent.menuItems = ["Home", "About", "Contact"];
    }
    if (label === "nav" && !("alignment" in newComponent)) {
      newComponent.alignment = "center";
    }
    if (label === "nav" && !("menuLinks" in newComponent)) {
      newComponent.menuLinks = {};
    }
    if (label === "nav" && !("logoType" in newComponent)) {
      newComponent.logoType = "none";
      newComponent.logoText = "";
      newComponent.logoUrl = "";
      newComponent.logoTemplate = "";
    }
    if (label === "divider" && !("color" in newComponent)) {
      newComponent.color = "#000000"; // ✅ Default to black
    }
    if (label === "hamburger") {
      if (!("menuItems" in newComponent)) {
        newComponent.menuItems = ["Home", "About", "Contact"];
      }
      if (!("showMenu" in newComponent)) {
        newComponent.showMenu = false;
      }
    }

    if (label === "carousel" && !("images" in newComponent)) {
      newComponent.images = [
        "https://picsum.photos/800/400?random=1",
        "https://picsum.photos/800/400?random=2",
        "https://picsum.photos/800/400?random=3",
      ];
      newComponent.currentSlide = 0;
      newComponent.autoplaySpeed = 3;
      newComponent.showDots = true;
      newComponent.showArrows = true;
    }

    if (label === "progress" && !("progressValue" in newComponent)) {
      newComponent.progressValue = 50;
    }

    if (label === "avatar" && !("imgUrl" in newComponent)) {
      newComponent.imgUrl = "https://i.pravatar.cc/150";
      newComponent.borderRadius = 9999;
    }

    // Apply theme defaults (these will override undefined values from theme)
    const componentTheme = currentTheme.colors?.componentSpecific?.[label];

    // Only set theme values if not already set by variant
    if (!("bgColor" in newComponent)) {
      newComponent.bgColor =
        componentTheme?.background ??
        (["button", "nav", "footer"].includes(label)
          ? currentTheme.colors.neutral
          : null);
    }

    if (!("color" in newComponent)) {
      newComponent.color =
        componentTheme?.textColor ?? currentTheme.colors?.text ?? null;
    }

    if (!("fontFamily" in newComponent)) {
      newComponent.fontFamily =
        label === "heading"
          ? currentTheme.typography?.headingFont
          : currentTheme.typography?.bodyFont;
    }

    if (!("fontSize" in newComponent)) {
      newComponent.fontSize =
        label === "heading"
          ? (currentTheme.typography?.baseFontSize || 16) * 1.5
          : currentTheme.typography?.baseFontSize || 16;
    }

    if (!("fontWeight" in newComponent)) {
      newComponent.fontWeight = label === "heading" ? "bold" : "normal";
    }

    if (!("borderRadius" in newComponent)) {
      newComponent.borderRadius =
        componentTheme?.borderRadius ??
        (["button", "input", "image", "nav", "footer"].includes(label)
          ? currentTheme.spacing?.borderRadius || 4
          : null);
    }

    if (!("shadow" in newComponent)) {
      newComponent.shadow =
        currentTheme.shadows?.default !== "none"
          ? currentTheme.shadows?.default
          : null;
    }

    if (!("opacity" in newComponent)) {
      newComponent.opacity = 100;
    }

    // Clean up any undefined values before adding to components
    Object.keys(newComponent).forEach((key) => {
      if (newComponent[key] === undefined) {
        delete newComponent[key];
      }
    });

    const updatedComponents = [...components, newComponent];
    setComponents(updatedComponents);
    setSelectedComponentId(newId);
    // Log component addition
    logChange("add", newId, {
      type: newComponent.label,
      position: { x, y },
      viewport,
    });
    // ensure nextComponentId advances past any numeric id parts
    setNextComponentId((prev) =>
      Math.max(prev + 1, parseInt(newId.replace("added-", ""), 10) + 1)
    );
    addToHistory(updatedComponents);
  };

  // Add current state to history
  const addToHistory = (newComponents, newTheme = currentTheme) => {
    const newHistory = history.slice(0, historyIndex + 1);
    // Store viewport-specific components state
    const newComponentsByViewport = {
      ...componentsByViewport,
      [viewport]: newComponents,
    };
    newHistory.push({
      componentsByViewport: newComponentsByViewport,
      theme: newTheme,
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle updates to a component
  const handleComponentChange = (id, updatedComponent) => {
    if (!Array.isArray(components)) {
      console.error(
        "handleComponentChange: components is not an array",
        components
      );
      return;
    }

    // Detect conflicts
    if (detectConflict(updatedComponent)) {
      const shouldContinue = confirm(
        `${conflictData?.conflictingUser} just modified this component. Continue with your changes?`
      );
      if (!shouldContinue) return;
    }

    if (updatedComponent === null) {
      // Handle deletion
      const filteredComponents = components.filter((comp) => comp.id !== id);
      setComponents(filteredComponents);
      setSelectedComponentId(null);
      addToHistory(filteredComponents);

      // Log deletion
      logChange("delete", id, { viewport });
      return;
    }

    const oldComponent = components.find((c) => c.id === id);
    const updatedComponents = components.map((component) =>
      component.id === id ? updatedComponent : component
    );

    setComponents(updatedComponents);

    // Detect type of change
    if (oldComponent) {
      const [oldX, oldY] = oldComponent.box;
      const [newX, newY] = updatedComponent.box;

      if (oldX !== newX || oldY !== newY) {
        logChange("move", id, {
          from: { x: oldX, y: oldY },
          to: { x: newX, y: newY },
          viewport,
        });
      } else if (
        oldComponent.box[2] !== updatedComponent.box[2] ||
        oldComponent.box[3] !== updatedComponent.box[3]
      ) {
        logChange("resize", id, {
          oldSize: { w: oldComponent.box[2], h: oldComponent.box[3] },
          newSize: { w: updatedComponent.box[2], h: updatedComponent.box[3] },
          viewport,
        });
      } else {
        logChange("update", id, { viewport });
      }
    }

    if (JSON.stringify(updatedComponents) !== JSON.stringify(components)) {
      addToHistory(updatedComponents);
    }

    if (collabMode && currentTemplateId) {
      const newComponentsByViewport = {
        ...componentsByViewport,
        [viewport]: updatedComponents,
      };
      saveTemplateRealtime({
        componentsByViewport: newComponentsByViewport,
        theme: currentTheme,
        canvasWidth,
        canvasHeight,
      });
    }
  };

  // Update a component from the edit sidebar
  const handleUpdateComponent = (updatedComponent) => {
    if (!selectedComponentId) return;

    if (!Array.isArray(components)) {
      console.error(
        "handleUpdateComponent: components is not an array",
        components
      );
      return;
    }

    if (updatedComponent === null) {
      // Handle deletion
      handleComponentChange(selectedComponentId, null);
      return;
    }

    // Don't use functional update with our custom setComponents
    // Instead, directly compute the new array and pass it
    const updatedComponents = components.map((component) =>
      component.id === selectedComponentId ? updatedComponent : component
    );

    setComponents(updatedComponents);
    addToHistory(updatedComponents);

    if (collabMode && currentTemplateId) {
      const newComponentsByViewport = {
        ...componentsByViewport,
        [viewport]: updatedComponents,
      };
      saveTemplateRealtime({
        componentsByViewport: newComponentsByViewport,
        theme: currentTheme,
        canvasWidth,
        canvasHeight,
      });
    }
  };

  // Handle undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const historyEntry = history[historyIndex - 1];
      if (historyEntry.componentsByViewport) {
        setComponentsByViewport(historyEntry.componentsByViewport);
      } else if (historyEntry.components) {
        // Old format fallback
        setComponents(historyEntry.components);
      }
      setCurrentTheme(historyEntry.theme);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const historyEntry = history[historyIndex + 1];
      if (historyEntry.componentsByViewport) {
        setComponentsByViewport(historyEntry.componentsByViewport);
      } else if (historyEntry.components) {
        // Old format fallback
        setComponents(historyEntry.components);
      }
      setCurrentTheme(historyEntry.theme);
    }
  };

  // Set up click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only clear selection if the click is outside canvas AND both sidebars
      const isOutsideCanvas =
        document.querySelector(".mx-auto") &&
        !document.querySelector(".mx-auto").contains(e.target);
      const isOutsideLeftSidebar =
        !leftSidebarRef.current || !leftSidebarRef.current.contains(e.target);
      const isOutsideRightSidebar =
        !rightSidebarRef.current || !rightSidebarRef.current.contains(e.target);

      if (isOutsideCanvas && isOutsideLeftSidebar && isOutsideRightSidebar) {
        setSelectedComponentId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-50 max-h-[93vh] text-sm">
        {/* Modern Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-800 flex items-center">
              <LayoutDashboard className="mr-2 text-blue-500" size={20} />
              UI Builder
            </h1>

            <div className="hidden md:flex space-x-1">
              <div className="relative">
                <button
                  className="px-3 py-1 text-md rounded hover:bg-gray-100 text-gray-700"
                  onClick={() => setShowFileMenu((v) => !v)}
                  // Remove or increase the timeout for the onBlur event
                  // onBlur={() => setTimeout(() => setShowFileMenu(false), 150)}
                >
                  File
                </button>
                {showTemplateList && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-6">
                      <h2 className="text-lg font-semibold mb-4">
                        Your Templates
                      </h2>
                      {userTemplates.length === 0 ? (
                        <p className="text-gray-500">No templates found.</p>
                      ) : (
                        <ul>
                          {userTemplates.map((tpl) => (
                            <li
                              key={tpl.id}
                              className="mb-2 flex justify-between items-center"
                            >
                              <span>{tpl.name || "Untitled"}</span>
                              <button
                                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                onClick={() => {
                                  // Load template into editor
                                  setCurrentTheme(tpl.theme);

                                  // Handle both old (components) and new (componentsByViewport) format
                                  if (tpl.componentsByViewport) {
                                    setComponentsByViewport(
                                      tpl.componentsByViewport
                                    );

                                    // Find max ID across all viewports
                                    const allComps = [
                                      ...(tpl.componentsByViewport.desktop ||
                                        []),
                                      ...(tpl.componentsByViewport.tablet ||
                                        []),
                                      ...(tpl.componentsByViewport.mobile ||
                                        []),
                                    ];
                                    const maxId = allComps
                                      .filter(
                                        (c) =>
                                          c.id &&
                                          typeof c.id === "string" &&
                                          c.id.startsWith("added-")
                                      )
                                      .map((c) =>
                                        parseInt(c.id.replace("added-", ""), 10)
                                      )
                                      .reduce((m, v) => Math.max(m, v), -1);
                                    const nextVal = Math.max(
                                      allComps.length,
                                      maxId + 1,
                                      nextIdRef.current
                                    );
                                    setNextComponentId(nextVal);
                                    nextIdRef.current = Math.max(
                                      nextIdRef.current,
                                      nextVal
                                    );
                                  } else if (tpl.components) {
                                    // Old format: migrate to desktop viewport
                                    setComponentsByViewport({
                                      desktop: tpl.components,
                                      tablet: [],
                                      mobile: [],
                                    });

                                    const maxId = (tpl.components || [])
                                      .filter(
                                        (c) =>
                                          c.id &&
                                          typeof c.id === "string" &&
                                          c.id.startsWith("added-")
                                      )
                                      .map((c) =>
                                        parseInt(c.id.replace("added-", ""), 10)
                                      )
                                      .reduce((m, v) => Math.max(m, v), -1);
                                    const nextVal = Math.max(
                                      (tpl.components || []).length,
                                      maxId + 1,
                                      nextIdRef.current
                                    );
                                    setNextComponentId(nextVal);
                                    nextIdRef.current = Math.max(
                                      nextIdRef.current,
                                      nextVal
                                    );
                                  }

                                  setCanvasWidth(tpl.canvasWidth);
                                  setCanvasHeight(tpl.canvasHeight);
                                  setCurrentTemplateId(tpl.id);
                                  setTasks(tpl.tasks || []);
                                  setShowTemplateList(false);
                                }}
                              >
                                Open
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        className="mt-4 px-4 py-2 border rounded hover:bg-gray-100"
                        onClick={() => setShowTemplateList(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
                {/* Visual Template Organizer modal (separate from the simple list) */}
                {showTemplateOrganizer && (
                  <TemplateOrganizer
                    templates={userTemplates}
                    onOpen={(tpl) => {
                      setCurrentTheme(tpl.theme);

                      // Handle both old (components) and new (componentsByViewport) format
                      if (tpl.componentsByViewport) {
                        setComponentsByViewport(tpl.componentsByViewport);

                        // Find max ID across all viewports
                        const allComps = [
                          ...(tpl.componentsByViewport.desktop || []),
                          ...(tpl.componentsByViewport.tablet || []),
                          ...(tpl.componentsByViewport.mobile || []),
                        ];
                        const maxId = allComps
                          .filter(
                            (c) =>
                              c.id &&
                              typeof c.id === "string" &&
                              c.id.startsWith("added-")
                          )
                          .map((c) => parseInt(c.id.replace("added-", ""), 10))
                          .reduce((m, v) => Math.max(m, v), -1);
                        const nextVal = Math.max(
                          allComps.length,
                          maxId + 1,
                          nextIdRef.current
                        );
                        setNextComponentId(nextVal);
                        nextIdRef.current = Math.max(
                          nextIdRef.current,
                          nextVal
                        );
                      } else if (tpl.components) {
                        // Old format: migrate to desktop viewport
                        setComponentsByViewport({
                          desktop: tpl.components,
                          tablet: [],
                          mobile: [],
                        });

                        const maxId = (tpl.components || [])
                          .filter(
                            (c) =>
                              c.id &&
                              typeof c.id === "string" &&
                              c.id.startsWith("added-")
                          )
                          .map((c) => parseInt(c.id.replace("added-", ""), 10))
                          .reduce((m, v) => Math.max(m, v), -1);
                        const nextVal = Math.max(
                          (tpl.components || []).length,
                          maxId + 1,
                          nextIdRef.current
                        );
                        setNextComponentId(nextVal);
                        nextIdRef.current = Math.max(
                          nextIdRef.current,
                          nextVal
                        );
                      }

                      setCanvasWidth(tpl.canvasWidth || 640);
                      setCanvasHeight(tpl.canvasHeight || 640);
                      setCurrentTemplateId(tpl.id);
                      setTasks(tpl.tasks || []);
                      setShowTemplateOrganizer(false);
                    }}
                    onClose={() => setShowTemplateOrganizer(false)}
                    previewWidth={260}
                  />
                )}

                {showFileMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button
                      onClick={async () => {
                        await refreshExplorer();
                        setShowProjectManager(true);
                        setShowFileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                      Open Project
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        if (!currentProjectId) {
                          alert("Please open or create a project first.");
                          setShowProjectManager(true);
                        } else {
                          const message = prompt(
                            "Save with message (optional):",
                            ""
                          );
                          saveTemplateToProject(
                            currentProjectId,
                            true,
                            message
                          );
                        }
                        setShowFileMenu(false);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save Project
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        if (!currentTemplateId) {
                          alert("Please open a template first.");
                          return;
                        }
                        setShowVersionHistory(true);
                        setShowFileMenu(false);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Version History
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          setShowFileMenu(false);
                          return;
                        }
                        await exportCurrentProjectZip();
                        setShowFileMenu(false);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export Project (ZIP)
                    </button>
                  </div>
                )}
                {showTaskManagement &&
                typeof document !== "undefined" &&
                document.body
                  ? createPortal(
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.4)",
                          zIndex: 2147483647,
                          pointerEvents: "auto",
                        }}
                      >
                        <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Task Management
                          </h2>
                          {/* Current (active) tasks */}
                          <div className="mb-4">
                            <h3 className="font-bold text-md mb-2">
                              Current Tasks
                            </h3>
                            <ul>
                              {tasks
                                .filter((task) => task.status !== "done")
                                .map((task, idx) => (
                                  <li
                                    key={task.id || idx}
                                    className="mb-2 flex justify-between items-center"
                                  >
                                    <div>
                                      <span className="font-medium">
                                        {task.title}
                                      </span>
                                      <span className="ml-2 text-xs text-gray-500">
                                        {task.assignedTo
                                          ? `Assigned to: ${resolveUserName(
                                              task.assignedTo
                                            )}`
                                          : "Unassigned"}
                                      </span>
                                    </div>
                                    <div>
                                      <input
                                        className="cursor-pointer"
                                        type="checkbox"
                                        checked={task.status === "done"}
                                        onChange={async () => {
                                          await updateTaskStatus(
                                            task.id,
                                            task.status === "done"
                                              ? "todo"
                                              : "done"
                                          );
                                        }}
                                      />
                                      <span className="ml-1 text-xs">
                                        {task.status === "done"
                                          ? "Done"
                                          : "Todo"}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>

                          {/* Finished tasks collapsible section */}
                          <div className="mb-4">
                            <button
                              className="text-sm text-gray-600 underline"
                              onClick={() => setShowFinishedTasks((v) => !v)}
                            >
                              {showFinishedTasks
                                ? "Hide Finished Tasks"
                                : "Show Finished Tasks"}
                            </button>
                            {showFinishedTasks && (
                              <ul className="mt-2">
                                {tasks
                                  .filter((task) => task.status === "done")
                                  .map((task, idx) => (
                                    <li
                                      key={task.id || idx}
                                      className="mb-2 flex justify-between items-center opacity-70"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          {task.title}
                                        </span>
                                        <span className="ml-2 text-xs text-gray-500">
                                          {task.assignedTo
                                            ? `Assigned to: ${task.assignedTo}`
                                            : "Unassigned"}
                                        </span>
                                      </div>
                                      <span className="ml-1 text-xs text-green-600">
                                        Done
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                          {/* Assign new task */}
                          <div className="mb-4">
                            <h3 className="font-bold text-md mb-2">
                              Assign New Task
                            </h3>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const title = (
                                  e.target.title.value || ""
                                ).trim();
                                const assignedTo = e.target.assignedTo.value;
                                if (!title) {
                                  alert("Please enter a task title.");
                                  return;
                                }
                                if (!assignedTo) {
                                  alert(
                                    "Please select a collaborator to assign this task."
                                  );
                                  return;
                                }
                                // Create new task object
                                const newTask = {
                                  id: `task-${Date.now()}`,
                                  title,
                                  description: "",
                                  assignedTo,
                                  status: "todo",
                                  createdAt: new Date().toISOString(),
                                };
                                await addTask(newTask);
                                e.target.reset();
                              }}
                            >
                              <input
                                name="title"
                                type="text"
                                placeholder="Task title"
                                className="w-full px-2 py-1 border rounded mb-2"
                                required
                              />
                              <select
                                name="assignedTo"
                                className="w-full px-2 py-1 border rounded mb-2"
                                required
                              >
                                <option value="">Select collaborator</option>
                                {(() => {
                                  const currentProject = projects.find(
                                    (p) => p.id === currentProjectId
                                  );
                                  if (!currentProject) return null;

                                  const collaborators =
                                    currentProject.collaborators || {};
                                  const collaboratorNames =
                                    currentProject.collaboratorNames || {};

                                  // Also include the project owner
                                  const ownerEntry = currentProject.ownerId
                                    ? {
                                        [currentProject.ownerId]: "owner",
                                      }
                                    : {};

                                  const allCollaborators = {
                                    ...ownerEntry,
                                    ...collaborators,
                                  };

                                  return Object.entries(allCollaborators).map(
                                    ([uid, role]) => (
                                      <option key={uid} value={uid}>
                                        {`${
                                          collaboratorNames[uid] ||
                                          resolveUserName(uid)
                                        } (${role})`}
                                      </option>
                                    )
                                  );
                                })()}
                              </select>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Add Task
                              </button>
                            </form>
                          </div>
                          {/* Show your tasks */}
                          <div>
                            <h3 className="font-bold text-md mb-2">
                              Your Tasks
                            </h3>
                            <ul>
                              {tasks
                                .filter(
                                  (task) =>
                                    task.assignedTo === auth.currentUser?.uid
                                )
                                .map((task, idx) => (
                                  <li key={task.id || idx} className="mb-2">
                                    <span className="font-medium">
                                      {task.title}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      {task.status}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <button
                            className="mt-4 px-4 py-2 border rounded hover:bg-gray-100"
                            onClick={() => setShowTaskManagement(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>,
                      document.body
                    )
                  : null}
              </div>
              {/* Comments menu dropdown */}
              <div className="relative">
                <button
                  className={`px-3 py-1 text-md rounded hover:bg-gray-100 text-gray-700 flex items-center gap-1 ${
                    pinMode ? "bg-yellow-100" : ""
                  }`}
                  onMouseEnter={() => {
                    cancelHideCommentsMenu();
                    setShowCommentsMenu(true);
                  }}
                  onMouseLeave={hideCommentsMenuDelayed}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Comments
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showCommentsMenu && (
                  <div
                    className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50"
                    onMouseEnter={cancelHideCommentsMenu}
                    onMouseLeave={hideCommentsMenuDelayed}
                  >
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                        pinMode ? "bg-yellow-50 text-yellow-700" : ""
                      }`}
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          return;
                        }
                        setHideAllComments(false);
                        setPinMode((v) => !v);
                        setShowCommentsMenu(false);
                        cancelHideCommentsMenu();
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {pinMode ? "Cancel Pin" : "Add Comment"}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          return;
                        }
                        setHideAllComments(false);
                        setShowCommentsMenu(false);
                        cancelHideCommentsMenu();
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Show All Comments
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          return;
                        }
                        setHideAllComments(true);
                        setShowCommentsMenu(false);
                        cancelHideCommentsMenu();
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      Hide All Comments
                    </button>
                  </div>
                )}
              </div>

              {/* Collaboration menu dropdown */}
              <div className="relative">
                <button
                  className={`ml-2 px-3 py-1 text-md rounded hover:bg-gray-100 text-gray-700 flex items-center gap-1 ${
                    collabMode ? "bg-green-50 text-green-700" : ""
                  }`}
                  onMouseEnter={() => {
                    cancelHideCollabMenu();
                    setShowCollabMenu(true);
                  }}
                  onMouseLeave={hideCollabMenuDelayed}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {collabMode && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  )}
                  Collaboration
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showCollabMenu && (
                  <div
                    className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50"
                    onMouseEnter={cancelHideCollabMenu}
                    onMouseLeave={hideCollabMenuDelayed}
                  >
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                        collabMode ? "text-green-600" : ""
                      }`}
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          return;
                        }
                        setCollabMode((v) => !v);
                        setShowCollabMenu(false);
                        cancelHideCollabMenu();
                      }}
                    >
                      {/* ✅ NEW: Better icon for collaboration toggle - shows connection/sync status */}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </>
                      </svg>
                      {collabMode
                        ? "Stop Collaboration"
                        : "Start Collaboration"}
                    </button>

                    {/* Show/Hide Presence Panel */}
                    {collabMode && (
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                          setShowPresencePanel((v) => !v);
                          setShowCollabMenu(false);
                          cancelHideCollabMenu();
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {showPresencePanel ? "Hide" : "Show"} Active Users
                      </button>
                    )}

                    {/* Change History */}
                    {collabMode && (
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                          setShowChangeHistory(true);
                          setShowCollabMenu(false);
                          cancelHideCollabMenu();
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Change History
                      </button>
                    )}

                    <div className="border-t border-gray-200 my-1"></div>

                    {/* Add Collaborator */}
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          return;
                        }
                        const email = prompt("Enter collaborator's email:");
                        if (email) {
                          await addProjectCollaborator(currentProjectId, email);
                          await refreshExplorer();
                        }
                        setShowCollabMenu(false);
                        cancelHideCollabMenu();
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Add Collaborator
                    </button>

                    {/* Remove Collaborator */}
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={async () => {
                        if (!currentProjectId) {
                          alert("Please open a project first.");
                          setShowProjectManager(true);
                          return;
                        }
                        if (getCurrentUserRole() !== "owner") {
                          alert(
                            "Only the project owner can remove collaborators."
                          );
                          return;
                        }
                        const email = prompt(
                          "Enter collaborator's email to remove:"
                        );
                        if (email) {
                          const userDoc = await getUidByEmail(email);
                          if (!userDoc) {
                            alert("No user found with that email.");
                            return;
                          }
                          const uid = userDoc.uid;

                          const projectRef = doc(
                            db,
                            "projects",
                            currentProjectId
                          );
                          const projectSnap = await getDoc(projectRef);
                          if (!projectSnap.exists()) {
                            alert("Project not found.");
                            return;
                          }

                          const confirmed = window.confirm(
                            `Remove collaborator ${email} from this project?`
                          );
                          if (!confirmed) return;

                          await updateDoc(projectRef, {
                            [`collaborators.${uid}`]: deleteField(),
                            collaboratorIds: arrayRemove(uid),
                            [`collaboratorNames.${uid}`]: deleteField(),
                          });

                          alert("Collaborator removed from project.");
                          await refreshExplorer();
                        }
                        setShowCollabMenu(false);
                        cancelHideCollabMenu();
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                        />
                      </svg>
                      Remove Collaborator
                    </button>
                  </div>
                )}
              </div>
              <button
                className="ml-3 px-3 py-1 text-md rounded hover:bg-gray-100 text-gray-700 relative flex items-center gap-2"
                onClick={async () => {
                  if (!currentProjectId) {
                    alert(
                      "Please open a project first to use task management."
                    );
                    setShowProjectManager(true);
                    return;
                  }
                  await fetchTasks();
                  await fetchCollaboratorNames();
                  setShowTaskManagement(true);
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Task Management
                {/* Red notification dot for pending tasks */}
                {tasks.filter((task) => task.status !== "done").length > 0 && (
                  <span className="absolute top-0 right-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-md ${
                historyIndex <= 0
                  ? "text-gray-300"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7v6h6"></path>
                <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-md ${
                historyIndex >= history.length - 1
                  ? "text-gray-300"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 7v6h-6"></path>
                <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"></path>
              </svg>
            </button>
            {/* Viewport Selector */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => {
                  setViewport("desktop");
                  const dims = viewportDimensions.desktop;
                  setCanvasWidth(dims.width);
                  setCanvasHeight(dims.height);
                }}
                className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                  viewport === "desktop"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Desktop View (1920x1080)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">Desktop</span>
              </button>
              <button
                onClick={() => {
                  setViewport("tablet");
                  const dims = viewportDimensions.tablet;
                  setCanvasWidth(dims.width);
                  setCanvasHeight(dims.height);
                }}
                className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                  viewport === "tablet"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Tablet View (768x1024)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">Tablet</span>
              </button>
              <button
                onClick={() => {
                  setViewport("mobile");
                  const dims = viewportDimensions.mobile;
                  setCanvasWidth(dims.width);
                  setCanvasHeight(dims.height);
                }}
                className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                  viewport === "mobile"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Mobile View (375x667)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">Mobile</span>
              </button>
            </div>
            <button
              className="ml-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 text-md font-medium flex items-center"
              onClick={() => {
                if (canEdit) setShowThemePanel(!showThemePanel);
              }}
              disabled={!canEdit}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
              </svg>
              Theme
            </button>
            <button
              className="ml-2 px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-md font-medium"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>

            {/* Add this to the header section, near the grid controls */}
            {/* <div className="flex items-center border-l border-gray-200 ml-4 pl-4">
              <span className="text-sm text-gray-600 mr-2">Canvas:</span>
              <select
                value="custom"
                onChange={(e) => {
                  if (e.target.value === "custom") return;
                  const [width, height] = e.target.value.split("x").map(Number);
                  setCanvasWidth(width);
                  setCanvasHeight(height);
                }}
                className="mr-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="custom">Custom</option>
                <option value="640x640">640×640 (Default)</option>
                <option value="1280x720">1280×720 (HD)</option>
                <option value="1920x1080">1920×1080 (Full HD)</option>
                <option value="375x667">375×667 (iPhone SE)</option>
                <option value="414x896">414×896 (iPhone XR)</option>
                <option value="360x800">360×800 (Android)</option>
              </select>
              <div className="flex items-center">
                <input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  min="200"
                  max="2000"
                />
                <span className="mx-1 text-gray-500">×</span>
                <input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  min="200"
                  max="2000"
                />
              </div>
            </div> */}

            <div className="flex items-center space-x-1 ml-4 border-l border-gray-200 pl-4">
              <button
                onClick={() => setGridEnabled(!gridEnabled)}
                className={`p-2 rounded-md text-gray-700 hover:bg-gray-100 ${
                  gridEnabled ? "bg-gray-100" : ""
                }`}
                title="Toggle Grid"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
              </button>

              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-2 rounded-md text-gray-700 hover:bg-gray-100 ${
                  snapToGrid ? "bg-gray-100" : ""
                }`}
                title="Toggle Snap to Grid"
              >
                {snapToGrid ? (
                  <Lock size={16} className="text-blue-500" />
                ) : (
                  <Unlock size={16} className="text-gray-800" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Components */}

          <div className=" w-[400px] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <FileExplorer
                projects={projects}
                currentProjectId={currentProjectId}
                currentTemplateId={currentTemplateId}
                onOpenProject={(projectId) => {
                  setCurrentProjectId(projectId);
                }}
                onOpenTemplate={(projectId, templateId) => {
                  openProjectTemplate(projectId, templateId);
                }}
                onCreateProject={async () => {
                  await createProject();
                  await refreshExplorer();
                }}
                onCreateTemplate={(projectId) => {
                  setWizardProjectId(projectId);
                  setShowTemplateWizard(true);
                }}
                onDeleteProject={async (projectId) => {
                  if (!confirm("Delete this project and all its templates?"))
                    return;
                  try {
                    await deleteDoc(doc(db, "projects", projectId));
                    await refreshExplorer();
                  } catch (err) {
                    console.error("Delete project error:", err);
                    alert("Failed to delete project.");
                  }
                }}
                onDeleteTemplate={async (projectId, templateId) => {
                  await deleteProjectTemplate(projectId, templateId);
                  await refreshExplorer();
                }}
                onRefresh={refreshExplorer}
              />
            </div>

            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <button
                className="flex items-center gap-2 font-medium text-gray-800 hover:text-gray-900"
                onClick={() => setComponentsCollapsed((v) => !v)}
                aria-expanded={!componentsCollapsed}
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    componentsCollapsed ? "-rotate-90" : "rotate-0"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                Components
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </div>
            {!componentsCollapsed && (
              <div className="overflow-y-auto p-3 flex-1" ref={leftSidebarRef}>
                <div className="grid grid-cols-2 gap-2">
                  {PALETTE.map((item) => (
                    <SidebarItem
                      key={item.label}
                      label={item.label}
                      title={item.title}
                      canvasWidth={canvasWidth}
                      canvasHeight={canvasHeight}
                      onInsert={(label, variant) =>
                        handleDropComponent(
                          { label, variant },
                          Math.max(
                            20,
                            (canvasWidth - (variant?.box?.[2] || 120)) / 2
                          ),
                          Math.max(
                            20,
                            (canvasHeight - (variant?.box?.[3] || 60)) / 2
                          )
                        )
                      }
                      handleDropComponent={handleDropComponent}
                      onMouseEnter={showPaletteHoverPreview}
                      onMouseLeave={hidePaletteHoverPreviewDelayed}
                    />
                  ))}
                </div>

                {hoveredPaletteItem &&
                  paletteHoverRect &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      onMouseEnter={() => {
                        if (paletteHoverTimeoutRef.current) {
                          clearTimeout(paletteHoverTimeoutRef.current);
                          paletteHoverTimeoutRef.current = null;
                        }
                      }}
                      onMouseLeave={() => hidePaletteHoverPreviewDelayed()}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        pointerEvents: "auto",
                        zIndex: 99999,
                      }}
                    >
                      {(() => {
                        const padding = 8;
                        const viewportW = window.innerWidth;
                        const viewportH = window.innerHeight;
                        const preferredW = 520;
                        const preferredH = 340;
                        let top = paletteHoverRect.top + window.scrollY;
                        let left =
                          paletteHoverRect.right + padding + window.scrollX;
                        if (left + preferredW > viewportW) {
                          left = Math.max(
                            padding,
                            paletteHoverRect.left -
                              preferredW -
                              padding +
                              window.scrollX
                          );
                        }
                        if (top + preferredH > viewportH + window.scrollY) {
                          top = Math.max(
                            padding,
                            viewportH + window.scrollY - preferredH - padding
                          );
                        }

                        const variants = hoveredPaletteItem.variants || [];

                        return (
                          <div
                            style={{
                              position: "fixed",
                              top,
                              left,
                              width: preferredW,
                              maxWidth: "min(95vw, 350px)",
                              background: "white",
                              borderRadius: 8,
                              boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                              border: "1px solid rgba(0,0,0,0.08)",
                              padding: 10,
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                              maxHeight: preferredH,
                              overflowY: "auto",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: "#1f2937",
                                  }}
                                >
                                  {hoveredPaletteItem.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                    marginTop: 2,
                                  }}
                                >
                                  {variants.length} variant
                                  {variants.length !== 1 ? "s" : ""} available •
                                  Click or drag to insert
                                </div>
                              </div>
                            </div>

                            {variants.length === 0 ? (
                              <div
                                style={{
                                  textAlign: "center",
                                  color: "#9ca3af",
                                  padding: 20,
                                }}
                              >
                                No variants available
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr",
                                  gap: 12,
                                }}
                              >
                                {variants.map((variant, idx) => {
                                  // Create a draggable variant component
                                  const VariantCard = ({ variant, index }) => {
                                    const [{ isDragging }, drag] = useDrag({
                                      type: "component",
                                      item: {
                                        label: hoveredPaletteItem.label,
                                        variant: variant,
                                      },
                                      collect: (monitor) => ({
                                        isDragging: !!monitor.isDragging(),
                                      }),
                                    });

                                    const vw = variant.box?.[2] || 200;
                                    const vh = variant.box?.[3] || 100;
                                    const maxPreviewW = 280;
                                    const maxPreviewH = 80;
                                    const scale = Math.min(
                                      1,
                                      maxPreviewW / vw,
                                      maxPreviewH / vh
                                    );

                                    return (
                                      <div
                                        ref={drag}
                                        style={{
                                          border: "1px solid #e5e7eb",
                                          borderRadius: 6,
                                          overflow: "hidden",
                                          background: "#f9fafb",
                                          cursor: isDragging
                                            ? "grabbing"
                                            : "grab",
                                          transition: "all 0.2s",
                                          opacity: isDragging ? 0.5 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isDragging) {
                                            e.currentTarget.style.boxShadow =
                                              "0 4px 12px rgba(0,0,0,0.1)";
                                            e.currentTarget.style.borderColor =
                                              "#3b82f6";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.boxShadow =
                                            "none";
                                          e.currentTarget.style.borderColor =
                                            "#e5e7eb";
                                        }}
                                        onClick={() => {
                                          handleDropComponent(
                                            {
                                              label: hoveredPaletteItem.label,
                                              variant,
                                            },
                                            Math.max(
                                              20,
                                              (canvasWidth - vw) / 2
                                            ),
                                            Math.max(
                                              20,
                                              (canvasHeight - vh) / 2
                                            )
                                          );
                                          setHoveredPaletteItem(null);
                                        }}
                                      >
                                        <div
                                          style={{
                                            height: maxPreviewH,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 6,
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: vw,
                                              height: vh,
                                              transform: `scale(${scale})`,
                                              transformOrigin: "center",
                                              pointerEvents: "none",
                                            }}
                                          >
                                            {renderComponent(
                                              {
                                                id: `preview-${index}`,
                                                label: hoveredPaletteItem.label,
                                                box: variant.box || [
                                                  0,
                                                  0,
                                                  vw,
                                                  vh,
                                                ],
                                                text: variant.text,
                                                imgUrl: variant.imgUrl,
                                                menuItems: variant.menuItems,
                                                ...(variant.styles || {}),
                                              },
                                              currentTheme
                                            )}
                                          </div>
                                        </div>
                                        <div
                                          style={{
                                            padding: "8px 12px",
                                            borderTop: "1px solid #e5e7eb",
                                            background: "white",
                                            fontSize: 11,
                                            color: "#374151",
                                            fontWeight: 500,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                          }}
                                        >
                                          <span>
                                            {variant.name ||
                                              `Variant ${index + 1}`}
                                          </span>
                                          <span style={{ color: "#9ca3af" }}>
                                            {vw}×{vh}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  };

                                  return (
                                    <VariantCard
                                      key={idx}
                                      variant={variant}
                                      index={idx}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>,
                    document.body
                  )}
              </div>
            )}
            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                  onClick={() => setLibCollapsed((v) => !v)}
                  aria-expanded={!libCollapsed}
                >
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      libCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  Project Components {/* ✅ Changed from "My Components" */}
                </button>
                <div className="text-xs text-gray-400">
                  {libraryComponents.length} saved
                </div>
              </div>

              {!libCollapsed && (
                <>
                  {!currentProjectId ? (
                    <div className="text-xs text-gray-400 p-2">
                      Open a project to access saved components
                    </div>
                  ) : libraryComponents.length === 0 ? (
                    <div className="text-xs text-gray-400">
                      No saved components in this project{" "}
                      {/* ✅ Updated text */}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {libraryComponents.map((lib) => {
                        const comp = lib.component || {};
                        const cardW = 160;
                        const cardH = 140;
                        const cw = comp.box?.[2] || cardW;
                        const ch = comp.box?.[3] || cardH;
                        const scale = Math.min(
                          1,
                          (cardW - 16) / cw,
                          (cardH - 60) / ch
                        );

                        return (
                          <div
                            key={lib.id}
                            className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Preview box - fixed size, centered content */}
                            <div
                              className="w-full h-[100px] bg-gray-50 border-b border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-100"
                              onClick={() => openLibModal(lib)}
                              onMouseEnter={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                showHoverPreview(lib, rect);
                              }}
                              onMouseLeave={() => hideHoverPreviewDelayed()}
                            >
                              <div
                                style={{
                                  width: cw,
                                  height: ch,
                                  transform: `scale(${scale})`,
                                  transformOrigin: "center",
                                  pointerEvents: "none",
                                  position: "relative",
                                }}
                              >
                                {renderComponent(
                                  { ...comp, box: comp.box || [0, 0, cw, ch] },
                                  currentTheme
                                )}
                              </div>
                            </div>

                            {/* Card footer with info and actions */}
                            <div className="p-2 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-medium text-gray-700 truncate flex-1">
                                  {lib.name}
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap ml-1">
                                  {new Date(
                                    lib.createdAt?.seconds
                                      ? lib.createdAt.seconds * 1000
                                      : lib.createdAt || Date.now()
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  className="flex-1 text-xs px-1.5 py-1 border border-gray-300 rounded hover:bg-blue-50 text-gray-700 font-medium"
                                  onClick={() => insertLibraryComponent(lib)}
                                  title="Insert into canvas"
                                >
                                  Insert
                                </button>
                                <button
                                  className="flex-1 text-xs px-1.5 py-1 border border-red-300 rounded hover:bg-red-50 text-red-600 font-medium"
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        `Delete "${lib.name}" from library?`
                                      )
                                    )
                                      return;
                                    await deleteLibraryComponent(lib.id);
                                  }}
                                  title="Delete from library"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hover popover preview (positioned to the right of hovered item) */}
                  {hoveredLib &&
                    hoverRect &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <div
                        onMouseEnter={() => {
                          if (hoverTimeoutRef.current) {
                            clearTimeout(hoverTimeoutRef.current);
                            hoverTimeoutRef.current = null;
                          }
                        }}
                        onMouseLeave={() => hideHoverPreviewDelayed()}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          pointerEvents: "auto",
                          zIndex: 99999,
                        }}
                      >
                        {(() => {
                          const padding = 8;
                          const viewportW = window.innerWidth;
                          const viewportH = window.innerHeight;
                          const preferredW = 420;
                          const preferredH = 280;
                          let top = hoverRect.top + window.scrollY;
                          let left = hoverRect.right + padding + window.scrollX;
                          if (left + preferredW > viewportW) {
                            left = Math.max(
                              padding,
                              hoverRect.left -
                                preferredW -
                                padding +
                                window.scrollX
                            );
                          }
                          if (top + preferredH > viewportH + window.scrollY) {
                            top = Math.max(
                              padding,
                              viewportH + window.scrollY - preferredH - padding
                            );
                          }

                          const comp = hoveredLib.component || {};
                          const vw = Math.min(
                            preferredW - 24,
                            comp.box?.[2] || 360
                          );
                          const vh = Math.min(
                            preferredH - 80,
                            comp.box?.[3] || 220
                          );

                          return (
                            <div
                              style={{
                                position: "fixed",
                                top,
                                left,
                                width: preferredW,
                                maxWidth: "min(95vw, 420px)",
                                height: preferredH,
                                background: "white",
                                borderRadius: 8,
                                boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                                border: "1px solid rgba(0,0,0,0.08)",
                                padding: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "#1f2937",
                                  }}
                                >
                                  {hoveredLib.name}
                                </div>
                                <button
                                  onClick={() => {
                                    insertLibraryComponent(hoveredLib);
                                    setHoveredLib(null);
                                  }}
                                  style={{
                                    fontSize: 12,
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                  }}
                                >
                                  Insert
                                </button>
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  borderRadius: 6,
                                  background: "#f9fafb",
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <div style={{ width: vw, height: vh }}>
                                  {renderComponent(
                                    {
                                      ...comp,
                                      box: comp.box || [0, 0, vw, vh],
                                    },
                                    currentTheme
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>,
                      document.body
                    )}
                </>
              )}
            </div>

            {/* Icon Assets */}
            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                  onClick={() => setAssetsCollapsed((v) => !v)}
                  aria-expanded={!assetsCollapsed}
                >
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      assetsCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  Project Assets {/* ✅ Changed from "Icon Assets" */}
                </button>
                <div className="text-xs text-gray-400">
                  {BUILT_IN_ICONS.length + assets.length} total
                </div>
              </div>

              {!assetsCollapsed && (
                <>
                  {!currentProjectId ? (
                    <div className="text-xs text-gray-400 p-2">
                      Open a project to access assets
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-2">
                          Built-in icons
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {BUILT_IN_ICONS.map((ic) => (
                            <BuiltInIconItem
                              key={ic.id}
                              icon={ic}
                              onInsert={(payload) =>
                                handleDropComponent(
                                  {
                                    label: "icon",
                                    iconKey: ic.id,
                                    variant: { box: [0, 0, 48, 48] },
                                  },
                                  Math.max(20, (canvasWidth - 48) / 2),
                                  Math.max(20, (canvasHeight - 48) / 2)
                                )
                              }
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center px-2 py-1 border rounded bg-white hover:bg-gray-50">
                            <input
                              type="file"
                              accept="image/*,svg"
                              className="hidden"
                              onChange={(e) => uploadAsset(e.target.files?.[0])}
                            />
                            <span className="text-sm">
                              {uploadingAsset ? "Uploading..." : "Upload"}
                            </span>
                          </label>
                          <div className="text-xs text-gray-400">
                            Project-wide • Available in all templates{" "}
                            {/* ✅ Added hint */}
                          </div>
                        </div>
                      </div>
                      {assets.length === 0 ? (
                        <div className="text-xs text-gray-400">
                          No custom assets in this project{" "}
                          {/* ✅ Updated text */}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {assets.map((a) => (
                            <AssetItem
                              key={a.id}
                              asset={a}
                              onInsert={(payload) =>
                                handleDropComponent(
                                  payload,
                                  Math.max(20, (canvasWidth - 48) / 2),
                                  Math.max(20, (canvasHeight - 48) / 2)
                                )
                              }
                              onDelete={deleteAsset}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 flex flex-col bg-gray-100 overflow-auto">
            {!currentProjectId || !currentTemplateId ? (
              // Show welcome screen when no project/template is open
              <WelcomeScreen
                projects={projects}
                openProjectFromWelcome={openProjectFromWelcome}
                onOpenProject={(projectId) => {
                  if (projectId) {
                    // If specific project ID provided, open it directly
                    openProjectFromWelcome(projectId);
                  } else {
                    // Otherwise show project manager
                    setShowProjectManager(true);
                  }
                }}
                onCreateProject={async () => {
                  const projectId = await createProject();
                  if (projectId) {
                    await refreshExplorer();
                  }
                }}
              />
            ) : (
              // Show canvas when project/template is open
              <div className="p-4 flex justify-center items-start min-h-full z-20">
                <Canvas
                  components={components}
                  onComponentChange={handleComponentChange}
                  onComponentSelect={setSelectedComponentId}
                  onDropComponent={handleDropComponent}
                  selectedComponentId={selectedComponentId}
                  gridEnabled={gridEnabled}
                  gridSize={gridSize}
                  snapToGrid={snapToGrid}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  currentTheme={currentTheme}
                  canEdit={currentUserRole !== "viewer"}
                  comments={comments}
                  templateId={currentTemplateId}
                  currentProjectId={currentProjectId}
                  resolveUserName={resolveUserName}
                  fetchComments={fetchComments}
                  db={db}
                  focusComponentId={selectedComponentId}
                  pinMode={pinMode}
                  onPlacePin={handlePlacePinRequest}
                  tempPin={tempPin}
                  clearTempPin={clearTempPin}
                  initialOpenComponentId={initialOpenPinId}
                  openSignal={commentOpenSignal}
                  availableUsers={availableUsers}
                  resolveNameToUid={resolveNameToUid}
                  hideAllComments={hideAllComments}
                  viewport={viewport}
                  updateCursorPosition={updateCursorPosition}
                  cursors={cursors} // ✅ Add this
                  collabMode={collabMode} // ✅ Add this
                  containerRef={containerRef}
                  showPresencePanel={showPresencePanel}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Properties */}
          <div className="w-[450px] bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <h2 className="font-medium text-gray-800">Properties</h2>
            </div>
            <EditSidebar
              selectedComponent={selectedComponent}
              onUpdateComponent={
                currentUserRole === "viewer" ? () => {} : handleUpdateComponent
              }
              sidebarRef={rightSidebarRef}
              components={components}
              onUpdateLayers={
                currentUserRole === "viewer" ? () => {} : updateLayers
              }
              onSelectComponent={
                currentUserRole === "viewer" ? () => {} : setSelectedComponentId
              }
              saveComponentToLibrary={saveComponentToLibrary}
              userTemplates={userTemplates}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t border-gray-200 py-1 px-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Canvas: {canvasWidth}×{canvasHeight}
          </div>
          <div>{components.length} components</div>
        </div>
      </div>
      {/* Theme Settings Panel */}
      {showThemePanel && (
        <ThemePanel
          theme={currentTheme}
          onThemeChange={handleThemeChange}
          onClose={() => setShowThemePanel(false)}
        />
      )}
      {showPreview && (
        <PreviewModal
          componentsByViewport={componentsByViewport}
          currentTheme={currentTheme}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showProjectManager && (
        <ProjectManager
          onClose={() => setShowProjectManager(false)}
          projects={projects}
          setProjects={setProjects}
          currentProjectId={currentProjectId}
          setCurrentProjectId={setCurrentProjectId}
          fetchUserProjects={fetchUserProjects}
          createProject={createProject}
          openProjectFromWelcome={openProjectFromWelcome}
        />
      )}
      {showTemplateWizard && wizardProjectId && (
        <NewTemplateWizard
          projectId={wizardProjectId}
          currentTheme={currentTheme}
          onClose={() => {
            setShowTemplateWizard(false);
            setWizardProjectId(null);
          }}
          onComplete={async (templateId, templateData, detectedViewport) => {
            // Open the newly created template
            setCurrentTemplateId(templateId);
            setCurrentProjectId(wizardProjectId);
            setComponentsByViewport(templateData.componentsByViewport);
            setCurrentTheme(templateData.theme);
            setCanvasWidth(templateData.canvasWidth);
            setCanvasHeight(templateData.canvasHeight);

            // Set the viewport to the detected one
            if (detectedViewport) {
              setViewport(detectedViewport);
            }

            // Refresh explorer to show new template
            await refreshExplorer();
          }}
        />
      )}
      {showVersionHistory && currentTemplateId && (
        <VersionHistoryModal
          templateId={currentTemplateId}
          templateName={
            projectTemplates.find((t) => t.id === currentTemplateId)?.name ||
            "Unnamed Template"
          }
          onClose={() => setShowVersionHistory(false)}
          onRestore={async () => {
            // Refresh the UI after restore
            await fetchComments();
            await fetchTasks();
          }}
          fetchVersionHistory={fetchVersionHistory} // Pass the function
          restoreVersion={restoreVersion}
          compareVersions={compareVersions}
        />
      )}

      {/* Collaboration UI */}
      {collabMode && showPresencePanel && collaborators.length > 0 && (
        <PresencePanel
          collaborators={collaborators}
          onClose={() => setShowPresencePanel(false)}
        />
      )}

      {/* Change History Modal */}
      {showChangeHistory && (
        <ChangeHistoryModal
          onClose={() => setShowChangeHistory(false)}
          fetchChangeHistory={fetchChangeHistory}
        />
      )}

      {/* Conflict Resolution Modal */}
      {conflictData && (
        <ConflictModal
          conflict={conflictData}
          onResolve={() => setConflictData(null)}
          onCancel={() => {
            setConflictData(null);
            // Revert to last saved state
            if (historyIndex > 0) {
              handleUndo();
            }
          }}
        />
      )}
    </DndProvider>
  );
};

export default Test;
