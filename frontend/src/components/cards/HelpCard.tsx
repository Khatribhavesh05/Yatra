import React from 'react';
import { HelpContact } from '../../types';
import { Badge } from '../common/Badge';

export interface HelpCardProps {
  contact: HelpContact;
}

export const HelpCard: React.FC<HelpCardProps> = ({ contact }) => {
  const isEmergency = contact.category === 'emergency';

  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
        isEmergency
          ? 'border-error/30 bg-red-50/20 hover:border-error shadow-sm'
          : 'border-outline-variant bg-white hover:border-primary/50 shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge
            variant={isEmergency ? 'error' : contact.category === 'charging_support' ? 'secondary' : 'primary'}
            size="sm"
          >
            {contact.category.replace(/_/g, ' ').toUpperCase()}
          </Badge>

          {contact.availability && (
            <span className="text-[11px] text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded">
              {contact.availability}
            </span>
          )}
        </div>

        <h4 className="font-headline-sm text-base font-bold text-on-background mt-2 mb-1">
          {contact.department}
        </h4>

        {contact.name && (
          <p className="text-xs text-on-surface font-semibold mb-1">{contact.name}</p>
        )}

        {contact.description && (
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            {contact.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-3 mt-auto">
        {contact.phone && (
          <a
            href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-2 bg-primary text-white hover:bg-on-primary-fixed-variant px-3.5 py-2 rounded text-xs font-label-bold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">call</span>
            <span>{contact.phone}</span>
          </a>
        )}

        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-label-bold hover:underline"
          >
            <span className="material-symbols-outlined text-sm">mail</span>
            <span>{contact.email}</span>
          </a>
        )}
      </div>
    </div>
  );
};
