import React from 'react';
import { Link } from 'react-router-dom';

export interface ServiceCardProps {
  title: string;
  category: string;
  categoryIcon: string;
  description: string;
  link: string;
  linkText?: string;
  imageUrl?: string;
  badgeText?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  category,
  categoryIcon,
  description,
  link,
  linkText = 'Explore Fleet',
  imageUrl,
  badgeText,
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group h-full">
      {/* Category Header */}
      <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between text-secondary bg-surface-container-low/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">{categoryIcon}</span>
          <span className="font-label-bold text-label-bold text-xs uppercase tracking-wider">{category}</span>
        </div>
        {badgeText && (
          <span className="bg-white text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-outline-variant">
            {badgeText}
          </span>
        )}
      </div>

      {/* Image / Illustration Container */}
      {imageUrl && (
        <div className="relative w-full h-48 bg-surface-container-low flex items-center justify-center p-6 overflow-hidden">
          <img
            alt={title}
            src={imageUrl}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-headline-sm text-xl text-on-background mb-2 font-bold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="font-body-md text-sm text-on-surface-variant mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        {/* CTA Link */}
        <Link
          to={link}
          className="inline-flex items-center justify-between w-full text-primary font-label-bold text-sm hover:text-on-primary-fixed-variant transition-colors mt-auto pt-3 border-t border-outline-variant/40"
        >
          <span>{linkText}</span>
          <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
