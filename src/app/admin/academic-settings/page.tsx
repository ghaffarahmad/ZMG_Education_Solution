"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Edit2, Play, Pause, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

type AcademicOption = {
  _id: string;
  type: "board" | "program" | "group";
  name: string;
  slug: string;
  boardId?: string | null;
  programId?: string | null;
  level?: string;
  year?: string;
  isCombined?: boolean;
  isActive: boolean;
  sortOrder: number;
};

export default function AcademicSettingsPage() {
  const [options, setOptions] = useState<AcademicOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"board" | "program" | "group">("board");
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<AcademicOption>>({
    type: "board",
    name: "",
    isActive: true,
    sortOrder: 0,
    boardId: "",
    programId: ""
  });

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/academic-options");
      const json = await res.json();
      if (json.success) setOptions(json.data);
    } catch (error) {
      toast.error("Failed to fetch options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const openAddForm = () => {
    setEditId(null);
    setFormData({
      type: activeTab,
      name: "",
      isActive: true,
      sortOrder: 0,
      boardId: "",
      programId: ""
    });
    setShowForm(true);
  };

  const openEditForm = (option: AcademicOption) => {
    setEditId(option._id);
    setFormData({
      type: option.type,
      name: option.name,
      isActive: option.isActive,
      sortOrder: option.sortOrder,
      boardId: option.boardId || "",
      programId: option.programId || ""
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/admin/academic-options/${editId}` : "/api/admin/academic-options";
      const method = editId ? "PATCH" : "POST";

      const payload = { ...formData, type: activeTab };
      if (!payload.boardId) payload.boardId = null;
      if (!payload.programId) payload.programId = null;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editId ? "Option updated" : "Option created");
        setShowForm(false);
        fetchOptions();
      } else {
        toast.error(json.message || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (option: AcademicOption) => {
    try {
      const res = await fetch(`/api/admin/academic-options/${option._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !option.isActive }),
      });
      if (res.ok) fetchOptions();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this option? If it is in use, it will be deactivated instead.")) return;
    try {
      const res = await fetch(`/api/admin/academic-options/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchOptions();
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };


  const filteredOptions = options.filter(o => o.type === activeTab).sort((a, b) => a.sortOrder - b.sortOrder);
  const boards = options.filter(o => o.type === "board");
  const programs = options.filter(o => o.type === "program");

  return (
    <div className="content-fade-in space-y-6 pb-12">
      <div className="admin-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Manage dynamic Boards, Programs, and Groups for student enrollments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddForm} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Button>
        </div>
      </div>

      <div className="-mx-3 overflow-x-auto px-3 pb-1">
        <div className="flex min-w-max gap-2">
          <button onClick={() => { setActiveTab("board"); setShowForm(false); }} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "board" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            Boards / Universities
          </button>
          <button onClick={() => { setActiveTab("program"); setShowForm(false); }} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "program" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            Programs / Classes
          </button>
          <button onClick={() => { setActiveTab("group"); setShowForm(false); }} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "group" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            Groups / Subjects
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-5 sm:p-6 space-y-4 border-l-4 border-primary">
          <h3 className="font-bold text-lg">{editId ? "Edit" : "Add"} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Name *</label>
              <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="e.g. Science" />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Sort Order</label>
              <input type="number" required value={formData.sortOrder} onChange={e=>setFormData({...formData, sortOrder: Number(e.target.value)})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" />
            </div>

            {(activeTab === "program" || activeTab === "group") && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Parent Board (Optional)</label>
                <select value={formData.boardId || ""} onChange={e=>setFormData({...formData, boardId: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                  <option value="">-- Global (Applies to all) --</option>
                  {boards.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {activeTab === "group" && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Parent Program (Optional)</label>
                <select value={formData.programId || ""} onChange={e=>setFormData({...formData, programId: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                  <option value="">-- Global (Applies to all) --</option>
                  {programs.map(p => <option key={p._id} value={p._id}>{p.name} {p.boardId ? `(${boards.find(b=>b._id === p.boardId)?.name})` : ''}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e=>setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary" />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active Option</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Option
            </Button>
          </div>
        </form>
      )}

      <div className="admin-card overflow-hidden">
        {loading && !options.length ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : filteredOptions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No options found for this category.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
            <thead className="admin-table-header">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                {(activeTab === "program" || activeTab === "group") && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Board</th>
                )}
                {activeTab === "group" && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Program</th>
                )}
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Order</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredOptions.map(option => (
                <tr key={option._id} className="admin-table-row">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                    {option.name}
                  </td>
                  {(activeTab === "program" || activeTab === "group") && (
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
                      {option.boardId ? boards.find(b => b._id === option.boardId)?.name || "Unknown Board" : <span className="text-xs italic text-slate-400">Global</span>}
                    </td>
                  )}
                  {activeTab === "group" && (
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
                      {option.programId ? programs.find(p => p._id === option.programId)?.name || "Unknown Program" : <span className="text-xs italic text-slate-400">Global</span>}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
                    {option.sortOrder}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold uppercase ${option.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {option.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(option)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(option._id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
