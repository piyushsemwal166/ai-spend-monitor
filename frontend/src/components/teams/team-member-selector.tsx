"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { organizationService } from "@/services/organizationService";
import { cn } from "@/lib/utils";

interface TeamMemberSelectorProps {
  organizationId?: string;
  selectedIds: string[];
  onChange: (memberIds: string[]) => void;
  lockedIds?: string[];
  helperText?: string;
}

export function TeamMemberSelector({ organizationId, selectedIds, onChange, lockedIds = [], helperText }: TeamMemberSelectorProps) {
  const [search, setSearch] = useState("");

  const organizationQuery = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => organizationService.getOrganizationById(organizationId!),
    enabled: Boolean(organizationId),
  });

  const members = organizationQuery.data?.members ?? [];

  const visibleMembers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return members.filter((member) => {
      if (selectedIds.includes(member.user.id)) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return member.user.name.toLowerCase().includes(normalized) || member.user.email.toLowerCase().includes(normalized);
    });
  }, [members, search, selectedIds]);

  const selectedMembers = useMemo(
    () => members.filter((member) => selectedIds.includes(member.user.id)),
    [members, selectedIds],
  );

  const addMember = (userId: string) => {
    onChange(Array.from(new Set([...selectedIds, userId])));
  };

  const removeMember = (userId: string) => {
    if (lockedIds.includes(userId)) {
      return;
    }

    onChange(selectedIds.filter((id) => id !== userId));
  };

  if (!organizationId) {
    return (
      <Card className="border-dashed border-slate-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5">
        <CardContent className="p-5 text-sm text-slate-500 dark:text-slate-400">Select an organization first to load team members.</CardContent>
      </Card>
    );
  }

  if (organizationQuery.isLoading) {
    return <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-5 text-sm text-slate-500 dark:text-slate-400">Loading organization members...</CardContent></Card>;
  }

  if (organizationQuery.isError) {
    return <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55"><CardContent className="p-5 text-sm text-rose-600 dark:text-rose-300">Unable to load organization members.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-cyan-500/15 bg-cyan-500/8 p-4 text-sm text-cyan-950 dark:text-cyan-100">
        <p className="font-medium">Member selector</p>
        <p className="mt-1 text-cyan-950/70 dark:text-cyan-100/75">
          Search organization members by name or email. The team creator will be added automatically as OWNER.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users by name or email" />
            </div>
            <div className="space-y-2">
              {visibleMembers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200/80 px-4 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  No matching users found.
                </p>
              ) : (
                visibleMembers.map((member) => (
                  <button
                    key={member.user.id}
                    type="button"
                    onClick={() => addMember(member.user.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50/80 dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-500/10"
                  >
                    <div>
                      <p className="font-medium text-slate-950 dark:text-white">{member.user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.user.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      <Check className="h-4 w-4" />
                      Add
                    </span>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/75 dark:bg-slate-950/55">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-slate-950 dark:text-white">Selected members</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{helperText ?? `${selectedMembers.length} users selected.`}</p>
            </div>
            <div className="space-y-3">
              {selectedMembers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200/80 px-4 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  No members selected yet.
                </p>
              ) : (
                selectedMembers.map((member) => (
                  <div key={member.user.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950 dark:text-white">{member.user.name}</p>
                        <Badge variant={member.role === "OWNER" ? "success" : "default"}>{member.role}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.user.email}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.user.id)}
                      disabled={lockedIds.includes(member.user.id)}
                      className={cn(lockedIds.includes(member.user.id) && "pointer-events-none opacity-50")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
