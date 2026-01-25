import React, { createContext, useState, useContext } from "react";

const MemoContext = createContext();

export function MemoProvider({ children }) {
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState([
    { id: "default", name: "전체", color: "#1B5E3C" },
    { id: "work", name: "업무", color: "#2563EB" },
    { id: "personal", name: "개인", color: "#DC2626" },
  ]);

  const addMemo = (title, content, folderId = "default", memoDate = null, checklist = []) => {
    const newMemo = {
      id: Date.now().toString(),
      title,
      content,
      folderId,
      createdAt: memoDate || new Date().toISOString(),
      checklist,
    };
    setMemos([newMemo, ...memos]);
  };

  const deleteMemo = (id) => {
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  const updateMemo = (id, title, content, folderId, memoDate, checklist = null) => {
    setMemos(
      memos.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              title,
              content,
              folderId,
              createdAt: memoDate || memo.createdAt,
              updatedAt: new Date().toISOString(),
              checklist: checklist !== null ? checklist : memo.checklist,
            }
          : memo
      )
    );
  };

  const addFolder = (name, color) => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      color,
    };
    setFolders([...folders, newFolder]);
  };

  const updateFolder = (id, name, color) => {
    if (id === "default" || id === "work" || id === "personal") {
      // 기본 폴더는 색상만 변경 가능
      setFolders(
        folders.map((folder) =>
          folder.id === id ? { ...folder, color } : folder
        )
      );
    } else {
      // 사용자 생성 폴더는 이름과 색상 모두 변경 가능
      setFolders(
        folders.map((folder) =>
          folder.id === id ? { ...folder, name, color } : folder
        )
      );
    }
  };

  const deleteFolder = (id) => {
    if (id === "default" || id === "work" || id === "personal") return; // 기본 폴더는 삭제 불가
    setFolders(folders.filter((folder) => folder.id !== id));
    // 해당 폴더의 메모들을 기본 폴더로 이동
    setMemos(
      memos.map((memo) =>
        memo.folderId === id ? { ...memo, folderId: "default" } : memo
      )
    );
  };

  const reorderFolders = (newFolders) => {
    setFolders(newFolders);
  };

  const getMemosByFolder = (folderId) => {
    if (folderId === "default") return memos;
    return memos.filter((memo) => memo.folderId === folderId);
  };

  return (
    <MemoContext.Provider
      value={{
        memos,
        folders,
        addMemo,
        deleteMemo,
        updateMemo,
        addFolder,
        updateFolder,
        deleteFolder,
        reorderFolders,
        getMemosByFolder,
      }}
    >
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
