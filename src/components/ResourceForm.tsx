"use client";

import { useId, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api/errors";
import type { FieldSpec } from "@/lib/api/contract";
import { buildPayload, validateAll } from "@/lib/validation";

const INPUT_MODE: Record<FieldSpec["kind"], "text" | "numeric" | "tel" | "decimal"> = {
  text: "text",
  uuid: "text",
  phone: "tel",
  decimal: "decimal",
  date: "text",
};

export function ResourceForm(props: {
  specs: FieldSpec[];
  options?: Record<string, { value: string; label: string }[]>;
  disabledOptions?: string[];
  optionPlaceholders?: Record<string, string>;
  initial?: Record<string, string>;
  submitLabel: string;
  /** PATCH mode: only changed fields are sent, and at least one must change. */
  patch?: boolean;
  onSubmit: (payload: Record<string, string>) => Promise<void>;
  successMessage?: string;
}) {
  const uid = useId();
  const [values, setValues] = useState<Record<string, string>>(props.initial ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setFormError(null);
    const found = validateAll(props.specs, values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = buildPayload(props.specs, values, props.patch ? props.initial : undefined);
    if (props.patch && Object.keys(payload).length === 0) {
      setFormError("No changes to save.");
      return;
    }
    setBusy(true);
    try {
      await props.onSubmit(payload);
      setSuccess(props.successMessage ?? "Saved.");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(err.message);
      } else {
        setFormError("Unexpected error. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="form" aria-busy={busy}>
      {props.specs.map((s) => {
        const id = `${uid}-${s.name}`;
        const err = errors[s.name];
        const options = props.options?.[s.name];
        return (
          <div key={s.name} className="field">
            <label htmlFor={id}>
              {s.label}
              {s.required && <span aria-hidden="true"> *</span>}
            </label>
            {options ? <select
              id={id}
              name={s.name}
              value={values[s.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.name]: e.target.value }))}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${id}-err` : undefined}
              disabled={props.disabledOptions?.includes(s.name)}
              required={s.required && !props.patch}
            >
              <option value="">{props.optionPlaceholders?.[s.name] ?? "Choose an option"}</option>
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select> : <input
              id={id}
              name={s.name}
              type="text"
              inputMode={INPUT_MODE[s.kind]}
              autoComplete="off"
              placeholder={s.kind === "date" ? "YYYY-MM-DD" : undefined}
              value={values[s.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.name]: e.target.value }))}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${id}-err` : s.help ? `${id}-help` : undefined}
              required={s.required && !props.patch}
            />}
            {s.help && !err && (
              <p id={`${id}-help`} className="help">
                {s.help}
              </p>
            )}
            {err && (
              <p id={`${id}-err`} className="field-error" role="alert">
                {err}
              </p>
            )}
          </div>
        );
      })}
      {formError && Object.keys(errors).length === 0 && (
        <p role="alert" className="form-error">
          {formError}
        </p>
      )}
      {success && (
        <p role="status" className="form-success">
          {success}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : props.submitLabel}
      </button>
    </form>
  );
}
