import React from 'react';

/**
 * ShipmentStepper — Displays a horizontal stepper for shipment tracking stages.
 * @param {{ label: string, status: 'completed'|'current'|'pending', timestamp?: string, notes?: string }[]} stages
 */
export default function ShipmentStepper({ stages = [] }) {
  return (
    <div className="shipment-stepper" role="list" aria-label="Shipment progress">
      {stages.map((stage, i) => {
        const isCompleted = stage.status === 'completed';
        const isCurrent = stage.status === 'current';
        const isPending = stage.status === 'pending';

        return (
          <div
            key={stage.label}
            className={`shipment-stepper__step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
            title={[stage.timestamp, stage.notes].filter(Boolean).join(' — ')}
          >
            <div className="shipment-stepper__dot">
              {isCompleted ? '✓' : i + 1}
            </div>
            {i < stages.length - 1 && (
              <div className={`shipment-stepper__connector ${isCompleted ? 'completed' : ''}`} />
            )}
            <div className="shipment-stepper__label">{stage.label}</div>
            {stage.timestamp && (
              <div className="shipment-stepper__timestamp">{stage.timestamp}</div>
            )}
          </div>
        );
      })}

      <style>{`
        .shipment-stepper {
          display: flex;
          align-items: flex-start;
          gap: 0;
          position: relative;
          padding: 0.5rem 0;
        }
        .shipment-stepper__step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          text-align: center;
        }
        .shipment-stepper__dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          background: #e2e8f0;
          color: #94a3b8;
          border: 2px solid #e2e8f0;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        .shipment-stepper__step.completed .shipment-stepper__dot {
          background: var(--success, #10b981);
          border-color: var(--success, #10b981);
          color: white;
        }
        .shipment-stepper__step.current .shipment-stepper__dot {
          background: white;
          border-color: var(--primary, #003666);
          color: var(--primary, #003666);
          box-shadow: 0 0 0 4px rgba(0, 54, 102, 0.15);
        }
        .shipment-stepper__connector {
          position: absolute;
          top: 16px;
          left: calc(50% + 16px);
          right: calc(-50% + 16px);
          height: 2px;
          background: #e2e8f0;
          z-index: 1;
        }
        .shipment-stepper__connector.completed {
          background: var(--success, #10b981);
        }
        .shipment-stepper__label {
          margin-top: 0.5rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          text-transform: capitalize;
        }
        .shipment-stepper__step.current .shipment-stepper__label {
          color: var(--primary, #003666);
        }
        .shipment-stepper__step.completed .shipment-stepper__label {
          color: var(--success, #10b981);
        }
        .shipment-stepper__timestamp {
          font-size: 0.65rem;
          color: #94a3b8;
          margin-top: 0.2rem;
        }
      `}</style>
    </div>
  );
}
