import React from "react";

interface ArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const Archive: React.FC<ArchiveProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Archive Activity", 
  message = "Are you sure you want to archive this activity?" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm my-3 text-gray-300">{message}</p>
        <div className="d-flex align-items-center space-x-3 mt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-500 transition shadow"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default Archive;
