"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CANDIDATE_CATEGORY_LABELS } from "@/types/candidate";

interface MissingTradeRequest {
  id: string;
  professional_title: string;
  category: string;
  request_count: number;
  created_at: string;
}

type RowStatus = "idle" | "working" | "done" | "error";

export function MissionControlRequestsPanel() {
  const [requests, setRequests] = useState<MissingTradeRequest[] | null>(null);
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});

  function load() {
    fetch("/api/mission-control/requests")
      .then((response) => response.json())
      .then((data) => setRequests(data.requests ?? []))
      .catch(() => setRequests([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function generate(request: MissingTradeRequest) {
    setRowStatus((prev) => ({ ...prev, [request.id]: "working" }));
    try {
      const response = await fetch("/api/mission-control/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestIds: [request.id] }),
      });
      if (!response.ok) {
        setRowStatus((prev) => ({ ...prev, [request.id]: "error" }));
        return;
      }
      setRowStatus((prev) => ({ ...prev, [request.id]: "done" }));
      setRequests((prev) => prev?.filter((r) => r.id !== request.id) ?? null);
    } catch {
      setRowStatus((prev) => ({ ...prev, [request.id]: "error" }));
    }
  }

  async function dismiss(request: MissingTradeRequest) {
    setRowStatus((prev) => ({ ...prev, [request.id]: "working" }));
    try {
      const response = await fetch("/api/mission-control/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id }),
      });
      if (!response.ok) {
        setRowStatus((prev) => ({ ...prev, [request.id]: "error" }));
        return;
      }
      setRequests((prev) => prev?.filter((r) => r.id !== request.id) ?? null);
    } catch {
      setRowStatus((prev) => ({ ...prev, [request.id]: "error" }));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
        <p className="text-sm text-muted-foreground">
          Job titles with no assessment/growth content yet — each was queued
          when someone&apos;s profile didn&apos;t match an existing trade.
        </p>
      </div>

      {requests === null && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
      {requests?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing pending — every known title is covered.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {requests?.map((request) => {
          const status = rowStatus[request.id] ?? "idle";
          return (
            <Card key={request.id} className="gap-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{request.professional_title}</span>
                  <Badge variant="secondary">
                    {request.request_count}{" "}
                    {request.request_count === 1 ? "person" : "people"} waiting
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  {CANDIDATE_CATEGORY_LABELS[
                    request.category as keyof typeof CANDIDATE_CATEGORY_LABELS
                  ] ?? request.category}
                </span>
                <div className="flex items-center gap-2">
                  {status === "error" && (
                    <span className="text-xs text-danger">Failed</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={status === "working"}
                    onClick={() => dismiss(request)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    disabled={status === "working"}
                    onClick={() => generate(request)}
                  >
                    {status === "working" ? "Building…" : "Generate & publish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
