import React from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export interface Alert {
  id: string;
  type: "warning" | "success" | "info" | "error";
  message: string;
}

interface AlertsPanelProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  error: AlertTriangle,
};

const styleMap = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  info:    "bg-blue-50 border-blue-200 text-blue-800",
  error:   "bg-red-50 border-red-200 text-red-800",
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts = [],
  onDismiss,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.type];
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${styleMap[alert.type]}`}
          >
            <Icon size={15} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{alert.message}</span>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
