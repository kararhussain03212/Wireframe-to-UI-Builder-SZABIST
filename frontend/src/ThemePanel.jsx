import React, { useState, useEffect } from "react";
import SaveThemeDialog from "./SaveThemeDialog";

const ThemePanel = ({ theme, onThemeChange, onClose }) => {
  const [activeSection, setActiveSection] = useState("general"); // "general", "components"
  const [savedThemes, setSavedThemes] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load saved themes on mount
  useEffect(() => {
    const themes = localStorage.getItem("uibuilder_saved_themes");
    if (themes) {
      try {
        setSavedThemes(JSON.parse(themes));
      } catch (e) {
        console.error("Error loading saved themes:", e);
      }
    }
  }, []);
  const predefinedThemes = [
    {
      name: "Default",
      colors: {
        neutral: "#1f2937", // dark blue-gray for nav/footer/button
        background: "#ffffff", // white background
        text: "#ffffff", // white text for nav/footer/button
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
            background: "#3b82f6", // blue button (like your screenshot)
            textColor: "#ffffff",
            borderRadius: 4,
          },
        },
      },
    },
    {
      name: "Light",
      colors: {
        neutral: "#1f2937",
        text: "#111827",
      },
    },
    {
      name: "Dark",
      colors: {
        neutral: "#d1d5db",
        text: "#f9fafb",
      },
    },
    {
      name: "Pastel",
      colors: {
        neutral: "#9ca3af",
        text: "#4b5563",
      },
    },
  ];
  // Add component-specific theme defaults
  const componentDefaults = {
    nav: {
      background:
        theme.colors?.componentSpecific?.nav?.background ||
        theme.colors.neutral,
      textColor: theme.colors?.componentSpecific?.nav?.textColor || "#ffffff",
    },
    footer: {
      background:
        theme.colors?.componentSpecific?.footer?.background ||
        theme.colors.neutral,
      textColor:
        theme.colors?.componentSpecific?.footer?.textColor || "#ffffff",
    },
    button: {
      background:
        theme.colors?.componentSpecific?.button?.background ||
        theme.colors.primary,
      textColor:
        theme.colors?.componentSpecific?.button?.textColor || "#ffffff",
      borderRadius:
        theme.spacing?.componentSpecific?.button?.borderRadius ||
        theme.spacing.borderRadius,
    },
    heading: {
      textColor:
        theme.colors?.componentSpecific?.heading?.textColor ||
        theme.colors.text,
      fontSize:
        theme.typography?.componentSpecific?.heading?.fontSize ||
        theme.typography.baseFontSize * 1.5,
    },
  };
  const updateComponentTheme = (componentType, property, value) => {
    const updatedTheme = { ...theme };

    if (!updatedTheme.colors.componentSpecific) {
      updatedTheme.colors.componentSpecific = {};
    }

    if (!updatedTheme.colors.componentSpecific[componentType]) {
      updatedTheme.colors.componentSpecific[componentType] = {};
    }

    updatedTheme.colors.componentSpecific[componentType][property] = value;
    onThemeChange(updatedTheme);
  };
  // Add save theme functionality
  const handleSaveTheme = (themeName) => {
    const newTheme = {
      name: themeName,
      theme: { ...theme }, // Make a deep copy
    };

    const updatedThemes = [...savedThemes, newTheme];
    setSavedThemes(updatedThemes);
    localStorage.setItem(
      "uibuilder_saved_themes",
      JSON.stringify(updatedThemes)
    );
  };

  // Add load theme functionality
  const handleLoadTheme = (themeToLoad) => {
    onThemeChange(themeToLoad);
  };

  // Add delete theme functionality
  const handleDeleteTheme = (themeName) => {
    const updatedThemes = savedThemes.filter((t) => t.name !== themeName);
    setSavedThemes(updatedThemes);
    localStorage.setItem(
      "uibuilder_saved_themes",
      JSON.stringify(updatedThemes)
    );
  };

  return (
    <div className="absolute top-16 right-4 bg-white rounded-lg shadow-xl border border-gray-200 w-[500px]  z-50 ">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-medium text-gray-800">Theme Settings</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="p-4 max-h-[800px] overflow-y-auto">
        <>
          {/* Predefined Themes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Predefined Themes
            </h3>
            <div className="flex space-x-2">
              {predefinedThemes.map((presetTheme) => (
                <button
                  key={presetTheme.name}
                  onClick={() =>
                    onThemeChange({
                      ...theme,
                      colors: presetTheme.colors,
                    })
                  }
                  className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                >
                  {presetTheme.name}
                </button>
              ))}
            </div>
          </div>
          {/* Add this new section for saved themes */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Your Saved Themes
              </h3>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
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
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Current
              </button>
            </div>

            {savedThemes.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No saved themes yet
              </p>
            ) : (
              <div className="space-y-2">
                {savedThemes.map((savedTheme) => (
                  <div
                    key={savedTheme.name}
                    className="flex items-center justify-between border border-gray-200 p-2 rounded-md"
                  >
                    <span className="text-sm font-medium">
                      {savedTheme.name}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLoadTheme(savedTheme.theme)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => handleDeleteTheme(savedTheme.name)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Color Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Colors
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(theme.colors)
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-500 mb-1.5 capitalize">
                      {key}
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => {
                            onThemeChange({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                [key]: e.target.value,
                              },
                            });
                          }}
                          className="sr-only"
                          id={`theme-color-${key}`}
                        />
                        <label
                          htmlFor={`theme-color-${key}`}
                          className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                          style={{ backgroundColor: value }}
                        ></label>
                      </div>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          onThemeChange({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              [key]: e.target.value,
                            },
                          });
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="space-y-6">
            {/* Navigation Component */}
            <div className="p-3 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700 mb-3">Navigation Bar</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={componentDefaults.nav.background}
                        onChange={(e) =>
                          updateComponentTheme(
                            "nav",
                            "background",
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id="nav-bg-color"
                      />
                      <label
                        htmlFor="nav-bg-color"
                        className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: componentDefaults.nav.background,
                        }}
                      ></label>
                    </div>
                    <input
                      type="text"
                      value={componentDefaults.nav.background}
                      onChange={(e) =>
                        updateComponentTheme(
                          "nav",
                          "background",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={componentDefaults.nav.textColor}
                        onChange={(e) =>
                          updateComponentTheme(
                            "nav",
                            "textColor",
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id="nav-text-color"
                      />
                      <label
                        htmlFor="nav-text-color"
                        className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: componentDefaults.nav.textColor,
                        }}
                      ></label>
                    </div>
                    <input
                      type="text"
                      value={componentDefaults.nav.textColor}
                      onChange={(e) =>
                        updateComponentTheme("nav", "textColor", e.target.value)
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Component */}
            <div className="p-3 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700 mb-3">Footer</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={componentDefaults.footer.background}
                        onChange={(e) =>
                          updateComponentTheme(
                            "footer",
                            "background",
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id="footer-bg-color"
                      />
                      <label
                        htmlFor="footer-bg-color"
                        className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: componentDefaults.footer.background,
                        }}
                      ></label>
                    </div>
                    <input
                      type="text"
                      value={componentDefaults.footer.background}
                      onChange={(e) =>
                        updateComponentTheme(
                          "footer",
                          "background",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={componentDefaults.footer.textColor}
                        onChange={(e) =>
                          updateComponentTheme(
                            "footer",
                            "textColor",
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id="footer-text-color"
                      />
                      <label
                        htmlFor="footer-text-color"
                        className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: componentDefaults.footer.textColor,
                        }}
                      ></label>
                    </div>
                    <input
                      type="text"
                      value={componentDefaults.footer.textColor}
                      onChange={(e) =>
                        updateComponentTheme(
                          "footer",
                          "textColor",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Button Component */}
            <div className="p-3 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700 mb-3">Button</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={componentDefaults.button.background}
                        onChange={(e) =>
                          updateComponentTheme(
                            "button",
                            "background",
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id="button-bg-color"
                      />
                      <label
                        htmlFor="button-bg-color"
                        className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: componentDefaults.button.background,
                        }}
                      ></label>
                    </div>
                    <input
                      type="text"
                      value={componentDefaults.button.background}
                      onChange={(e) =>
                        updateComponentTheme(
                          "button",
                          "background",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={componentDefaults.button.textColor}
                        onChange={(e) =>
                          updateComponentTheme(
                            "button",
                            "textColor",
                            e.target.value
                          )
                        }
                        className="sr-only"
                        id="button-text-color"
                      />
                      <label
                        htmlFor="button-text-color"
                        className="block w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: componentDefaults.button.textColor,
                        }}
                      ></label>
                    </div>
                    <input
                      type="text"
                      value={componentDefaults.button.textColor}
                      onChange={(e) =>
                        updateComponentTheme(
                          "button",
                          "textColor",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Typography Settings */}
          <div className="mb-6 mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Typography
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Font Family
                </label>
                <select
                  value={theme.typography.headingFont}
                  onChange={(e) => {
                    onThemeChange({
                      ...theme,
                      typography: {
                        ...theme.typography,
                        headingFont: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="sans-serif">Sans-serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">
                    Times New Roman
                  </option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Trebuchet MS', sans-serif">
                    Trebuchet MS
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Base Font Size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={theme.typography.baseFontSize}
                    onChange={(e) => {
                      onThemeChange({
                        ...theme,
                        typography: {
                          ...theme.typography,
                          baseFontSize: Number(e.target.value),
                        },
                      });
                    }}
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={theme.typography.baseFontSize}
                      onChange={(e) => {
                        onThemeChange({
                          ...theme,
                          typography: {
                            ...theme.typography,
                            baseFontSize: Number(e.target.value),
                          },
                        });
                      }}
                      className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                      min="12"
                      max="24"
                    />
                    <span className="ml-1">px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Border & Shadow Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Borders & Shadows
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Default Border Radius
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={theme.spacing.borderRadius}
                    onChange={(e) => {
                      onThemeChange({
                        ...theme,
                        spacing: {
                          ...theme.spacing,
                          borderRadius: Number(e.target.value),
                        },
                      });
                    }}
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={theme.spacing.borderRadius}
                      onChange={(e) => {
                        onThemeChange({
                          ...theme,
                          spacing: {
                            ...theme.spacing,
                            borderRadius: Number(e.target.value),
                          },
                        });
                      }}
                      className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                      min="0"
                      max="20"
                    />
                    <span className="ml-1">px</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Shadow Presets
                </label>
                <select
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  onChange={(e) => {
                    let shadowValue = e.target.value;
                    onThemeChange({
                      ...theme,
                      shadows: {
                        ...theme.shadows,
                        default: shadowValue,
                      },
                    });
                  }}
                >
                  <option value="none">None</option>
                  <option value="0 1px 3px rgba(0,0,0,0.1)">Small</option>
                  <option value="0 4px 6px -1px rgba(0,0,0,0.1)">Medium</option>
                  <option value="0 10px 15px -3px rgba(0,0,0,0.1)">
                    Large
                  </option>
                  <option value="0 20px 25px -5px rgba(0,0,0,0.1)">
                    Extra Large
                  </option>
                </select>
                <div
                  className="mt-2 p-4 border border-gray-200 rounded-md"
                  style={{
                    boxShadow: theme.shadows.default,
                  }}
                >
                  Preview shadow
                </div>
              </div>
            </div>
          </div>
        </>
      </div>

      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={() =>
            onThemeChange({
              colors: {
                neutral: "#1f2937",
                text: "#111827",
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
                default: "0 1px 3px rgba(0,0,0,0.1)",
              },
            })
          }
          className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={() => {
            localStorage.setItem("uibuilder_theme", JSON.stringify(theme));
            onClose();
          }}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Apply
        </button>
      </div>
      {/* Save Theme Dialog */}
      {showSaveDialog && (
        <SaveThemeDialog
          theme={theme}
          onClose={() => setShowSaveDialog(false)}
          onSave={handleSaveTheme}
        />
      )}
    </div>
  );
};
export default ThemePanel;
