import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface EditableFieldProps {
  label: string;
  value: string;
  editMode: boolean;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  type?: "text" | "date" | "email" | "tel" | "textarea" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

const EditableField = ({
  label,
  value,
  editMode,
  onChange,
  icon,
  className,
  type = "text",
  options,
  placeholder,
}: EditableFieldProps) => {
  if (!editMode) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {icon}
          {value || "—"}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || label}
          className="text-sm min-h-[80px]"
        />
      ) : type === "select" && options ? (
        <Select value={value} onValueChange={(v) => onChange?.(v)}>
          <SelectTrigger className="text-sm h-9">
            <SelectValue placeholder={placeholder || label} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || label}
          className="text-sm h-9"
        />
      )}
    </div>
  );
};

export default EditableField;
