"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { useStableData } from "@/lib/hooks";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { useToast } from "@/components/toast";
import {
  Users,
  Plus,
  Mail,
  Building2,
  CreditCard,
  MessageSquare,
} from "lucide-react";

type ClientStatus = "active" | "inactive" | "churned";

const statusColors: Record<ClientStatus, { color: string; bg: string }> = {
  active: { color: "text-mc-accent-green", bg: "bg-mc-accent-green/12" },
  inactive: { color: "text-mc-text-secondary", bg: "bg-mc-bg-tertiary" },
  churned: { color: "text-mc-accent-red", bg: "bg-mc-accent-red/12" },
};

const PLAN_OPTIONS = ["starter", "pro", "enterprise"];
const CHANNEL_OPTIONS = ["email", "whatsapp", "slack", "discord", "telegram"];
const AVATARS = ["👤", "🏢", "🚀", "💼", "🌟", "🎯", "⚡", "🔮"];

export default function ClientsPage() {
  const clients = useStableData(useQuery(api.clients.list));
  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);
  const { addToast } = useToast();

  const [filter, setFilter] = useState<ClientStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Id<"clients"> | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"clients"> | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formAvatar, setFormAvatar] = useState("👤");
  const [formPlan, setFormPlan] = useState("starter");
  const [formChannel, setFormChannel] = useState("");
  const [formChannelId, setFormChannelId] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = clients?.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormCompany("");
    setFormAvatar("👤");
    setFormPlan("starter");
    setFormChannel("");
    setFormChannelId("");
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (client: NonNullable<typeof clients>[number]) => {
    setEditingId(client._id);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormCompany(client.company ?? "");
    setFormAvatar(client.avatar ?? "👤");
    setFormPlan(client.plan ?? "starter");
    setFormChannel(client.channel ?? "");
    setFormChannelId(client.channelId ?? "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateClient({
          id: editingId,
          name: formName.trim(),
          email: formEmail.trim(),
          company: formCompany.trim() || undefined,
          avatar: formAvatar,
          plan: formPlan,
          channel: formChannel || undefined,
          channelId: formChannelId.trim() || undefined,
        });
        addToast("Client updated", "success");
      } else {
        await createClient({
          name: formName.trim(),
          email: formEmail.trim(),
          company: formCompany.trim() || undefined,
          avatar: formAvatar,
          plan: formPlan,
          channel: formChannel || undefined,
          channelId: formChannelId.trim() || undefined,
        });
        addToast(`Client "${formName.trim()}" created`, "success");
      }
      setShowModal(false);
      resetForm();
    } catch {
      addToast(editingId ? "Failed to update client" : "Failed to create client", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedClient = useQuery(
    api.clients.withProjects,
    selectedId ? { id: selectedId } : "skip"
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>Clients</h1>
            <p className="text-[12px] text-[#9c9590] mt-0.5">{clients?.length ?? 0} total</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#c2410c] text-white rounded-lg hover:bg-[#9a3412] transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Client
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-mc-border">
        <div className="flex gap-1">
          {(["all", "active", "inactive", "churned"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-2.5 py-1 text-xs rounded transition-colors capitalize font-mono-jb",
                filter === tab
                  ? "bg-mc-accent/10 text-mc-accent border border-mc-accent/30 font-medium"
                  : "text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* List */}
        <div className={cn(
          "overflow-y-auto",
          selectedId ? "w-80 flex-shrink-0 border-r border-mc-border" : "flex-1"
        )}>
          {!clients ? (
            <div className="p-4">
              <SkeletonList count={5} />
            </div>
          ) : filtered?.length === 0 ? (
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title={filter === "all" ? "No clients yet" : `No ${filter} clients`}
              description="Add a client to start organizing projects"
              action={{ label: "Add Client", onClick: openCreate }}
              className="h-full"
            />
          ) : (
            <div className="divide-y divide-mc-border">
              {filtered?.map((client) => {
                const sc = statusColors[client.status as ClientStatus] ?? statusColors.active;
                return (
                  <div
                    key={client._id}
                    onClick={() => setSelectedId(client._id)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors",
                      selectedId === client._id
                        ? "bg-mc-accent/10 border-l-[3px] border-l-mc-accent"
                        : "hover:bg-mc-bg-tertiary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">{client.avatar || "👤"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate text-mc-text">{client.name}</span>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 font-mono-jb font-semibold", sc.bg, sc.color)}>
                            {client.status}
                          </span>
                        </div>
                        <div className="text-xs text-mc-text-secondary truncate">
                          {client.company && `${client.company} · `}
                          {client.plan ?? "starter"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedId && selectedClient && (
          <div className="flex-1 overflow-y-auto p-4 animate-slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedClient.avatar || "👤"}</span>
                <div>
                  <h2 className="text-lg font-semibold text-[#1a1a1a]">{selectedClient.name}</h2>
                  <div className="text-[10px] text-mc-muted font-mono-jb uppercase tracking-wider">
                    {selectedClient.company || "Individual"}
                    <span className="mx-1.5">·</span>
                    {selectedClient.plan ?? "starter"} plan
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(selectedClient)}
                  className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text border border-mc-border rounded hover:bg-mc-bg-tertiary transition-colors font-mono-jb uppercase tracking-wide"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary rounded transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-mc-bg-secondary border border-mc-border rounded-lg p-4 mb-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-mc-text">
                <Mail className="w-4 h-4 text-mc-text-secondary" />
                <span>{selectedClient.email}</span>
              </div>
              {selectedClient.company && (
                <div className="flex items-center gap-2 text-sm text-mc-text">
                  <Building2 className="w-4 h-4 text-mc-text-secondary" />
                  <span>{selectedClient.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-mc-text">
                <CreditCard className="w-4 h-4 text-mc-text-secondary" />
                <span className="capitalize">{selectedClient.plan ?? "starter"} plan</span>
              </div>
              {selectedClient.channel && (
                <div className="flex items-center gap-2 text-sm text-mc-text">
                  <MessageSquare className="w-4 h-4 text-mc-text-secondary" />
                  <span className="capitalize">{selectedClient.channel}</span>
                  {selectedClient.channelId && (
                    <span className="text-mc-muted text-[10px] font-mono-jb">({selectedClient.channelId})</span>
                  )}
                </div>
              )}
              <div className="text-[10px] text-mc-muted pt-1.5 border-t border-mc-border font-mono-jb uppercase tracking-wider">
                Client since {formatTime(selectedClient.createdAt)}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                  Projects ({selectedClient.projects?.length ?? 0})
                </span>
              </div>
              <div className="divide-y divide-mc-border">
                {!selectedClient.projects?.length ? (
                  <div className="p-4 text-xs text-mc-text-secondary text-center">No projects yet</div>
                ) : (
                  selectedClient.projects.map((p) => (
                    <div key={p._id} className="px-4 py-2 hover:bg-mc-bg-tertiary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-mc-text">{p.name}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded capitalize font-mono-jb font-semibold",
                          p.status === "active" ? "bg-mc-accent-green/12 text-mc-accent-green" :
                          p.status === "review" ? "bg-mc-accent-yellow/12 text-mc-accent-yellow" :
                          p.status === "delivered" ? "bg-mc-accent/12 text-mc-accent" :
                          "bg-mc-bg-tertiary text-mc-text-secondary"
                        )}>
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-mc-text-secondary mt-0.5 font-mono-jb">{p.type}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingId ? "Edit Client" : "New Client"}
        size="md"
      >
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div>
            <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Avatar</label>
            <div className="flex gap-1.5 flex-wrap">
              {AVATARS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setFormAvatar(e)}
                  className={cn(
                    "w-8 h-8 rounded text-base flex items-center justify-center transition-colors",
                    formAvatar === e
                      ? "bg-mc-accent/20 ring-1 ring-mc-accent"
                      : "bg-mc-bg-tertiary hover:bg-mc-bg-tertiary/80"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Company</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              />
            </div>
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Plan</label>
              <select
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent capitalize"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Channel</label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent capitalize"
              >
                <option value="">None</option>
                {CHANNEL_OPTIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            {formChannel && (
              <div>
                <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Channel ID</label>
                <input
                  type="text"
                  value={formChannelId}
                  onChange={(e) => setFormChannelId(e.target.value)}
                  placeholder={formChannel === "whatsapp" ? "+1234567890" : "channel-id"}
                  className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formName.trim() || !formEmail.trim() || saving}
              className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
