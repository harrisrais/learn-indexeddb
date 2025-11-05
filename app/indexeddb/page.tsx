"use client";

import { useEffect, useState } from "react";

export default function IndexedDBDemo() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // Open or create IndexedDB
  useEffect(() => {
    const request = indexedDB.open("MyIndexedDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      setDb(db);
      loadItems(db);
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
    };
  }, []);

  // Load saved items
  const loadItems = (database: IDBDatabase) => {
    const transaction = database.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const request = store.getAll();
    request.onsuccess = () => setSavedItems(request.result);
  };

  // Save data
  const handleSave = () => {
    if (!db || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      store.add({ name, fileData: reader.result, date: new Date() });

      transaction.oncomplete = () => {
        console.log("Data saved!");
        loadItems(db);
        setName("");
        setFile(null);
      };
    };
    reader.readAsDataURL(file); // convert to base64
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">🗂️ IndexedDB File Storage Demo</h1>

      <div className="bg-white shadow p-6 rounded-xl w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Enter a name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="border p-2 w-full rounded"
        />

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-2 px-4 rounded w-full"
        >
          Save to IndexedDB
        </button>
      </div>

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">📂 Saved Items</h2>
        <div className="space-y-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow p-4 rounded flex flex-col items-center"
            >
              <p className="font-medium">{item.name}</p>
              <small className="text-gray-500">
                {new Date(item.date).toLocaleString()}
              </small>
              {item.fileData && (
                <img
                  src={item.fileData}
                  alt={item.name}
                  className="w-32 h-32 object-cover mt-2 rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
