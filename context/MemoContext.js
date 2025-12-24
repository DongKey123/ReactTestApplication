import React, { createContext, useState, useContext } from "react";

const MemoContext = createContext();

export function MemoProvider({ children }) {
  const [memos, setMemos] = useState([]);

  const addMemo = (title, content) => {
    const newMemo = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    setMemos([newMemo, ...memos]);
  };

  const deleteMemo = (id) => {
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <MemoContext.Provider value={{ memos, addMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
}

export function useMemos() {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("useMemos must be used within a MemoProvider");
  }
  return context;
}
