// MessageBubble.js
import React from "react";

export default function MessageBubble({ role, content, isTyping, colors }) {
  const bubbleColor = role === "bot" ? colors.bot : colors.user;
  const textColor = colors.text;

  return (
    <div
      style={{ backgroundColor: bubbleColor, color: textColor }}
      className={`max-w-xs px-4 py-2 rounded-2xl break-words ${
        role === "bot" ? "rounded-bl-none" : "rounded-br-none"
      } animate-bubble-pop`}
    >
      {isTyping ? <TypingAnimation /> : content}
    </div>
  );
}

function TypingAnimation() {
  return (
    <div className="flex space-x-1">
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce200"></span>
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce400"></span>
    </div>
  );
}
