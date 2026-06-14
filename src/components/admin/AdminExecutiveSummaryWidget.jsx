import React from 'react';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import styles from './AdminExecutiveSummaryWidget.module.css';
import { useNavigate } from 'react-router-dom';

export default function AdminExecutiveSummaryWidget() {
  const navigate = useNavigate();

  // In a real scenario, this data would come from the AI backend based on metrics.
  // We are implementing the static structure of the Executive AI Brief per rules.
  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconWrapper}>
            <Sparkles size={18} />
          </div>
          <h3 className={styles.title}>Executive AI Brief</h3>
        </div>
      </div>

      <div className={styles.content}>
        <ul className={styles.bullets}>
          <li>
            Revenue <strong>+18%</strong> vs last month
          </li>
          <li>
            <strong>3 RFQs</strong> require immediate approval
          </li>
          <li>
            <strong>2 delayed shipments</strong> from EU suppliers
          </li>
          <li>
            Inventory risk: <strong>Thymulin</strong>
          </li>
        </ul>

        <div>
          <span className={styles.impact}>Impact: +AED 24,000 projected</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => navigate('/admin/rfq')}>
            Review RFQs
          </button>
          <button className={styles.actionBtn} onClick={() => navigate('/admin/products')}>
            View Inventory
          </button>
          <button className={styles.actionBtn}>Ask Atlas</button>
        </div>
      </div>
    </div>
  );
}
