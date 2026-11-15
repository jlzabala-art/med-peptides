import TemplateSkeleton from '@/components/shared/public/TemplateSkeleton';

export default function PricingLoading() {
  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <TemplateSkeleton variant="catalog" />
    </div>
  );
}
