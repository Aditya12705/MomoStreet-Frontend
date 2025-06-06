import { useEffect, useState, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

type Order = {
  id: number;
  items: string;
  name: string;
  phone: string;
  created_at: string;
};

type MenuItem = {
  id: number;
  name: string;
  extras?: string;
  price: number | null;
  sizes?: { size: string; price: number }[];
  image?: string;
  extraOptions?: { name: string; price: number }[];
  pizzaSubcategory?: string;
  category?: string;
};

type Tab = "orders" | "menu" | "history";

const formatIST = (utcString: string) => {
  try {
    const date = new Date(utcString.replace("T", " ").replace("Z", ""));
    date.setHours(date.getHours() + 5, date.getMinutes() + 30);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  } catch {
    return utcString;
  }
};

// Toast component for feedback
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", top: 24, right: 24, background: "#222", color: "#fff", padding: "16px 32px", borderRadius: 8, boxShadow: "0 2px 8px #0003", zIndex: 1000 }}>
      {message}
    </div>
  );
}

// Initialize Supabase client (replace with your actual project URL and anon key)
const SUPABASE_URL = 'https://nezbktuqqqprshhaenix.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lemJrdHVxcXFwcnNoaGFlbml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzkxOTIsImV4cCI6MjA2NDcxNTE5Mn0.Jq4yHBcIIJaFmhQ_bGP8DWos_-_YXeEpKCQ1RruEqkI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Modal image picker with upload
function ImagePicker({ open, images, onSelect, onClose, onUpload, uploading, setUploading }: { open: boolean; images: string[]; onSelect: (url: string) => void; onClose: () => void; onUpload: (file: File, closeCallback: () => void) => void; uploading: boolean; setUploading: (v: boolean) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  if (!open) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", padding: 0, borderRadius: 12, maxHeight: 700, overflow: "hidden", minWidth: 400, width: 440, boxShadow: "0 4px 32px #0003", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* Sticky header */}
        <div style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 2, padding: 24, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottom: "1px solid #eee" }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontWeight: 700, fontSize: 22, color: "#222", textAlign: "center", letterSpacing: 0.5 }}>Pick or Upload an Image</h3>
          <div style={{ color: "#555", fontSize: 15, textAlign: "center", marginBottom: 0 }}>
            Drag & drop or <span style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>browse</span> to upload a new image
          </div>
        </div>
        {/* Upload area */}
        <div
          style={{
            border: dragActive ? "2px solid #007bff" : "2px dashed #bbb",
            borderRadius: 8,
            padding: 16,
            margin: 24,
            marginBottom: 0,
            textAlign: "center",
            background: dragActive ? "#eaf4ff" : uploading ? "#f5f5f5" : "#fafbfc",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDrop={e => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              setUploading(true);
              setUploadError(null);
              onUpload(e.dataTransfer.files[0], onClose);
            }
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setUploading(true);
                setUploadError(null);
                onUpload(e.target.files[0], onClose);
              }
            }}
            disabled={uploading}
          />
          {uploading ? (
            <div style={{ color: "#007bff", fontWeight: 600, fontSize: 16 }}>
              Uploading image...
            </div>
          ) : (
            <div style={{ color: "#555", fontSize: 15 }}>
              Drop image here or click to select
            </div>
          )}
          {uploadError && (
            <div style={{ color: "#dc3545", marginTop: 8 }}>{uploadError}</div>
          )}
        </div>
        {/* Images grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, paddingTop: 12, display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 0, minHeight: 200 }}>
          {images.length === 0 && (
            <div style={{ color: "#888", width: "100%", textAlign: "center", marginTop: 40 }}>No images found.</div>
          )}
          {images.map(img => (
            <img
              key={img}
              src={img}
              alt="menu-img"
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 8,
                border: selectedImg === img ? "3px solid #007bff" : "2px solid #eee",
                cursor: uploading ? "not-allowed" : "pointer",
                boxShadow: selectedImg === img ? "0 0 0 2px #007bff44" : undefined,
                outline: selectedImg === img ? "none" : undefined,
                opacity: uploading ? 0.6 : 1,
                transition: "border 0.2s, box-shadow 0.2s, opacity 0.2s"
              }}
              onClick={() => {
                if (!uploading) {
                  setSelectedImg(img);
                  onSelect(img);
                  onClose();
                }
              }}
            />
          ))}
        </div>
        <button onClick={onClose} style={{ margin: 24, marginTop: 0, padding: "10px 0", borderRadius: 6, border: "none", background: "#007bff", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 16, width: "calc(100% - 48px)" }}>Close</button>
      </div>
    </div>
  );
}

const imgFiles = [
  "aloo paratha.jpg",
  "bbq chicken burger.jpg",
  "bbq chicken pizza.jpg",
  "bread omelette.jpg",
  "Bucket (1 Chk Drumstick+3 Chk Wings).jpg",
  "burger combo (Non-Veg).webp",
  "burnt garlic chicken fried rice.jpg",
  "butter chicken pizza.webp",
  "butter chicken rice bowl.jpeg",
  "butter chicken roll.jpg",
  "Butter Maggi.jpeg",
  "butter paneer rice bowl.jpg",
  "butter paneer roll.jpg",
  "butter pav bhaji.jpg",
  "butterscotch milkshake.jpg",
  "cheese garlic bread.webp",
  "cheesy vada pav.webp",
  "chicken alfredo (White) pasta.jpg",
  "chicken arrabbiata (Red) pasta.jpg",
  "chicken cheese fried momo.jpg",
  "chicken cheese hot & crispy momo.jpg",
  "chicken cheese steam momo.jpg",
  "chicken chilli (7-8 Pcs).jpg",
  "chicken classico pizza.jpg",
  "chicken fried momo.jpg",
  "chicken fried rice.webp",
  "chicken grilled sandwich.jpg",
  "chicken hot & crispy momo.webp",
  "chicken maggi.jpg",
  "chicken manchurian(7-8 Pcs).webp",
  "chicken noodles.jpg",
  "chicken nuggets (5pcs).jpg",
  "chicken pink penne pasta.jpg",
  "chicken riso oliva pasta pasta.jpg",
  "chicken schezwan noodles.jpg",
  "chicken seekh kabab (4 pcs).jpg",
  "chicken spring roll (4pcs).jpg",
  "chicken steam momo.jpg",
  "chicken tandoori sandwich.jpg",
  "chicken tikka roll.webp",
  "chilli chicken pizza.jpg",
  "chilli chicken rice bowl.jpg",
  "chilli mushroom.jpeg",
  "chilli paneer rice bowl.jpg",
  "chocolate milkshake.jpg",
  "classic chicken burger.jpg",
  "classic veg burger.jpg",
  "cold coffee.jpg",
  "corn cheese fried momo.jpg",
  "corn cheese hot & crispy momo.jpg",
  "corn cheese steam momo.webp",
  "corn maggi.jpg",
  "cream and onion fries.jpg",
  "crispy corn.jpeg",
  "cucumber mojito.jpg",
  "egg bhurji fried momo.jpg",
  "egg bhurji hot & crispy momo.jpg",
  "egg bhurji steam momo.jpg",
  "egg fried rice.jpg",
  "egg maggi.jpg",
  "egg noodles.jpg",
  "egg schezwan noodles.jpg",
  "farm house pizza.webp",
  "farmhouse chicken pizza.webp",
  "garlic bread.jpg",
  "gobi paratha.webp",
  "golden corn pizza.jpg",
  "green apple mojito.jpg",
  "hara bhara kebab(5 pcs).jpg",
  "honey chilli potato.jpg",
  "kadai chicken rice bowl.jpg",
  "kadai paneer rice bowl.jpg",
  "kadhai chicken pizza.webp",
  "khadai chicken roll.jpg",
  "khadai paneer roll.jpg",
  "kitkat milkshake.jpg",
  "lemonade.jpg",
  "Maggie.jpg",
  "mango milkshake.jpg",
  "mango mint mojito.jpg",
  "margherita pizza.webp",
  "mumbai vada pav.jpg",
  "mushroom delight.jpeg",
  "noodle combo (Veg).jpg",
  "omelette roll.jpg",
  "oreo milkshake.webp",
  "paneer chilli (7-8 Pcs).jpg",
  "paneer fried momo.webp",
  "paneer fried rice.jpg",
  "paneer hot & crispy momo.jpg",
  "paneer hot & crispy momo_1.jpg",
  "paneer maggi.png",
  "paneer makhni pizza.jpeg",
  "paneer manchurian(7-8 Pcs).png",
  "paneer spring roll (4pcs).webp",
  "paneer steam momo.jpg",
  "paneer tandoori sandwich.jpg",
  "paneer tikka roll.jpg",
  "paratha (Non- Veg Combo).jpg",
  "paratha (Veg Combo).jpg",
  "pepper chicken pizza.webp",
  "peri peri chicken fried momo.webp",
  "peri peri chicken hot & crispy momo.jpg",
  "peri peri chicken steam momo.jpeg",
  "peri peri fries.jpg",
  "pizza fried momo.jpg",
  "pizza hot & crispy momo.jpg",
  "pizza steam momo.jpg",
  "Plain Maggi.jpg",
  "Plain Maggi_1.jpg",
  "salty fries.jpg",
  "schezwan chicken fried rice.jpg",
  "seekh kebab roll.jpg",
  "spicy bhel poori.jpg",
  "strawberry milkshake.jpg",
  "tandoori paneer burger.jpg",
  "tandoori paneer pizza.webp",
  "tripple chicken pizza.jpeg",
  "vanilla milkshake.jpg",
  "veg alfredo (White) pasta.jpg",
  "veg arrabbiata (Red) pasta.webp",
  "veg burnt garlic fried rice.jpg",
  "veg fried momo.jpg",
  "veg fried rice.webp",
  "veg grilled sandwich.jpg",
  "veg hot & crispy momo.jpg",
  "veg maggi.jpg",
  "veg manchurian (7-8 Pcs).jpg",
  "veg noodles.jpg",
  "veg pink penne pasta.jpg",
  "veg riso oliva pasta pasta.jpg",
  "veg schezwan fried rice.jpg",
  "veg schezwan noodles.jpg",
  "veg spring roll (5pcs).jpg",
  "veg steam momo.jpg",
  "veg supreme pizza.jpg",
  "virgin mojito.jpg",
  "watermelon mojito.jpg"
];
const backendImgUrl = (file: string) => `https://momostreet-backend.onrender.com/img/${encodeURIComponent(file)}`;

export default function Admin() {
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [newItem, setNewItem] = useState<MenuItem>({
    id: 0,
    name: "",
    extras: "",
    price: null,
    image: "",
    category: "",
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const prevOrderCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [imgUrls, setImgUrls] = useState(imgFiles.map(backendImgUrl));
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [insertPosition, setInsertPosition] = useState<string>("0");
  const [uploading, setUploading] = useState(false);

  const API_URL = "https://momostreet-backend.onrender.com";

  // --- ORDERS ---
  useEffect(() => {
    if (tab !== "orders") return;
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/orders`);
        const data = await response.json();
        setOrders(data);
        if (prevOrderCount.current !== 0 && data.length > prevOrderCount.current) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1;
            audioRef.current.play().catch(() => {});
          }
        }
        prevOrderCount.current = data.length;
      } catch {
        setOrders([]);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [tab]);

  // --- MENU ---
  useEffect(() => {
    if (tab !== "menu") return;
    fetch(`${API_URL}/admin/export-menu`)
      .then((res) => res.json())
      .then(setMenu)
      .catch(() => setMenu([]));
  }, [tab]);

  // --- HISTORY ---
  useEffect(() => {
    if (tab !== "history") return;
    fetch(`${API_URL}/admin/history`)
      .then((res) => res.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [tab]);

  // Extract unique categories from menu
  useEffect(() => {
    const unique = Array.from(new Set(menu.map(item => item.category).filter((c): c is string => Boolean(c))));
    setCategories(unique);
  }, [menu]);

  // --- MENU CRUD (with toast feedback) ---
  const saveMenuToBackend = async (updatedMenu: MenuItem[]) => {
    await fetch(`${API_URL}/admin/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMenu),
    });
    setMenu(updatedMenu);
  };

  const handleAddMenuItem = async () => {
    if (!newItem.name || (!newItem.price && !newItem.sizes) || !newItem.category) {
      setToast("Please fill all fields");
      return;
    }
    const maxId = menu.reduce((max, item) => Math.max(max, item.id), 0);
    const itemToAdd = { ...newItem, id: maxId + 1 };
    // Find the index in the full menu where the new item should be inserted
    let insertIdx = 0;
    let count = 0;
    for (let i = 0; i < menu.length; i++) {
      if (menu[i].category === newItem.category) {
        if (count === Number(insertPosition)) {
          insertIdx = i;
          break;
        }
        count++;
      }
      if (i === menu.length - 1 && count <= Number(insertPosition)) {
        insertIdx = i + 1;
      }
    }
    const updatedMenu = [
      ...menu.slice(0, insertIdx),
      itemToAdd,
      ...menu.slice(insertIdx)
    ];
    await saveMenuToBackend(updatedMenu);
    setNewItem({ id: 0, name: "", extras: "", price: null, image: "", category: "" });
    setEditIdx(null);
    setShowPreview(false);
    setInsertPosition("0");
    setToast("Menu item added!");
  };

  const handleRemoveMenuItem = async (id: number) => {
    const updatedMenu = menu.filter((item) => item.id !== id);
    await saveMenuToBackend(updatedMenu);
    setToast("Menu item removed");
  };

  const handleEditMenuItem = (idx: number) => {
    setEditIdx(idx);
    setNewItem({ ...menu[idx] });
    setShowPreview(!!menu[idx].image);
  };

  const handleSaveEdit = async () => {
    if (editIdx === null) return;
    const updatedMenu = menu.map((item, idx) => (idx === editIdx ? { ...newItem, id: item.id } : item));
    await saveMenuToBackend(updatedMenu);
    setEditIdx(null);
    setNewItem({ id: 0, name: "", extras: "", price: null, image: "", category: "" });
    setShowPreview(false);
    setToast("Menu item updated!");
  };

  const clearOrders = () => {
    fetch(`${API_URL}/admin/clear`, { method: "POST" }).then(() => setOrders([]));
  };

  // Image upload handler
  const handleImageUpload = async (file: File, closeCallback: () => void) => {
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from('menu-images').upload(fileName, file);
    if (error) {
      console.error('Supabase upload error:', error);
      setToast('Image upload failed');
      setUploading(false);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(fileName);
    if (publicUrlData?.publicUrl) {
      setImgUrls(urls => [publicUrlData.publicUrl, ...urls]);
      setNewItem(item => ({ ...item, image: publicUrlData.publicUrl }));
      setShowPreview(true);
      setToast('Image uploaded!');
      // Delay closing the modal slightly to allow UI to update
      setTimeout(() => {
        closeCallback();
      }, 500);
    } else {
      setToast('Upload succeeded but could not get public URL');
    }
    setUploading(false);
  };

  return (
    <>
      <style>{`
        html, body, #root, #admin-desktop-only { height: 100%; width: 100%; margin: 0; padding: 0; }
        #admin-desktop-only { min-height: 100vh; min-width: 100vw; background: #181818; }
        @media (max-width: 900px) {
          #admin-desktop-only { display: none; }
          #admin-mobile-msg { display: flex; }
        }
        @media (min-width: 901px) {
          #admin-desktop-only { display: block; }
          #admin-mobile-msg { display: none; }
        }
      `}</style>
      <div id="admin-mobile-msg" style={{ minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#181818", color: "#fff", fontSize: 24, display: "none" }}>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <b>Admin panel is only available on desktop/laptop screens.</b>
          <br />
          Please use a computer to access the admin dashboard.
        </div>
      </div>
      <div id="admin-desktop-only">
        <div style={{ padding: 24, maxWidth: '100vw', margin: 0, background: "#181818", minHeight: "100vh" }}>
          <audio ref={audioRef} src="/notification.mp3" />
          <h1 style={{ fontSize: 36, marginBottom: 32, color: "#fff", textAlign: "center", letterSpacing: 1 }}>Admin Panel</h1>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 32 }}>
            <button onClick={() => setTab("orders")} style={{ fontSize: 18, padding: "10px 32px", cursor: "pointer", backgroundColor: tab === "orders" ? "#007bff" : "#232323", color: tab === "orders" ? "#fff" : "#fff", border: "none", borderRadius: 8, fontWeight: 600, boxShadow: tab === "orders" ? "0 2px 8px #007bff44" : undefined }}>Orders</button>
            <button onClick={() => setTab("menu")} style={{ fontSize: 18, padding: "10px 32px", cursor: "pointer", backgroundColor: tab === "menu" ? "#007bff" : "#232323", color: tab === "menu" ? "#fff" : "#fff", border: "none", borderRadius: 8, fontWeight: 600, boxShadow: tab === "menu" ? "0 2px 8px #007bff44" : undefined }}>Menu</button>
            <button onClick={() => setTab("history")} style={{ fontSize: 18, padding: "10px 32px", cursor: "pointer", backgroundColor: tab === "history" ? "#007bff" : "#232323", color: tab === "history" ? "#fff" : "#fff", border: "none", borderRadius: 8, fontWeight: 600, boxShadow: tab === "history" ? "0 2px 8px #007bff44" : undefined }}>History</button>
          </div>
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
          {/* --- MENU TAB --- */}
          {tab === "menu" && (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 32, width: "100%", justifyContent: "center" }}>
              {/* Menu Management (Left) */}
              <div style={{ background: "#232323", borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: "0 2px 16px #0002", width: 400, maxWidth: 500, minWidth: 340, flexShrink: 0 }}>
                <h2 style={{ color: "#fff", marginBottom: 24, textAlign: "center" }}>Menu Management</h2>
                <input type="text" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={{ padding: 12, marginBottom: 12, borderRadius: 6, border: "1px solid #444", fontSize: 16, width: "100%", background: "#181818", color: "#fff" }} />
                {/* Category dropdown with add option */}
                <div style={{ marginBottom: 12 }}>
                  <select
                    value={showAddCategory ? "__add_new__" : (newItem.category || "")}
                    onChange={e => {
                      if (e.target.value === "__add_new__") {
                        setShowAddCategory(true);
                        setNewCategory("");
                      } else {
                        setShowAddCategory(false);
                        setNewItem({ ...newItem, category: e.target.value });
                        setInsertPosition("0"); // Reset position when category changes
                      }
                    }}
                    style={{ padding: 12, borderRadius: 6, border: "1px solid #444", fontSize: 16, width: "100%", background: "#181818", color: "#fff" }}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__add_new__">+ Add new section</option>
                  </select>
                  {showAddCategory && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="New section name"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #444", fontSize: 15, background: "#181818", color: "#fff" }}
                      />
                      <button
                        style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "#28a745", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                        onClick={() => {
                          if (newCategory.trim()) {
                            setCategories(cats => [...cats, newCategory.trim()]);
                            setNewItem(item => ({ ...item, category: newCategory.trim() }));
                            setShowAddCategory(false);
                            setInsertPosition("0");
                          }
                        }}
                      >Add</button>
                      <button
                        style={{ padding: "8px 10px", borderRadius: 6, border: "none", background: "#dc3545", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                        onClick={() => setShowAddCategory(false)}
                      >Cancel</button>
                    </div>
                  )}
                </div>
                <input type="text" placeholder="Extras" value={newItem.extras} onChange={e => setNewItem({ ...newItem, extras: e.target.value })} style={{ padding: 12, marginBottom: 12, borderRadius: 6, border: "1px solid #444", fontSize: 16, width: "100%", background: "#181818", color: "#fff" }} />
                <input type="number" placeholder="Price" value={newItem.price !== null ? newItem.price : ""} onChange={e => setNewItem({ ...newItem, price: e.target.value ? parseFloat(e.target.value) : null })} style={{ padding: 12, marginBottom: 12, borderRadius: 6, border: "1px solid #444", fontSize: 16, width: "100%", background: "#181818", color: "#fff" }} />
                {/* Extra Options Section */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: '#fff', fontWeight: 600, marginBottom: 6, display: 'block' }}>Extra Options</label>
                  {(newItem.extraOptions || []).map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Option Name"
                        value={opt.name || ''}
                        onChange={e => {
                          const updated = [...(newItem.extraOptions || [])];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setNewItem(item => ({ ...item, extraOptions: updated }));
                        }}
                        style={{ flex: 2, minWidth: 0, padding: 10, borderRadius: 6, border: '1px solid #444', fontSize: 15, background: '#181818', color: '#fff' }}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={opt.price !== undefined && opt.price !== null ? opt.price : ''}
                        onChange={e => {
                          const updated = [...(newItem.extraOptions || [])];
                          updated[idx] = { ...updated[idx], price: e.target.value ? parseFloat(e.target.value) : 0 };
                          setNewItem(item => ({ ...item, extraOptions: updated }));
                        }}
                        style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 6, border: '1px solid #444', fontSize: 15, background: '#181818', color: '#fff' }}
                      />
                      <button
                        type="button"
                        style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#dc3545', color: '#fff', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 4 }}
                        onClick={() => {
                          const updated = [...(newItem.extraOptions || [])];
                          updated.splice(idx, 1);
                          setNewItem(item => ({ ...item, extraOptions: updated }));
                        }}
                      >Remove</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#007bff', color: '#fff', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
                    onClick={() => {
                      setNewItem(item => ({ ...item, extraOptions: [...(item.extraOptions || []), { name: '', price: 0 }] }));
                    }}
                  >+ Add Extra Option</button>
                </div>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <button type="button" onClick={() => setShowImagePicker(true)} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#007bff", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Pick Image</button>
                  {showPreview && newItem.image && (
                    <img src={newItem.image} alt="preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #444" }} />
                  )}
                </div>
                {/* Insert Position Dropdown */}
                {newItem.category && !showAddCategory && (
                  <div style={{ marginBottom: 12 }}>
                    <select
                      value={insertPosition}
                      onChange={e => setInsertPosition(e.target.value)}
                      style={{ padding: 12, borderRadius: 6, border: "1px solid #444", fontSize: 16, width: "100%", background: "#181818", color: "#fff" }}
                    >
                      <option value="0">At Top</option>
                      {menu.filter(item => item.category === newItem.category).map((item, idx) => (
                        <option key={item.id} value={String(idx + 1)}>
                          {`After: ${item.name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button onClick={editIdx !== null ? handleSaveEdit : handleAddMenuItem} style={{ padding: "12px 24px", borderRadius: 6, border: "none", backgroundColor: "#28a745", color: "#fff", fontSize: 18, fontWeight: 600, width: "100%", cursor: "pointer", marginTop: 8 }}>{editIdx !== null ? "Save Changes" : "Add to Menu"}</button>
              </div>
              {/* Menu Table (Right) - make this scrollable */}
              <div style={{ width: "100%", maxWidth: 900, background: "#232323", borderRadius: 16, boxShadow: "0 2px 16px #0002", padding: 24, minHeight: 500, maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#232323", zIndex: 2, boxShadow: '0 2px 8px #0004' }}>
                    <tr style={{ borderBottom: "2px solid #007bff" }}>
                      <th style={{ padding: 12, textAlign: "left", background: "#232323" }}>ID</th>
                      <th style={{ padding: 12, textAlign: "left", background: "#232323" }}>Name</th>
                      <th style={{ padding: 12, textAlign: "left", background: "#232323" }}>Category</th>
                      <th style={{ padding: 12, textAlign: "left", background: "#232323" }}>Price</th>
                      <th style={{ padding: 12, textAlign: "left", background: "#232323" }}>Image</th>
                      <th style={{ padding: 12, textAlign: "left", background: "#232323" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #333", background: idx % 2 === 0 ? "#232323" : "#181818" }}>
                        <td style={{ padding: 12 }}>{item.id}</td>
                        <td style={{ padding: 12 }}>{item.name}</td>
                        <td style={{ padding: 12 }}>{item.category}</td>
                        <td style={{ padding: 12 }}>{item.price !== null ? `₹${item.price}` : "N/A"}</td>
                        <td style={{ padding: 12 }}>{item.image && <img src={item.image} alt="img" style={{ width: 48, borderRadius: 6, objectFit: "cover" }} />}</td>
                        <td style={{ padding: 12 }}>
                          <button onClick={() => handleEditMenuItem(idx)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer", marginRight: 8 }}>Edit</button>
                          <button onClick={() => handleRemoveMenuItem(item.id)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer" }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Image Picker Modal with upload */}
              <ImagePicker open={showImagePicker} images={imgUrls} onSelect={url => { setNewItem(item => ({ ...item, image: url })); setShowPreview(true); }} onClose={() => setShowImagePicker(false)} onUpload={handleImageUpload} uploading={uploading} setUploading={setUploading} />
            </div>
          )}

          {/* --- ORDERS TAB --- */}
          {tab === "orders" && (
            <div>
              <h2 style={{ fontSize: 24, marginBottom: 16 }}>Current Orders</h2>
              <button onClick={clearOrders} style={{ marginBottom: 16, padding: "8px 16px", cursor: "pointer", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: 4 }}>
                Clear All Orders
              </button>
              <div style={{ maxHeight: 600, overflowY: "auto", marginBottom: 24 }}>
                {orders.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#888" }}>No new orders</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f2f2f2", borderBottom: "2px solid #007bff" }}>
                        <th style={{ padding: 12, textAlign: "left" }}>ID</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Items</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Phone</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Date</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
                          <td style={{ padding: 12 }}>{order.id}</td>
                          <td style={{ padding: 12 }}>{order.items}</td>
                          <td style={{ padding: 12 }}>{order.name}</td>
                          <td style={{ padding: 12 }}>{order.phone}</td>
                          <td style={{ padding: 12 }}>{formatIST(order.created_at)}</td>
                          <td style={{ padding: 12 }}>
                            <span style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#007bff", color: "#fff", fontWeight: "bold" }}>
                              New
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* --- HISTORY TAB --- */}
          {tab === "history" && (
            <div>
              <h2 style={{ fontSize: 24, marginBottom: 16 }}>Order History</h2>
              <div style={{ maxHeight: 600, overflowY: "auto" }}>
                {history.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#888" }}>No order history found</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f2f2f2", borderBottom: "2px solid #007bff" }}>
                        <th style={{ padding: 12, textAlign: "left" }}>ID</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Items</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Phone</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Date</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((order) => (
                        <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
                          <td style={{ padding: 12 }}>{order.id}</td>
                          <td style={{ padding: 12 }}>{order.items}</td>
                          <td style={{ padding: 12 }}>{order.name}</td>
                          <td style={{ padding: 12 }}>{order.phone}</td>
                          <td style={{ padding: 12 }}>{formatIST(order.created_at)}</td>
                          <td style={{ padding: 12 }}>
                            <span style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#28a745", color: "#fff", fontWeight: "bold" }}>
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}