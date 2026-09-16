import { useState, useEffect, useRef } from "react";
import { dbService } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Plus, X, Loader2, AlertCircle, Bell, Trash2 } from "lucide-react";
import SEO from "../components/SEO";
import { staggerSlideLeft, fadeUp } from "../utils/animate";
import { emailService } from "../services/emailService";

const Announcements = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user && user.role === "admin";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const listRef = useRef(null);
  const headerRef = useRef(null);

  const fetchAnnouncements = async (isMounted) => {
    setLoading(true);
    setError("");
    try {
      const data = await dbService.announcements.getAll();
      if (isMounted) setAnnouncements(data);
    } catch (err) {
      if (isMounted) setError("Failed to fetch announcements.");
      console.error(err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchAnnouncements(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (headerRef.current) fadeUp(headerRef.current, { delay: 0 });
  }, []);

  useEffect(() => {
    if (!loading && listRef.current) {
      staggerSlideLeft(listRef.current.querySelectorAll(":scope > div"), {
        stagger: 80,
        startDelay: 100,
      });
    }
  }, [loading, announcements]);

  const openAddModal = () => {
    setTitle("");
    setMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await dbService.announcements.delete(id);
        setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
      } catch (err) {
        alert("Failed to delete announcement.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !message) {
      setError("Please enter a title and message.");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    try {
      const added = await dbService.announcements.add({ title, message });
      setAnnouncements((prev) => [added, ...prev]);
      setIsModalOpen(false);

      // Dispatch announcement email to registered members
      dbService.users
        .getAll()
        .then((allUsers) => {
          const emails = allUsers.map((u) => u.email).filter(Boolean);
          if (emails.length > 0) {
            emailService
              .sendAnnouncement(added, emails)
              .catch((e) => console.error("Announcement email error:", e));
          }
        })
        .catch((err) =>
          console.warn("Could not fetch user emails for announcement:", err),
        );
    } catch (err) {
      setError("Failed to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  const announcementsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sri Anjaneya Youth Zarugumalli Announcements",
    itemListElement: announcements.slice(0, 10).map((ann, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: ann.title,
        articleBody: ann.message,
        datePublished: ann.createdAt,
      },
    })),
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 xl:space-y-8 w-full">
      <SEO
        title={t("announcements")}
        description="Latest official announcements from Sri Anjaneya Youth Zarugumalli — important updates, upcoming events, seva opportunities and community notices."
        path="/announcements"
        schema={announcementsSchema}
      />

      {/* Header Panel */}
      <div
        ref={headerRef}
        style={{ opacity: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5 xl:pb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-800 tracking-tight">
            {t("announcements")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t("importantUpdates")}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4.5 py-2.5 xl:px-5 xl:py-3 text-xs xl:text-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 xl:w-5 xl:h-5" />
            {t("newAnnouncement")}
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs sm:text-sm flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Announcements Timeline List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            {t("loadingAnnouncements")}
          </p>
        </div>
      ) : announcements.length > 0 ? (
        <div
          ref={listRef}
          className="relative border-l-2 border-saffron-300 dark:border-saffron-700/60 pl-6 sm:pl-8 space-y-6 sm:space-y-8 ml-3 sm:ml-4 max-w-5xl"
        >
          {announcements.map((ann) => (
            <div key={ann.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-3 bg-saffron-500 text-white rounded-full p-2 border-4 border-white dark:border-slate-900 shadow-sm ring-1 ring-saffron-300 group-hover:bg-devored-600 transition-colors">
                <Bell className="w-4 h-4" />
              </div>

              <div className="card p-5 xl:p-7 hover:border-saffron-300 transition-all relative">
                {/* Delete button for Admin */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-devored-600 p-2 rounded-xl hover:bg-devored-50 dark:hover:bg-devored-950/40 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4 xl:w-5 xl:h-5" />
                  </button>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 pr-8">
                  <h3 className="text-sm sm:text-base xl:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    {ann.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    {new Date(ann.createdAt).toLocaleString(language === "te" ? "te-IN" : "en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm xl:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ann.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 xl:p-16 text-center text-slate-400 text-xs sm:text-sm border border-dashed flex flex-col items-center justify-center gap-3">
          <Bell className="w-10 h-10 text-slate-300" />
          <span>{t("noNotifications")}</span>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-cream-200 dark:border-slate-800 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm xl:text-base uppercase tracking-wider">
                {t("publishAnnouncement")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-saffron-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 xl:space-y-5">
              {error && (
                <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">
                  {t("title")} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cleanliness Seva on Sunday"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">
                  {t("messageContent")}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type the message body, details, links or coordinator contact information..."
                  rows="5"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSaving ? (language === "te" ? "ప్రచురించబడుతోంది..." : "Publishing...") : t("publishNow")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
