import React from "react";

const Message = ({ message, reserveSpace = false }) => {
  if (!message?.text && !reserveSpace) return null;

  return <div className={`message ${message?.type || "placeholder"}`}>{message?.text || "\u00A0"}</div>;
};

export default Message;