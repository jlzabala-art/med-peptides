import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Star from "lucide-react/dist/esm/icons/star";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import React, { memo } from 'react';








/* ─── helpers (fuera del componente para no recrearlos en cada render) ─── */

const STATUS_MAP = {
  pass:      { icon: CheckCircle2, color: 'var(--color-success)', label: 'Validated' },
  warning:   { icon: AlertTriangle, color: '#f59e0b', label: 'Warning'  },
  blocked:   { icon: XCircle,       color: 'var(--color-danger)', label: 'Rejected' },
  generated: { icon: Clock,         color: '#6b7280', label: 'Generated'},
};

function getStatusMeta(status) {
  return STATUS_MAP[status] ?? { icon: Clock, color: '#6b7280', label: status };
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try { return dateFormatter.format(new Date(dateStr)); }
  catch { return 'N/A'; }
}

/* ─── custom comparison: solo re-renderiza si cambian los campos visibles ─── */
function arePropsEqual(prev, next) {
  return (
    prev.protocol.id            === next.protocol.id            &&
    prev.protocol.isFavorite    === next.protocol.isFavorite    &&
    prev.protocol.status        === next.protocol.status        &&
    prev.protocol.primaryCondition === next.protocol.primaryCondition &&
    prev.protocol.confidenceScore  === next.protocol.confidenceScore
  );
}

/* ─── ProtocolItem ─── */
function ProtocolItem({ protocol: p, onNavigate, onToggleFavorite, onDelete }) {
  const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusMeta(p.status);

  return (
    <div
      className="ph-item"
      onClick={() => onNavigate(p.id)}
      role="button"
      tabIndex={0}
      aria-label={`Open protocol: ${p.primaryCondition}`}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate(p.id)}
    >
      {/* Status icon */}
      <div className="ph-item__status-icon">
        <StatusIcon size={16} color={statusColor} />
      </div>

      {/* Main info */}
      <div className="ph-item__info">
        <h3 className="ph-item__title">{p.primaryCondition}</h3>
        <div className="ph-item__meta">
          <span className="ph-item__date">
            <Clock size={13} />
            {formatDate(p.createdAt)}
          </span>
          <span className="ph-item__score">Score: {p.confidenceScore}%</span>
          {p.isPublic && <span className="ph-item__badge ph-item__badge--public">Public</span>}
        </div>
      </div>

      {/* Status label */}
      <div className="ph-item__status-label">
        <span className="ph-item__status-key">Status</span>
        <span className="ph-item__status-value" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>

      {/* Favorite — touch target 44×44 */}
      <button
        className={`ph-item__btn ph-item__btn--star${p.isFavorite ? ' is-active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id, p.isFavorite); }}
        aria-label={p.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        title={p.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star
          size={18}
          fill={p.isFavorite ? 'var(--primary)' : 'transparent'}
          color={p.isFavorite ? 'var(--primary)' : 'var(--text-muted)'}
        />
      </button>

      {/* Delete — touch target 44×44 */}
      {onDelete && (
        <button
          className="ph-item__btn ph-item__btn--delete"
          onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
          aria-label={`Delete protocol ${p.primaryCondition}`}
          title="Delete protocol"
        >
          <Trash2 size={16} />
        </button>
      )}

      <ChevronRight size={18} className="ph-item__chevron" />
    </div>
  );
}

export default memo(ProtocolItem, arePropsEqual);