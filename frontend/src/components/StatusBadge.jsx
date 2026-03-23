import React from 'react';
import { Check, X, Clock } from 'lucide-react';

const configs = {
  Yes:       { cls: 'status-yes',    Icon: Check,  label: 'Yes' },
  No:        { cls: 'status-no',     Icon: X,      label: 'No' },
  'In Future': { cls: 'status-future', Icon: Clock, label: 'In Future' },
};

export default function StatusBadge({ status }) {
  const cfg = configs[status] || configs['No'];
  const { cls, Icon, label } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {label}
    </span>
  );
}
