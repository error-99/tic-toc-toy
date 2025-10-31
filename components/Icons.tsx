
import React from 'react';

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4L48 48" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
        <path d="M48 4L4 48" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    </svg>
);

export const OIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="22" stroke="currentColor" strokeWidth="8"/>
    </svg>
);
