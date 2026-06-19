import React from 'react';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Truck from 'lucide-react/dist/esm/icons/truck';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import styles from './AdminExecutiveSummaryWidget.module.css';
import { useNavigate } from 'react-router-dom';

export default function AdminExecutiveSummaryWidget({ metrics = {} }) {
  const navigate = useNavigate();

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconWrapper}>
            <Sparkles size={18} className={styles.sparkleIcon} />
          </div>
          <h3 className={styles.title}>Executive AI Brief</h3>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot}></span>
            AI Analysis Live
          </span>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.impactBadge}>Impact: +AED 24,000 projected</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card} onClick={() => navigate('/admin/finance-overview')}>
          <div className={`${styles.iconContainer} ${styles.revenueIcon}`}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.cardValue}>
                AED {metrics.revenue?.toLocaleString() || '0'}
              </span>
              <ArrowUpRight size={14} className={styles.arrowIcon} />
            </div>
            <span className={styles.cardLabel}>Real Revenue Generated</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => navigate('/admin/rfq')}>
          <div className={`${styles.iconContainer} ${styles.rfqIcon}`}>
            <FileText size={18} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.cardValue}>{metrics.openRFQs || '0'} RFQs</span>
              <ArrowUpRight size={14} className={styles.arrowIcon} />
            </div>
            <span className={styles.cardLabel}>Active RFQs Pending</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => navigate('/admin/orders')}>
          <div className={`${styles.iconContainer} ${styles.shipmentIcon}`}>
            <Truck size={18} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.cardValue}>{metrics.openOrders || '0'} Orders</span>
              <ArrowUpRight size={14} className={styles.arrowIcon} />
            </div>
            <span className={styles.cardLabel}>Pending Order Processing</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => navigate('/admin/users')}>
          <div className={`${styles.iconContainer} ${styles.inventoryIcon}`}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.cardValue}>{metrics.pendingApprovals || '0'} Approvals</span>
              <ArrowUpRight size={14} className={styles.arrowIcon} />
            </div>
            <span className={styles.cardLabel}>Users Pending Approval</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => navigate('/admin/rfq')}>
            Review RFQs
          </button>
          <button className={styles.actionBtn} onClick={() => navigate('/admin/products')}>
            View Inventory
          </button>
          <button
            className={`${styles.actionBtn} ${styles.askAtlasBtn}`}
            onClick={() => navigate('/admin/ai-agents')}
          >
            Ask Atlas AI
          </button>
        </div>
      </div>
    </div>
  );
}
