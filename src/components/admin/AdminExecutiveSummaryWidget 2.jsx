import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateExecutiveSummary } from '../../services/adminAiService';
import Bot from 'lucide-react/dist/esm/icons/bot';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import styles from './AdminExecutiveSummaryWidget.module.css';

export default function AdminExecutiveSummaryWidget({ metrics }) {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchSummary = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await generateExecutiveSummary(metrics);
                if (isMounted) {
                    setSummary(result);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Unable to load AI insights at this time.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Only fetch if we have some metrics
        if (metrics && Object.keys(metrics).length > 0) {
            fetchSummary();
        } else {
            setIsLoading(false);
            setSummary('Waiting for metrics to generate insights...');
        }

        return () => {
            isMounted = false;
        };
    }, [metrics]);

    return (
        <div className={styles.widgetContainer}>
            <div className={styles.header}>
                <div className={styles.titleWrapper}>
                    <div className={styles.iconWrapper}>
                        <Bot size={20} className={styles.botIcon} />
                        {isLoading && <Sparkles size={12} className={styles.sparkleIcon} />}
                    </div>
                    <h3 className={styles.title}>Atlas AI Executive Summary</h3>
                </div>
                <div className={styles.badge}>Live Analysis</div>
            </div>

            <div className={styles.content}>
                {isLoading ? (
                    <div className={styles.skeletonContainer}>
                        <div className={styles.skeletonLine} style={{ width: '100%' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '90%' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '95%' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                    </div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <div className={styles.markdownWrapper}>
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
