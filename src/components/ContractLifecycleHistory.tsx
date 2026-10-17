import React from 'react';
import { ContractRelationship } from '../types/index.ts';

interface ContractLifecycleHistoryProps {
  entries?: ContractRelationship['lifecycleHistory'];
}

export const ContractLifecycleHistory: React.FC<ContractLifecycleHistoryProps> = ({ entries = [] }) => (
  <section className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
    <div>
      <h3 className="font-heading text-base font-bold text-neutral-900">Lifecycle History</h3>
      <p className="text-xs text-neutral-500">Updates recorded on the shared contract relationship</p>
    </div>
    {entries.length === 0 ? (
      <p className="text-xs text-neutral-500">No lifecycle stage changes have been recorded yet.</p>
    ) : (
      <ol className="space-y-3">
        {[...entries].reverse().map((entry, index) => (
          <li
            key={`${entry.recordedAt}-${index}`}
            className="border-l-2 border-emerald-700 pl-4 py-1 space-y-1"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-neutral-900 capitalize">
                {entry.previousStage.replace(/_/g, ' ')} → {entry.newStage.replace(/_/g, ' ')}
                {entry.previousStatus !== entry.newStatus &&
                  ` · ${entry.previousStatus} → ${entry.newStatus}`}
                <span className="ml-2 font-normal text-neutral-500">
                  ({entry.progressPercentage}% · {entry.actorRole})
                </span>
              </p>
              <time className="text-[11px] text-neutral-400">
                {new Date(entry.recordedAt).toLocaleString('en-IN')}
              </time>
            </div>
            {entry.notes && <p className="text-xs text-neutral-600">{entry.notes}</p>}
          </li>
        ))}
      </ol>
    )}
  </section>
);
