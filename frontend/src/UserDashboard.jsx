import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as sRef,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { auth } from "./../firebaseConfig";

const db = getFirestore();

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser || null);
  const [displayName, setDisplayName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [generating, setGenerating] = useState({}); // map tplId -> bool

  // UI controls
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updatedDesc"); // updatedDesc | nameAsc

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setDisplayName(u?.displayName || "");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      loadTemplates();
      loadRecentActivity();
    } else {
      setTemplates([]);
      setRecent([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const templatesRef = collection(db, "templates");
      const ownedQ = query(templatesRef, where("ownerId", "==", user.uid));
      const ownedSnap = await getDocs(ownedQ);
      const owned = ownedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const collabQ = query(
        templatesRef,
        where("collaboratorIds", "array-contains", user.uid)
      );
      const collabSnap = await getDocs(collabQ);
      const collab = collabSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const merged = Array.from(
        new Map([...owned, ...collab].map((t) => [t.id, t])).values()
      );
      setTemplates(merged);
    } catch (err) {
      console.error("loadTemplates:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    if (!user) return;
    try {
      const templatesRef = collection(db, "templates");
      const q = query(templatesRef, where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const toMillis = (v) => {
        if (!v) return 0;
        if (typeof v === "object" && typeof v.toMillis === "function")
          return v.toMillis();
        const parsed = Date.parse(v);
        return isNaN(parsed) ? 0 : parsed;
      };

      items.sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
      setRecent(items.slice(0, 8));
    } catch (err) {
      console.error("loadRecentActivity:", err);
    }
  };

  const saveProfile = async () => {
    if (!user) return alert("Sign in to update profile.");
    setSavingProfile(true);
    try {
      const uRef = doc(db, "users", user.uid);
      await setDoc(uRef, { displayName }, { merge: true });
      alert("Profile updated.");
    } catch (err) {
      console.error("saveProfile:", err);
      alert("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenTemplate = (tpl) => {
    navigate("/test", { state: { openTemplateId: tpl.id } });
  };

  const handleRename = async (tpl) => {
    const name = prompt("Rename template", tpl.name || "");
    if (!name || name === tpl.name) return;
    try {
      await updateDoc(doc(db, "templates", tpl.id), {
        name,
        updatedAt: new Date().toISOString(),
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, name } : t))
      );
      alert("Renamed.");
    } catch (err) {
      console.error("rename:", err);
      alert("Rename failed (check permissions).");
    }
  };

  const handleDelete = async (tpl) => {
    if (
      !confirm(
        `Delete template "${tpl.name || "Untitled"}"? This cannot be undone.`
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "templates", tpl.id));
      setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
      setRecent((prev) => prev.filter((r) => r.id !== tpl.id));
      alert("Deleted.");
    } catch (err) {
      console.error("delete:", err);
      alert("Delete failed (check permissions).");
    }
  };

  // thumbnail generator
  const generateThumbnail = async (tpl) => {
    if (!tpl || !tpl.id) return;
    if (!confirm(`Generate thumbnail for "${tpl.name || "Untitled"}"?`)) return;
    setGenerating((s) => ({ ...s, [tpl.id]: true }));
    try {
      const cw = tpl.canvasWidth || 640;
      const ch = tpl.canvasHeight || 640;
      const maxPreview = 400;
      const scale = Math.min(1, maxPreview / Math.max(cw, ch));
      const canvasW = Math.max(160, Math.round(cw * scale));
      const canvasH = Math.max(120, Math.round(ch * scale));
      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = tpl.theme?.bgColor || "#ffffff";
      ctx.fillRect(0, 0, canvasW, canvasH);

      const comps = Array.isArray(tpl.components) ? tpl.components : [];
      for (let i = 0; i < comps.length; i++) {
        const c = comps[i];
        if (!c || !c.box) continue;
        const [x, y, w, h] = c.box;
        const rx = Math.round((x / cw) * canvasW);
        const ry = Math.round((y / ch) * canvasH);
        const rw = Math.max(2, Math.round((w / cw) * canvasW));
        const rh = Math.max(2, Math.round((h / ch) * canvasH));

        ctx.fillStyle = c.bgColor || "#e6e6e6";
        ctx.fillRect(rx, ry, rw, rh);

        if (c.color && c.label === "text") {
          ctx.fillStyle = c.color || "#111";
          ctx.font = `${Math.max(10, Math.round(rh / 3))}px sans-serif`;
          ctx.textBaseline = "top";
          const txt = c.text ? String(c.text).slice(0, 40) : "";
          wrapText(
            ctx,
            txt,
            rx + 4,
            ry + 4,
            rw - 8,
            Math.max(12, Math.round(rh / 3))
          );
        } else if (c.label === "image" || c.label === "icon") {
          ctx.fillStyle = "#d1d5db";
          ctx.fillRect(
            rx + Math.round(rw * 0.1),
            ry + Math.round(rh * 0.1),
            Math.round(rw * 0.8),
            Math.round(rh * 0.8)
          );
        } else {
          ctx.strokeStyle = "rgba(0,0,0,0.05)";
          ctx.strokeRect(rx, ry, rw, rh);
        }
      }

      const dataUrl = canvas.toDataURL("image/png");
      const storage = getStorage();
      const path = `templates/${tpl.id}/thumbnail_${Date.now()}.png`;
      const ref = sRef(storage, path);
      await uploadString(ref, dataUrl, "data_url");
      const url = await getDownloadURL(ref);

      await updateDoc(doc(db, "templates", tpl.id), {
        thumbnailUrl: url,
        updatedAt: new Date().toISOString(),
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, thumbnailUrl: url } : t))
      );
      alert("Thumbnail generated and saved.");
    } catch (err) {
      console.error("generateThumbnail:", err);
      alert("Failed to generate thumbnail.");
    } finally {
      setGenerating((s) => ({ ...s, [tpl.id]: false }));
    }
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    if (!text) return;
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  const formatDate = (v) => {
    if (!v) return "—";
    if (typeof v === "object" && typeof v.toDate === "function") v = v.toDate();
    const d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  // filtered + sorted templates for UI
  const visibleTemplates = useMemo(() => {
    const q = (templates || []).filter((t) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (t.name || "").toLowerCase().includes(s) ||
        (t.tags || []).join(" ").toLowerCase().includes(s)
      );
    });
    if (sortBy === "nameAsc") {
      q.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      q.sort((a, b) => {
        const aMillis =
          a.updatedAt && typeof a.updatedAt.toMillis === "function"
            ? a.updatedAt.toMillis()
            : Date.parse(a.updatedAt || "") || 0;
        const bMillis =
          b.updatedAt && typeof b.updatedAt.toMillis === "function"
            ? b.updatedAt.toMillis()
            : Date.parse(b.updatedAt || "") || 0;
        return bMillis - aMillis;
      });
    }
    return q;
  }, [templates, search, sortBy]);

  const renderPreview = (tpl, w = 300, h = 200) => {
    const thumb = tpl.thumbnailUrl;

    // show thumbnail first, fall back to component-rendered preview on error or missing url
    if (thumb) {
      return (
        <img
          src={thumb}
          alt={tpl.name || "thumbnail"}
          className="w-full h-full object-cover rounded"
          style={{ width: w, height: h }}
          draggable={false}
          onError={(e) => {
            try {
              e.currentTarget.removeAttribute("src");
            } catch (err) {
              // ignore
            }
          }}
        />
      );
    }

    // Fallback: render a scaled visual representation of template components
    const cw = tpl.canvasWidth || 640;
    const ch = tpl.canvasHeight || 640;
    const scale = Math.min(1, w / cw);
    const previewHeight = Math.max(80, Math.round(ch * scale));
    const comps = Array.isArray(tpl.components) ? tpl.components : [];

    return (
      <div
        className="relative bg-white rounded border overflow-hidden"
        style={{ width: w, height: previewHeight, boxSizing: "border-box" }}
      >
        <div
          style={{
            width: cw,
            height: ch,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
            pointerEvents: "none",
          }}
        >
          {comps.map((c, idx) => {
            if (!c || !c.box) return null;
            const [x, y, wbox, hbox] = c.box;
            const style = {
              position: "absolute",
              left: x,
              top: y,
              width: wbox,
              height: hbox,
              overflow: "hidden",
              background: c.bgColor || "#f3f4f6",
              borderRadius: 6,
              boxSizing: "border-box",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
            };

            return (
              <div key={c.id ?? `c-${idx}`} style={style}>
                {c.label === "text" && (
                  <div
                    style={{
                      fontSize: Math.max(10, Math.round(hbox * 0.16)),
                      color: c.color || "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {String(c.text || "").slice(0, 40)}
                  </div>
                )}
                {(c.label === "image" || c.label === "icon") && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#d1d5db",
                      borderRadius: 4,
                    }}
                  />
                )}
                {(!c.label ||
                  (c.label !== "text" &&
                    c.label !== "image" &&
                    c.label !== "icon")) && (
                  <div style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white/95">User Dashboard</h1>
          <p className="text-sm text-gray-300 mt-1">
            Manage profile, projects, thumbnails and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1 border rounded bg-gray-800 text-white/90 hover:bg-gray-700"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      {!user ? (
        <div className="text-center py-24 text-gray-400">
          Not signed in. Please sign in to manage your account.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 bg-white/5 rounded p-5 border border-white/6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
                {(user.displayName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white/90">
                  {user.displayName || "No name"}
                </div>
                <div className="text-xs text-gray-300">{user.email}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-300 mb-1">
                Display name
              </label>
              <input
                className="w-full px-3 py-2 rounded border bg-transparent text-white/95"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <button
                className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-60"
                onClick={saveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </div>

            <div className="text-xs text-gray-400">
              <div>
                UID:{" "}
                <span className="text-xxs text-gray-300 break-all">
                  {user.uid}
                </span>
              </div>
              <div className="mt-2">
                Last sign-in:{" "}
                <div className="text-sm text-gray-300">
                  {formatDate(user?.metadata?.lastSignInTime)}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 w-full">
                <input
                  placeholder="Search templates or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border bg-white/5 text-white/90"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded border bg-white/5 text-white/90"
                >
                  <option value="updatedDesc">Sort: Recently updated</option>
                  <option value="nameAsc">Sort: Name (A → Z)</option>
                </select>
              </div>
            </div>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white/90">
                Projects / Templates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white/5 border border-white/6 rounded overflow-hidden shadow-sm"
                  >
                    <div className="relative">
                      <div className="p-3">{renderPreview(tpl, 420, 240)}</div>
                      <div className="absolute left-3 top-3 bg-black/40 text-xs text-white px-2 py-1 rounded">
                        {tpl.ownerId === user.uid ? "Owner" : "Collab"}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white/95">
                            {tpl.name || "Untitled"}
                          </div>
                          <div className="text-xs text-gray-300 mt-1 line-clamp-2">
                            {tpl.description ||
                              (tpl.tags || []).join(", ") ||
                              "No description"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {tpl.components?.length || 0} comps
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {tpl.updatedAt ? formatDate(tpl.updatedAt) : "—"}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                            onClick={() => handleOpenTemplate(tpl)}
                          >
                            Open
                          </button>
                          <button
                            className="px-2 py-1 text-xs border rounded bg-white/3"
                            onClick={() => handleRename(tpl)}
                          >
                            Rename
                          </button>
                          {tpl.ownerId === user.uid && (
                            <>
                              <button
                                className="px-2 py-1 text-xs border rounded text-red-500 bg-white/3"
                                onClick={() => handleDelete(tpl)}
                              >
                                Delete
                              </button>
                              <button
                                className="px-2 py-1 text-xs border rounded bg-white/3"
                                onClick={() => generateThumbnail(tpl)}
                                disabled={!!generating[tpl.id]}
                              >
                                {generating[tpl.id]
                                  ? "Generating..."
                                  : "Thumbnail"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {visibleTemplates.length === 0 && !loading && (
                  <div className="text-gray-400 col-span-full">
                    No templates match your search.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-md font-semibold mb-3 text-white/90">
                Recent activity
              </h4>
              <div className="space-y-3">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 bg-white/3 rounded border"
                  >
                    <div>
                      <div className="font-medium text-white/95">
                        {r.name || "Untitled"}
                      </div>
                      <div className="text-xs text-gray-300">
                        {formatDate(r.updatedAt)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-300">
                      {r.components?.length || 0} comps
                    </div>
                  </div>
                ))}
                {recent.length === 0 && (
                  <div className="text-gray-400">No recent activity</div>
                )}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
}
