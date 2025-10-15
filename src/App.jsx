import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { callLLM } from "./callLLM";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog } from "@headlessui/react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameIndex, setRenameIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const scrollRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    const newChat = { title: `Chat ${chats.length + 1}`, messages: [] };
    const updated = [...chats, newChat];
    setChats(updated);
    setActiveChat(updated.length - 1);
    setMessages([]);
    toast.success("🆕 New chat started!");
  };

  const loadChat = (index) => {
    setActiveChat(index);
    setMessages(chats[index].messages || []);
  };

  const confirmDeleteChat = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    const updated = chats.filter((_, i) => i !== deleteIndex);
    setChats(updated);
    if (activeChat === deleteIndex) {
      setActiveChat(null);
      setMessages([]);
    } else if (activeChat > deleteIndex) setActiveChat(activeChat - 1);
    toast.info("🗑 Chat deleted");
    setShowDeleteModal(false);
  };

  const confirmRenameChat = (index) => {
    setRenameIndex(index);
    setNewTitle(chats[index].title);
    setShowRenameModal(true);
  };

  const copyChat = (index) => {
    const chatText = chats[index].messages
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");
    navigator.clipboard.writeText(chatText);
    toast.success("📋 Chat copied!");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (activeChat === null) {
      toast.error("Please start a new chat first!");
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg, { role: "bot", content: "", isTyping: true }]);
    setInput("");

    try {
      const latestMessages = [...messages, userMsg];

      // Build context from previous messages
      const contextUsed = latestMessages.map((m) => m.content).join(" ");

      let reply = await callLLM(latestMessages);
      reply = reply.replace(/^assistant\s*/i, "").trim();

      // Update typing bubble
      setMessages((prev) => {
        const newMessages = [...prev];
        const typingIndex = newMessages.findIndex((m) => m.isTyping);
        if (typingIndex !== -1) newMessages[typingIndex] = { role: "bot", content: reply };
        return newMessages;
      });

      // Save AI reply to active chat
      setChats((prevChats) =>
        prevChats.map((chat, i) =>
          i === activeChat
            ? { ...chat, messages: [...chat.messages, userMsg, { role: "bot", content: reply }] }
            : chat
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const newMessages = [...prev];
        const typingIndex = newMessages.findIndex((m) => m.isTyping);
        if (typingIndex !== -1) {
          newMessages[typingIndex] = {
            role: "bot",
            content: "⚠️ Something went wrong. Try again.",
          };
        }
        return newMessages;
      });
    }
  };

  return (
    <div className="chat-container flex h-screen relative bg-white text-gray-900">
      {/* Sidebar */}
      {sidebarVisible && (
        <aside className="w-72 flex flex-col border-r bg-gray-50 transition-all duration-300">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">DavidGPT</h2>
            <button
              onClick={startNewChat}
              className="px-3 py-1 rounded-md font-bold bg-green-500 text-white hover:bg-green-600 transition"
            >
              + New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chats.length === 0 ? (
              <p className="text-gray-500 text-sm">No chats yet</p>
            ) : (
              chats.map((chat, idx) => (
                <div key={idx} className="flex items-center justify-between space-x-2">
                  <button
                    onClick={() => loadChat(idx)}
                    className={`flex-1 text-left px-3 py-2 rounded-md font-medium text-sm transition ${
                      activeChat === idx ? "bg-green-500 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {chat.title}
                  </button>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        confirmRenameChat(idx);
                      }}
                      className="px-3 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyChat(idx);
                      }}
                      className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                      💾
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        confirmDeleteChat(idx);
                      }}
                      className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="absolute top-4 left-4 z-50 px-3 py-1 rounded-md font-bold text-white bg-green-500 hover:bg-green-600"
      >
        {sidebarVisible ? "Hide" : "Show"} Sidebar
      </button>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        <header className="p-4 border-b">
          <h1 className="text-lg font-bold text-center">
            {activeChat !== null ? chats[activeChat]?.title : "Welcome to DavidGPT"}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <h2 className="text-3xl font-bold mb-2 text-green-500">DavidGPT</h2>
              <p className="text-sm">Start a new chat or select one from the sidebar.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex mb-4 ${m.role === "bot" ? "justify-start" : "justify-end"}`}
              >
                <MessageBubble
                  role={m.role}
                  content={m.content}
                  isTyping={m.isTyping}
                  colors={{ bot: "#e6f4ea", user: "#f5f5f5", text: "#111" }}
                />
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </main>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t p-4 bg-gray-50">
          <div className="flex items-center rounded-2xl p-2 bg-white border">
            <input
              type="text"
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-sm text-gray-900"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Delete Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white rounded-lg p-6 z-50 max-w-sm mx-auto shadow-lg text-gray-900">
          <h3 className="text-lg font-bold mb-4">Delete Chat?</h3>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-md font-bold text-gray-700 border"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              className="px-4 py-2 rounded-md font-bold text-white bg-red-500 hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>

      {/* Rename Modal */}
      <Dialog
        open={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white rounded-lg p-6 z-50 max-w-sm mx-auto shadow-lg text-gray-900">
          <h3 className="text-lg font-bold mb-4">Rename Chat</h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowRenameModal(false)}
              className="px-4 py-2 rounded-md font-bold text-gray-700 border"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!newTitle.trim()) return;
                const updated = chats.map((chat, i) =>
                  i === renameIndex ? { ...chat, title: newTitle } : chat
                );
                setChats(updated);
                toast.success("Chat renamed");
                setShowRenameModal(false);
              }}
              className="px-4 py-2 rounded-md font-bold text-white bg-green-600 hover:bg-green-700"
            >
              Rename
            </button>
          </div>
        </div>
      </Dialog>

      <ToastContainer />
    </div>
  );
}
