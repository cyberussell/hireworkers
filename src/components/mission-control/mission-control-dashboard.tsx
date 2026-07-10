"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CANDIDATE_CATEGORY_LABELS } from "@/types/candidate";
import type { SkillProfileStat } from "@/lib/db/mission-control-stats-db";

interface Stats {
  totalSkills: number;
  totalProfiles: number;
  unmatchedProfiles: number;
  skills: SkillProfileStat[];
}

function groupByCategory(skills: SkillProfileStat[]) {
  const groups = new Map<string, SkillProfileStat[]>();
  for (const skill of skills) {
    const list = groups.get(skill.category) ?? [];
    list.push(skill);
    groups.set(skill.category, list);
  }
  return Array.from(groups.entries())
    .map(([category, categorySkills]) => ({
      category,
      label:
        CANDIDATE_CATEGORY_LABELS[
          category as keyof typeof CANDIDATE_CATEGORY_LABELS
        ] ?? category,
      skills: categorySkills.sort((a, b) => b.profileCount - a.profileCount),
      profileCount: categorySkills.reduce((sum, s) => sum + s.profileCount, 0),
    }))
    .sort((a, b) => b.profileCount - a.profileCount);
}

export function MissionControlDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/mission-control/stats")
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const maxProfileCount = Math.max(1, ...stats.skills.map((s) => s.profileCount));
  const groups = groupByCategory(stats.skills);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Skills with a published assessment, and how many profiles fall
          under each.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skills with assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">{stats.totalSkills}</span>
          </CardContent>
        </Card>
        <Card className="gap-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">{stats.totalProfiles}</span>
          </CardContent>
        </Card>
        <Card className="gap-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unmatched profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">
              {stats.unmatchedProfiles}
            </span>
            <p className="text-xs text-muted-foreground">
              No skill in the catalog matches their title yet
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <Card key={group.category} className="gap-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{group.label}</span>
                <Badge variant="secondary">
                  {group.profileCount}{" "}
                  {group.profileCount === 1 ? "profile" : "profiles"} ·{" "}
                  {group.skills.length}{" "}
                  {group.skills.length === 1 ? "skill" : "skills"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {group.skills.map((skill) => (
                <div key={skill.slug} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{skill.displayName}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {skill.profileCount}
                    </span>
                  </div>
                  <Progress value={(skill.profileCount / maxProfileCount) * 100} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No skills in the catalog yet.
          </p>
        )}
      </div>
    </div>
  );
}
