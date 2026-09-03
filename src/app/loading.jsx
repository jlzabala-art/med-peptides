export default function Loading() {
  return (
    <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#0f172a' }}>
      <span className="global-spinner"></span>
    </div>
  );
}
