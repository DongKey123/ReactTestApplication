import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MemoContext = createContext();

const STORAGE_KEYS = {
  MEMOS: "@jot_memos",
  FOLDERS: "@jot_folders",
  RECENT_SEARCHES: "@jot_recent_searches",
};

const MAX_RECENT_SEARCHES = 10;

const DEFAULT_FOLDERS = [
  { id: "default", name: "전체", color: "#1B5E3C" },
  { id: "work", name: "업무", color: "#2563EB" },
  { id: "personal", name: "개인", color: "#DC2626" },
];

export function MemoProvider({ children }) {
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  // memos 변경 시 저장
  useEffect(() => {
    if (!isLoading) {
      saveMemos(memos);
    }
  }, [memos, isLoading]);

  // folders 변경 시 저장
  useEffect(() => {
    if (!isLoading) {
      saveFolders(folders);
    }
  }, [folders, isLoading]);

  const loadData = async () => {
    try {
      const [memosData, foldersData, searchesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MEMOS),
        AsyncStorage.getItem(STORAGE_KEYS.FOLDERS),
        AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
      ]);

      if (memosData) {
        setMemos(JSON.parse(memosData));
      }
      if (foldersData) {
        setFolders(JSON.parse(foldersData));
      }
      if (searchesData) {
        setRecentSearches(JSON.parse(searchesData));
      }
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMemos = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(data));
    } catch (error) {
      console.error("메모 저장 실패:", error);
    }
  };

  const saveFolders = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(data));
    } catch (error) {
      console.error("폴더 저장 실패:", error);
    }
  };

  const addMemo = (title, content, folderId = "default", memoDate = null, checklist = [], links = [], images = []) => {
    const newMemo = {
      id: Date.now().toString(),
      title,
      content,
      folderId,
      createdAt: memoDate || new Date().toISOString(),
      checklist,
      links,
      images,
      bookmarked: false,
    };
    setMemos([newMemo, ...memos]);
  };

  const toggleBookmark = (id) => {
    setMemos(
      memos.map((memo) =>
        memo.id === id ? { ...memo, bookmarked: !memo.bookmarked } : memo
      )
    );
  };

  const getBookmarkedMemos = () => {
    return memos.filter((memo) => memo.bookmarked);
  };

  const deleteMemo = (id) => {
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  const updateMemo = (id, title, content, folderId, memoDate, checklist = null, links = null, images = null) => {
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
              links: links !== null ? links : memo.links || [],
              images: images !== null ? images : memo.images || [],
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

  // 최근 검색어 추가
  const addRecentSearch = async (searchText) => {
    if (!searchText.trim()) return;

    const trimmed = searchText.trim();
    // 중복 제거 후 맨 앞에 추가
    const filtered = recentSearches.filter((s) => s !== trimmed);
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch (error) {
      console.error("검색어 저장 실패:", error);
    }
  };

  // 최근 검색어 삭제
  const removeRecentSearch = async (searchText) => {
    const updated = recentSearches.filter((s) => s !== searchText);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch (error) {
      console.error("검색어 삭제 실패:", error);
    }
  };

  // 최근 검색어 전체 삭제
  const clearRecentSearches = async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (error) {
      console.error("검색어 전체 삭제 실패:", error);
    }
  };

  return (
    <MemoContext.Provider
      value={{
        memos,
        folders,
        recentSearches,
        isLoading,
        addMemo,
        deleteMemo,
        updateMemo,
        toggleBookmark,
        getBookmarkedMemos,
        addFolder,
        updateFolder,
        deleteFolder,
        reorderFolders,
        getMemosByFolder,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
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
