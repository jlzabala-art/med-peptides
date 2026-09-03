"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { Bot, ArrowRight, ShoppingCart, BookOpen, Check, Activity, Beaker, FlaskConical } from '@/lib/icons';

// Icons









export default function UniversalProductCard({
  product,
  onAddToCart,
  onClick,
  viewMode = 'grid', // 'grid' | 'list'
  showImage = true,
  badge, // Support custom badge prop (string or object {text, type})
  tags = [] // Support custom tags array
}) {
  const { userProfile, isProfessional } = useAuth();
  const { isTenantMode } = useTenant();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  // 1. Determine Contextual Role
  // priority: Tenant (Wholesaler) > Doctor (Medical) > Patient > B2C (Guest/Retail)
  const role = isTenantMode ? 'wholesaler' 
             : userProfile?.role === 'doctor' ? 'doctor'
             : userProfile?.role === 'patient' ? 'patient'
             : isProfessional ? 'professional' 
             : 'retail';

  // 2. Data Normalization
  const variants = product?.variants || product?.allStrengths || [];
  const hasVariants = variants.length > 0;
  
  const displayTitle = product?.displayName || product?.name || 'Unknown Product';
  const displayCategory = product?.category || 'Research Supplies';
  const displayDesc = product?.desc || product?.description || '';
  const price = product?.price || 0; // In a real app, calculate based on selectedVariantIdx

  const imagePath = `/assets/vials/${displayTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

  // 3. Action Handlers
  const handleClinicAI = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: `Tell me about ${displayTitle}.`, autoSend: true },
      })
    );
  };

  const handleAddAction = (e) => {
    e.stopPropagation();
    if (!onAddToCart) return;
    onAddToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // 4. Contextual UI Elements
  const renderActions = () => {
    if (role === 'doctor') {
      return (
        <>
          <button className="col-card-btn col-card-btn--ghost" onClick={handleClinicAI}>
            <Bot size={14} /> AI Consult
          </button>
          <button className="col-card-btn col-card-btn--accent" onClick={handleAddAction}>
            {justAdded ? <Check size={14} /> : <Activity size={14} />} 
            {justAdded ? 'Added' : 'Prescribe'}
          </button>
        </>
      );
    }
    
    if (role === 'patient') {
      return (
        <button className="col-card-btn col-card-btn--accent" style={{ width: '100%' }} onClick={onClick}>
          View Treatment Info <ArrowRight size={14} />
        </button>
      );
    }

    if (role === 'wholesaler') {
      return (
        <button className="col-card-btn col-card-btn--accent" style={{ width: '100%' }} onClick={handleAddAction}>
          {justAdded ? <Check size={14} /> : <ShoppingCart size={14} />} 
          {justAdded ? 'Added to Quote' : 'Add to RFQ'}
        </button>
      );
    }

    // Default B2C / Retail
    return (
      <>
        <button className="col-card-btn col-card-btn--ghost" onClick={handleClinicAI}>
          <Bot size={14} /> ClinicAI
        </button>
        <button className="col-card-btn col-card-btn--accent" onClick={handleAddAction}>
          {justAdded ? <Check size={14} /> : <ShoppingCart size={14} />} 
          {justAdded ? 'Added' : 'Add to Cart'}
        </button>
      </>
    );
  };

  const renderMetadata = () => {
    if (role === 'doctor' || role === 'wholesaler' || role === 'professional') {
      return (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
          {product.cas && <span>CAS: {product.cas}</span>}
          {product.purity && <span>Purity: {product.purity}</span>}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.article 
      className={`col-card ${viewMode === 'list' ? 'col-card--list' : 'col-card--grid'}`}
      style={{ 
        position: 'relative', 
        cursor: 'pointer',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: viewMode === 'list' ? 'row' : 'column',
        flexWrap: viewMode === 'list' ? 'wrap' : 'nowrap',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      onClick={onClick}
    >
      {/* Visual Header (Vial or Icon) */}
      {/* Image Section */}
      <div style={{
        flex: viewMode === 'list' ? '0 0 160px' : '1 0 160px',
        background: 'rgba(26, 115, 232, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: viewMode === 'list' ? 'auto' : '180px'
      }}>
        {/* We can overlay badges on the image as well, similar to old cards */}
        {badgeText && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: badgeType === 'ai' ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : badgeType === 'rx' ? '#EF4444' : 'var(--primary)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {badgeText}
          </div>
        )}

        {showImage && imagePath ? (
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <Image 
              src={imagePath} 
              alt={displayTitle} 
              fill
              sizes="120px"
              style={{ objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.src = '/assets/vials/generic-vial.png'; e.currentTarget.srcset = '' }}
            />
          </div>
        ) : (
          <FlaskConical size={48} color="var(--primary)" />
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', flex: '2 1 240px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {displayTitle}
            </h3>
            {renderMetadata()}
            
            {/* Custom Tags */}
            {tags && tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {tags.slice(0, 3).map((t, i) => (
                  <span key={i} style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(26, 115, 232, 0.1)',
                    color: 'var(--primary)',
                    fontWeight: 600
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Price (hide for patients unless explicit) */}
          {role !== 'patient' && (
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
              ${price.toFixed(2)}
            </div>
          )}
        </div>

        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem', 
          marginTop: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: viewMode === 'list' ? 3 : 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {displayDesc}
        </p>

        {/* Variants/Strengths (Only for pros/b2c, hide for patients) */}
        {hasVariants && role !== 'patient' && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {variants.slice(0, 4).map((v, i) => (
              <button 
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedVariantIdx(i); }}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '99px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${selectedVariantIdx === i ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedVariantIdx === i ? 'var(--primary-light)' : 'transparent',
                  color: selectedVariantIdx === i ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {typeof v === 'string' ? v : v.dosage}
              </button>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer Actions */}
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border)', 
          paddingTop: '1rem' 
        }}>
          {renderActions()}
        </div>
      </div>
    </motion.article>
  );
}
