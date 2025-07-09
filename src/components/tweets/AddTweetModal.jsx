import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const AddTweetModal = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim() === "") return;
    onSubmit(content);
    setContent("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add a Tweet</h2>
            <textarea
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Post Tweet
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTweetModal;
