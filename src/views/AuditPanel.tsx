import React from 'react';
import { COPY } from '../copy';
import type { Session, Step } from '../core/types';

export const AuditPanel: React.FC<{ session: Session; step: Step }> = ({ session, step }) => {
  const parent = session.steps.find((s) => s.id === step.parentId) ?? null;
  const sourceLine =
    step.source === 'rules' ? COPY.auditSourceRules
    : step.source === 'model' ? COPY.auditSourceModel
    : COPY.auditSourceRegated;

  return (
    <aside className="audit" aria-label={COPY.auditHeading}>
      <h3>{COPY.auditHeading}</h3>
      {parent && (
        <p>{COPY.auditFrom}: <em>&ldquo;{parent.text}&rdquo;</em></p>
      )}
      {parent && parent.check.barriers.length > 0 && (
        <ul>
          {parent.check.barriers.map((b, i) => (
            <li key={b}>{parent.check.explanations[i]} <code>{b}</code></li>
          ))}
        </ul>
      )}
      <p>{sourceLine}</p>
      {step.rejectedProposal && (
        <p>
          The model proposed <em>&ldquo;{step.rejectedProposal}&rdquo;</em> and the
          checker rejected it for <code>{step.rejectedFor}</code>.
        </p>
      )}
      <p style={{ marginBottom: 0, color: 'var(--ink-soft)' }}>{COPY.auditAuthority}</p>
    </aside>
  );
};
