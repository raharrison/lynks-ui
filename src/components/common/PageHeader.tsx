interface PageHeaderProps {
    title: React.ReactNode;
    /** Muted text beside the title, such as a count. */
    meta?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

export default function PageHeader({title, meta, actions, children}: PageHeaderProps) {
    return (
        <div className="page-header">
            <div className="page-header-row">
                <div className="page-header-title">
                    <h1>{title}</h1>
                    {meta != null && meta !== false && <span className="page-header-meta">{meta}</span>}
                </div>
                {actions && <div className="page-header-actions">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
