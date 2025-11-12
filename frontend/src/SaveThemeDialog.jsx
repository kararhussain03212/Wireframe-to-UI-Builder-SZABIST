const SaveThemeDialog = ({ theme, onClose, onSave }) => {
  const [themeName, setThemeName] = useState("");

  const handleSave = () => {
    if (!themeName.trim()) return;
    onSave(themeName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-lg font-medium mb-4">Save Theme</h3>
        <input
          type="text"
          placeholder="Theme name"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={!themeName.trim()}
          >
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
};
export default SaveThemeDialog;