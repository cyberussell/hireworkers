import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GOVERNMENT_ID_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type GovernmentIdType,
  type PaymentMethod,
} from "@/types/candidate";
import type { SeekerProfileDraft } from "@/types/seeker-profile-draft";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-base";
const selectClass = inputClass;
const labelClass = "text-sm font-medium text-muted-foreground";

const RATE_TYPE_OPTIONS: {
  value: SeekerProfileDraft["rateType"];
  label: string;
}[] = [
  { value: "daily", label: "Per day" },
  { value: "contract", label: "Per contract/project" },
  { value: "not_specified", label: "Not sure yet" },
];

type FieldsProps = {
  draft: SeekerProfileDraft;
  onChange: (draft: SeekerProfileDraft) => void;
};

export function RateField({ draft, onChange }: FieldsProps) {
  const hourlyRate =
    draft.rateType === "daily" && draft.dailyRate
      ? Math.round((draft.dailyRate / 8) * 100) / 100
      : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>How you charge</span>
        <select
          value={draft.rateType}
          onChange={(event) =>
            onChange({
              ...draft,
              rateType: event.target.value as SeekerProfileDraft["rateType"],
            })
          }
          className={selectClass}
        >
          {RATE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {draft.rateType === "daily" && (
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Rate per day (PHP)</span>
          <input
            type="number"
            min={0}
            value={draft.dailyRate ?? ""}
            onChange={(event) =>
              onChange({
                ...draft,
                dailyRate: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            className={inputClass}
            aria-label="Rate per day in PHP"
          />
          {hourlyRate !== null && (
            <span className="text-sm text-muted-foreground">
              ≈ ₱{hourlyRate.toLocaleString()} / hour
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function PaymentMethodsField({ draft, onChange }: FieldsProps) {
  function toggle(method: PaymentMethod) {
    const current = draft.paymentMethods ?? [];
    const next = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    onChange({ ...draft, paymentMethods: next });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>How you&apos;d like to be paid</span>
      <div className="flex flex-wrap gap-3">
        {(
          Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={(draft.paymentMethods ?? []).includes(value)}
              onChange={() => toggle(value)}
              className="size-4 rounded border-border"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function GovernmentIdFields({ draft, onChange }: FieldsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <span className={labelClass}>
        Government ID (optional) — not shown publicly, doesn&apos;t verify
        your profile by itself, just saved on file for later
      </span>
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          value={draft.governmentIdType ?? ""}
          onChange={(event) =>
            onChange({
              ...draft,
              governmentIdType: (event.target.value || undefined) as
                | GovernmentIdType
                | undefined,
            })
          }
          className={inputClass}
          aria-label="Government ID type"
        >
          <option value="">Select ID type</option>
          {(
            Object.entries(GOVERNMENT_ID_TYPE_LABELS) as [
              GovernmentIdType,
              string,
            ][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={draft.governmentIdNumber ?? ""}
          onChange={(event) =>
            onChange({ ...draft, governmentIdNumber: event.target.value })
          }
          placeholder="ID number"
          className={inputClass}
          aria-label="Government ID number"
        />
      </div>
    </div>
  );
}

export function ProfilePaymentPanel({ draft, onChange }: FieldsProps) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-base">
        <RateField draft={draft} onChange={onChange} />
        <PaymentMethodsField draft={draft} onChange={onChange} />
      </CardContent>
    </Card>
  );
}

export function ProfileIdentificationPanel({ draft, onChange }: FieldsProps) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Identification
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-base">
        <GovernmentIdFields draft={draft} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
