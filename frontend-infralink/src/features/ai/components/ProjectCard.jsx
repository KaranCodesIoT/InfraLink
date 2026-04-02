import React from 'react';
import { Building2, Box } from 'lucide-react';

export default function ProjectCard({ project, onViewAR }) {
    const statusClass = (project.status || 'planning').toLowerCase().includes('active') ? 'active'
        : (project.status || '').toLowerCase().includes('complet') ? 'completed'
        : 'planning';

    const budgetStr = project.budget
        ? `₹${Number(project.budget).toLocaleString('en-IN')}`
        : 'Budget N/A';

    const imageUrl = project.images?.[0]?.url || project.images?.[0];

    return (
        <div className="project-card">
            <div className="project-image">
                {imageUrl
                    ? <img src={imageUrl} alt={project.title} />
                    : <Building2 size={32} style={{ color: 'rgba(16,185,129,0.3)' }} />
                }
            </div>
            <div className="project-info">
                <div className="project-title">{project.title || 'Untitled Project'}</div>
                <div className="project-budget">{budgetStr}</div>
                <span className={`project-status ${statusClass}`}>
                    {project.status || 'Planning'}
                </span>
                {project.model3DUrl && (
                    <button
                        className="project-ar-btn"
                        onClick={(e) => { e.stopPropagation(); onViewAR?.(project); }}
                    >
                        <Box size={12} /> View in 3D/AR
                    </button>
                )}
            </div>
        </div>
    );
}
