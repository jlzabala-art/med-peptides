import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, XCircle, CheckCircle2, Copy, Send, Mail, Search, Filter, Download, Upload, Trash2, Eye, EyeOff, ArrowUpRight, Percent, Settings, Globe, Truck, AlertTriangle, UserPlus, Info, Layers, ArrowLeft, FlaskConical, HardDrive, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { getApprovalEmailHtml } from '../data/emailTemplate';
import { products as staticProducts } from '../data/products';
import AdminVariantsTab from '../components/admin/AdminVariantsTab';
import AdminProtocolsTab from '../components/admin/AdminProtocolsTab';
import AdminBlueprintsTab from '../components/admin/AdminBlueprintsTab';

// IMPORTANT: User will need to fill these or we can use environment variables
const EMAILJS_SERVICE_ID = "service_vstbe8f"; 
const EMAILJS_TEMPLATE_ID = "template_7unfks8";
const EMAILJS_PUBLIC_KEY = "rO_f_X4uBvFf3u_3u";

export default function AdminDashboard({ onBack }) {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailPreview, setEmailPreview] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [savingProduct, setSavingProduct] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [bulkMode, setBulkMode] = useState(null); // 'percent' or 'fixed'
  const [bulkValue, setBulkValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState('All');
  const [importing, setImporting] = useState(false);
  const [matrixCurrency, setMatrixCurrency] = useState('uae');
  const [costCurrency, setCostCurrency] = useState('usd');
  const [semanticSyncing, setSemanticSyncing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to top when switching to products tab
  useEffect(() => {
    if (activeTab === 'products') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const [settings, setSettings] = useState({
    exchangeRates: { uae: 3.67, qatar: 3.64, kuwait: 0.31, saudi: 3.75, euro: 0.92, row: 1 },
    eurExchangeRates: { uae: 4.0, qatar: 3.95, kuwait: 0.34, saudi: 4.08, usd: 1.09, row: 1.09 },
    shippingCosts: { standard: 0, express: 50, courier: 30 },
    deliveryTimes: { standard: '5-7 days', express: '2-3 days', courier: 'next day' }
  });

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'settings') fetchSettings();
  }, [isAdmin, activeTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDocs(query(collection(db, 'settings')));
      const globalSettings = docSnap.docs.find(d => d.id === 'global');
      
      if (globalSettings) {
        setSettings(globalSettings.data());
      } else {
        // Initialize if doesn't exist
        await setDoc(doc(db, 'settings', 'global'), settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await setDoc(doc(db, 'settings', 'global'), newSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to save settings.');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!window.confirm("This will populate Firestore with static products and default prices. Continue?")) return;
    setMigrating(true);
    try {
      for (const p of staticProducts) {
        const productId = `${p.name}-${p.dosage}`.replace(/\//g, '-').replace(/\s+/g, '_');
        const productRef = doc(db, 'products', productId);
        
        await setDoc(productRef, {
          ...p,
          sku: productId.substring(0, 8).toUpperCase(),
          guestVialPrice: p.perVialPriceUSD,
          guestKitPrice: p.kitPriceUSD,
          proVialPrice: (p.perVialPriceUSD * 0.85).toFixed(2),
          proKitPrice: (p.kitPriceUSD * 0.85).toFixed(2),
          stock: 100,
          warehouse: 'Poland',
          supplier: 'Regpept',
          costPrice: 0,
          isActive: true,
          goals: p.goals || [],
          secondaryFactors: p.secondaryFactors || [],
          tags: p.tags || [],
          mechanisms: p.mechanisms || [],
          semanticKeywords: p.semanticKeywords || [],
          synonyms: p.synonyms || [],
          objective: p.objective || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      alert("Migration complete!");
      fetchProducts();
    } catch (err) {
      console.error("Migration error:", err);
      alert("Error migrating products.");
    } finally {
      setMigrating(false);
    }
  };

  const handleSemanticSync = async () => {
    if (!window.confirm("This will update all products in Firestore with the latest semantic metadata (goals, tags, synonyms, etc.) from products.js. Continue?")) return;
    setSemanticSyncing(true);
    let successCount = 0;
    try {
      for (const p of staticProducts) {
        const productId = `${p.name}-${p.dosage}`.replace(/\//g, '-').replace(/\s+/g, '_');
        const productRef = doc(db, 'products', productId);
        
        // Only update semantic fields to avoid overwriting price/stock changes in DB
        await updateDoc(productRef, {
          goals: p.goals || [],
          secondaryFactors: p.secondaryFactors || [],
          tags: p.tags || [],
          mechanisms: p.mechanisms || [],
          semanticKeywords: p.semanticKeywords || [],
          synonyms: p.synonyms || [],
          objective: p.objective || '',
          updatedAt: new Date().toISOString()
        }).catch(async (err) => {
          // If document doesn't exist, create it (fallback)
          if (err.code === 'not-found') {
            await setDoc(productRef, {
              ...p,
              sku: productId.substring(0, 8).toUpperCase(),
              guestVialPrice: p.perVialPriceUSD,
              guestKitPrice: p.kitPriceUSD,
              proVialPrice: (p.perVialPriceUSD * 0.85).toFixed(2),
              proKitPrice: (p.kitPriceUSD * 0.85).toFixed(2),
              stock: 100,
              warehouse: 'Poland',
              isActive: true,
              updatedAt: new Date().toISOString()
            });
          } else {
            throw err;
          }
        });
        successCount++;
      }
      alert(`Semantic sync complete! ${successCount} products updated.`);
      fetchProducts();
    } catch (err) {
      console.error("Semantic sync error:", err);
      alert("Error syncing semantic data. Check console for details.");
    } finally {
      setSemanticSyncing(false);
    }
  };

  const handleUpdateProduct = async (id, updates) => {
    setSavingProduct(id);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product.");
    } finally {
      setSavingProduct(null);
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;
    
    // Header
    const headers = ["ID", "SKU", "Name", "Category", "Dosage", "Guest Vial Price", "Guest Kit Price", "Pro Vial Price", "Pro Kit Price", "Stock", "Warehouse", "Cost Price", "Supplier", "Active"];
    const csvContent = [
      headers.join(","),
      ...products.map(p => [
        p.id,
        `"${p.sku || ''}"`,
        `"${p.name}"`,
        `"${p.category}"`,
        `"${p.dosage}"`,
        p.guestVialPrice,
        p.guestKitPrice,
        p.proVialPrice,
        p.proKitPrice,
        p.stock || 0,
        `"${p.warehouse || 'Poland'}"`,
        p.costPrice || 0,
        `"${p.supplier || ''}"`,
        p.isActive === false ? "inactive" : "active"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `med_peptides_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = ["ID", "SKU", "Name", "Category", "Dosage", "Guest Vial Price", "Guest Kit Price", "Pro Vial Price", "Pro Kit Price", "Stock", "Warehouse", "Cost Price", "Supplier", "Active"];
    const sampleRow = ["sample_id", "BPC157-5", "BPC-157", "Healing & Recovery", "5mg/vial", "28.75", "172.50", "24.44", "146.63", "100", "Poland", "15.00", "Regpept", "active"];
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "med_peptides_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImporting(true);
      try {
        const text = e.target.result;
        const rows = text.split("\n");
        const headers = rows[0].split(",");
        
        // Skip header
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          // Simple CSV parse (caution with quoted commas if any)
          const cols = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          if (cols.length < 9) continue;

          const id = cols[0].replace(/"/g, '');
          const updates = {
            sku: cols[1]?.replace(/"/g, '') || '',
            guestVialPrice: parseFloat(cols[5]),
            guestKitPrice: parseFloat(cols[6]),
            proVialPrice: parseFloat(cols[7]),
            proKitPrice: parseFloat(cols[8]),
            stock: parseInt(cols[9]),
            warehouse: cols[10]?.replace(/"/g, '') || 'Poland',
            costPrice: parseFloat(cols[11]) || 0,
            supplier: cols[12]?.replace(/"/g, '') || '',
            isActive: cols[13]?.toLowerCase().includes('inactive') ? false : true,
            updatedAt: new Date().toISOString()
          };

          const productRef = doc(db, 'products', id);
          await updateDoc(productRef, updates);
        }
        alert("Import complete! Refreshing catalog...");
        fetchProducts();
      } catch (err) {
        console.error("Import error:", err);
        alert("Error importing CSV. Ensure the format is correct.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExportPriceMatrix = () => {
    if (products.length === 0) return;
    
    const currencies = Object.keys(settings.exchangeRates);
    const headers = ["ID", "SKU", "Name", "Dosage", "Base Guest USD", "Base Pro USD", ...currencies.map(c => `${c.toUpperCase()} Guest (incl. Logistics)`), ...currencies.map(c => `${c.toUpperCase()} Pro (incl. Logistics)`)];
    
    const csvRows = products.map(p => {
      const gUSD = parseFloat(p.guestVialPrice || 0);
      const pUSD = parseFloat(p.proVialPrice || 0);
      
      const localGuestPrices = currencies.map(c => {
        const rate = settings.exchangeRates[c];
        return Math.round(gUSD * rate * 1.10);
      });
      
      const localProPrices = currencies.map(c => {
        const rate = settings.exchangeRates[c];
        return Math.round(pUSD * rate * 1.10);
      });
      
      return [
        p.id,
        `"${p.sku || ''}"`,
        `"${p.name}"`,
        `"${p.dosage}"`,
        gUSD,
        pUSD,
        ...localGuestPrices,
        ...localProPrices
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `price_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAdjust = async () => {
    if (!bulkValue || isNaN(bulkValue)) {
      alert("Please enter a valid number.");
      return;
    }

    const affectedProducts = products.filter(p => 
      bulkCategory === 'All' || p.category === bulkCategory
    );

    if (affectedProducts.length === 0) {
      alert("No products found in the selected category.");
      return;
    }

    if (!window.confirm(`Apply adjustment to ${affectedProducts.length} products?`)) return;

    setLoading(true);
    try {
      const val = parseFloat(bulkValue);
      for (const p of affectedProducts) {
        let updates = {};
        if (bulkMode === 'percent') {
          const factor = 1 + (val / 100);
          updates = {
            guestVialPrice: (p.guestVialPrice * factor).toFixed(2),
            guestKitPrice: (p.guestKitPrice * factor).toFixed(2),
            proVialPrice: (p.proVialPrice * factor).toFixed(2),
            proKitPrice: (p.proKitPrice * factor).toFixed(2)
          };
        } else if (bulkMode === 'fixed') {
          updates = {
            guestVialPrice: (p.guestVialPrice + val).toFixed(2),
            guestKitPrice: (p.guestKitPrice + val).toFixed(2),
            proVialPrice: (p.proVialPrice + val).toFixed(2),
            proKitPrice: (p.proKitPrice + val).toFixed(2)
          };
        }

        const productRef = doc(db, 'products', p.id);
        await updateDoc(productRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
      alert("Bulk adjustment complete!");
      fetchProducts();
      setBulkMode(null);
      setBulkValue('');
    } catch (err) {
      console.error("Bulk adjust error:", err);
      alert("Error applying bulk adjustments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  const handleToggleApproval = async (userId, currentStatus) => {
    const confirmMessage = currentStatus ? 
      "Are you sure you want to REVOKE this user's professional access?" : 
      "Approve this user for professional access?";
      
    if (!window.confirm(confirmMessage)) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        approved: !currentStatus
      });
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status.");
    }
  };

  const handleSendEmail = async (user) => {
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_TEMPLATE_ID || !EMAILJS_SERVICE_ID) {
      alert("Configuración de EmailJS pendiente. Por favor, introduce tus claves en el código.");
      return;
    }

    setSendingEmail(user.id);
    try {
      const templateParams = {
        to_email: user.email,
        to_name: user.fullName || user.displayName || 'Researcher',
        reply_to: 'business@med-peptides.com', 
        // We can pass the full HTML if the template is set to use a variable for the body
        email_body_html: getApprovalEmailHtml(user.fullName || user.displayName)
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      alert(`Email enviado con éxito a ${user.email}`);
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('Error al enviar el email. Revisa la consola para más detalles.');
    } finally {
      setSendingEmail(null);
    }
  };

  const showEmailPreview = (user) => {
    setEmailPreview(user);
    // Smooth scroll to preview
    setTimeout(() => {
      document.getElementById('email-preview-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCopyHtml = async () => {
    if (!emailPreview) return;
    const name = emailPreview.fullName || emailPreview.displayName || 'Researcher';
    const html = getApprovalEmailHtml(name);
    try {
      await navigator.clipboard.writeText(html);
      alert("HTML Copiado al portapapeles. Listo para pegar en tu sistema de correos.");
    } catch (err) {
      console.error("Failed to copy", err);
      alert("Error al copiar el HTML.");
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <ShieldCheck size={48} className="animate-pulse" color="var(--primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Authenticating Admin Access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '15vh 2rem', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <XCircle size={64} color="var(--error)" style={{ marginBottom: '1rem' }} />
        <h1>Access Denied</h1>
        <p>You do not have administrative privileges to view this page.</p>
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged in as: {useAuth().user?.email}</p>
          <button className="btn btn-primary" onClick={onBack}>Return to Catalog</button>
        </div>
      </div>
    );
  }

  const MobileObserverDashboard = () => (
    <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--primary)" />
          Mobile Observer
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status & Insights View (Observer Mode)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Products</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{products.length}</div>
        </div>
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} color="var(--error)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Low Stock</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{products.filter(p => p.stock < 20).length}</div>
        </div>
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} color="var(--secondary)" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{users.filter(u => !u.approved).length}</div>
        </div>
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={20} color="#f59e0b" />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Regions</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>6</div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="var(--error)" />
          Inventory Alerts
        </h3>
        {products.filter(p => p.stock < 20).slice(0, 5).map(p => (
          <div key={p.id} className="card" style={{ padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.warehouse}</div>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--error)' }}>{p.stock} units</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} color="var(--secondary)" />
          Latest Registrations
        </h3>
        {users.slice(0, 5).map(u => (
          <div key={u.id} className="card" style={{ padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.fullName || u.displayName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.institution || 'Individual'}</div>
            </div>
            <div style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '100px', backgroundColor: u.approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: u.approved ? 'var(--success)' : 'var(--error)' }}>
              {u.approved ? 'Approved' : 'Pending'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--primary)', padding: '1.5rem', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
        <Info size={32} style={{ marginBottom: '1rem' }} />
        <h3 style={{ margin: 0 }}>Management Mode</h3>
        <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>Para realizar cambios, editar precios, gestionar stock o aprobar usuarios, por favor accede desde un Laptop o Tablet.</p>
        <button className="btn btn-outline" onClick={onBack} style={{ marginTop: '1rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)', width: '100%' }}>Volver al Catálogo</button>
      </div>
    </div>
  );

  if (isMobile) return <MobileObserverDashboard />;

  return (
    <div className="template-root" style={{ 
      paddingTop: 'clamp(5rem, 10vw, 8rem)', 
      minHeight: '100vh', 
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '4rem' }}>
        
        {/* Uniform Header */}
        <div style={{ marginBottom: '3rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, 
              padding: '0.5rem 1rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          >
            <ArrowLeft size={16} /> EXIT TERMINAL
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
                <ShieldCheck size={36} /> Admin Terminal
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                Advanced B2B Management & Catalog Control
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              backgroundColor: 'white', 
              padding: '0.4rem', 
              borderRadius: '20px', 
              boxShadow: 'var(--shadow-sm)', 
              border: '1px solid var(--border)',
            }}>
              <nav style={{ display: 'flex', gap: '0.25rem' }}>
                {[
                  { id: 'users', label: 'Users', icon: ShieldCheck },
                  { id: 'products', label: 'Products', icon: ArrowUpRight },
                  { id: 'costs', label: 'Costs', icon: ArrowUpRight },
                  { id: 'prices', label: 'Prices', icon: Globe },
                  { id: 'relationships', label: 'Relationships', icon: Layers },
                  { id: 'semantic', label: 'Semantic', icon: Search },
                  { id: 'validation', label: 'Validation', icon: FlaskConical },
                  { id: 'data-tools', label: 'Data Tools', icon: HardDrive },
                  { id: 'variants', label: 'Variants', icon: Layers },
                  { id: 'protocols', label: 'Protocols', icon: FlaskConical },
                  { id: 'blueprints', label: 'Blueprints', icon: BookOpen },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'validation') {
                        navigate('/admin/validation');
                      } else if (tab.id === 'data-tools') {
                        navigate('/admin/data-tools');
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent', 
                      color: activeTab === tab.id ? 'white' : 'var(--text-main)', 
                      border: 'none',
                      borderRadius: '14px',
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Business Overview Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px' }}><ShieldCheck size={24} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Products</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{products.length}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: '12px' }}><ArrowUpRight size={24} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Low Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{products.filter(p => p.stock < 20).length}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}><Mail size={24} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Users</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{users.filter(u => !u.approved).length}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}><Truck size={24} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Warehouses</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{[...new Set(products.map(p => p.warehouse || 'Poland'))].length}</div>
            </div>
          </div>
        </div>

        {activeTab === 'products' && (
          <div style={{ marginBottom: '2rem' }}>
            {/* Toolbar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.6rem 1rem 0.6rem 2.5rem', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ 
                    padding: '0.6rem 1rem', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    backgroundColor: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="All">All Categories</option>
                  {[...new Set(staticProducts.map(p => p.category))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={handleDownloadTemplate} 
                  className="btn btn-outline" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                >
                  <Copy size={16} /> Download Template
                </button>
                <button onClick={handleExportCSV} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Download size={16} /> Export
                </button>
                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <Upload size={16} /> Import
                  <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                </label>
                <button 
                  onClick={() => setBulkMode(bulkMode ? null : 'percent')} 
                  className={`btn ${bulkMode ? 'btn-primary' : 'btn-outline'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                >
                  <Percent size={16} /> Bulk Price
                </button>
              </div>
            </div>

            {/* Bulk Adjustment Panel */}
            {bulkMode && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: '1px solid var(--primary)', 
                marginBottom: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowUpRight size={20} /> Bulk Price Adjustment
                  </h3>
                  <XCircle size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setBulkMode(null)} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Apply to Category:</label>
                    <select 
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                    >
                      <option value="All">All Categories</option>
                      {[...new Set(staticProducts.map(p => p.category))].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Adjustment Type:</label>
                    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => setBulkMode('percent')}
                        style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkMode === 'percent' ? 'var(--primary)' : 'white', color: bulkMode === 'percent' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
                      >
                        Percentage (%)
                      </button>
                      <button 
                        onClick={() => setBulkMode('fixed')}
                        style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkMode === 'fixed' ? 'var(--primary)' : 'white', color: bulkMode === 'fixed' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
                      >
                        Fixed Amount ($)
                      </button>
                    </div>
                  </div>
                  <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                      {bulkMode === 'percent' ? "Percentage (e.g. 5 or -10)" : "Amount (e.g. 10 or -5)"}
                    </label>
                    <input 
                      type="number" 
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <button onClick={handleBulkAdjust} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                    Apply to {products.filter(p => bulkCategory === 'All' || p.category === bulkCategory).length} Products
                  </button>
                </div>
              </div>
            )}

            {products.length === 0 && !loading && (
              <div style={{ marginBottom: '2rem', textAlign: 'center', backgroundColor: 'white', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your catalog is empty. Start by migrating your existing products.</p>
                <button className="btn btn-primary" onClick={handleMigrate} disabled={migrating}>
                  {migrating ? "Migrating..." : "Run Initial Products Migration"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content Rendering */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: '0', overflowX: 'auto', marginBottom: '2rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found in database.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>User / Clinic</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {u.fullName || u.displayName || `User (${u.id.substring(0,6)})`}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {u.institution || 'Individual / No Clinic'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                        {u.email || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No email data</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.approved ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
                            <CheckCircle2 size={14} /> Approved
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleToggleApproval(u.id, u.approved)}
                            style={{
                              padding: '0.4rem 0.75rem',
                              border: `1px solid ${u.approved ? 'var(--error)' : 'var(--success)'}`,
                              backgroundColor: u.approved ? 'rgba(239, 68, 68, 0.05)' : 'var(--success)',
                              color: u.approved ? 'var(--error)' : 'white',
                              borderRadius: '4px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            {u.approved ? 'Revoke Access' : 'Approve Account'}
                          </button>
                          
                          {u.approved && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleSendEmail(u)}
                                disabled={sendingEmail === u.id}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  border: '1px solid var(--secondary)',
                                  backgroundColor: sendingEmail === u.id ? 'var(--background)' : 'var(--secondary)',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  cursor: sendingEmail === u.id ? 'not-allowed' : 'pointer',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {sendingEmail === u.id ? 'Sending...' : <><Send size={14} /> Send Email</>}
                              </button>
                              
                              <button 
                                onClick={() => showEmailPreview(u)}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  border: '1px solid var(--primary)',
                                  backgroundColor: 'white',
                                  color: 'var(--primary)',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Mail size={14} /> Preview
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="card" style={{ padding: '0', overflowX: 'auto', marginBottom: '2rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading catalog...</div>
            ) : products.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Catalog is empty.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>SKU</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Product / Category</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Stock</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Cost (USD)</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Warehouse</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Supplier</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => {
                      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
                      const searchLower = searchTerm.toLowerCase();
                      const matchesSearch = 
                        p.name.toLowerCase().includes(searchLower) || 
                        p.category.toLowerCase().includes(searchLower) ||
                        (p.objective && p.objective.toLowerCase().includes(searchLower)) ||
                        (p.dosage && p.dosage.toLowerCase().includes(searchLower));
                      return matchesCategory && matchesSearch;
                    })
                    .sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                    .map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="text" defaultValue={p.sku || ''} 
                          onBlur={(e) => handleUpdateProduct(p.id, { sku: e.target.value })}
                          placeholder="SKU"
                          style={{ width: '80px', padding: '0.25rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }} 
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.category} | {p.dosage}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="number" defaultValue={p.stock} 
                          onBlur={(e) => handleUpdateProduct(p.id, { stock: parseInt(e.target.value) || 0 })}
                          style={{ 
                            width: '65px', 
                            padding: '0.4rem', 
                            fontWeight: 700, 
                            textAlign: 'center',
                            color: p.stock < 20 ? 'var(--error)' : p.stock < 50 ? '#f59e0b' : 'inherit',
                            border: p.stock < 20 ? '2px solid var(--error)' : '1px solid var(--border)',
                            borderRadius: '6px'
                          }} 
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={p.warehouse || 'Poland'} 
                          onChange={(e) => handleUpdateProduct(p.id, { warehouse: e.target.value })}
                          style={{ width: '80px', padding: '0.25rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                        >
                          <option value="Poland">Poland</option>
                          <option value="UK">UK</option>
                          <option value="HK">HK</option>
                          <option value="USA">USA</option>
                          <option value="Greece">Greece</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={p.supplier || ''} 
                          onChange={(e) => handleUpdateProduct(p.id, { supplier: e.target.value })}
                          style={{ width: '100px', padding: '0.25rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                        >
                          <option value="">Select...</option>
                          <option value="NPLAB">NPLAB</option>
                          <option value="Regpept">Regpept</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => handleUpdateProduct(p.id, { isActive: p.isActive === false ? true : false })}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: p.isActive === false ? 'var(--text-muted)' : 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {p.isActive === false ? <><EyeOff size={16} /> Hidden</> : <><Eye size={16} /> Active</>}
                        </button>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {savingProduct === p.id ? (
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saving...</span>
                          ) : (
                             <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Updated</span>
                          )}
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              color: 'var(--error)', 
                              opacity: 0.6,
                              padding: '0.25rem'
                            }}
                            className="hvr-grow"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Cost Hub (Financials)</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review and edit product costs in USD or calculate in EUR.</p>
              </div>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '100px', overflow: 'hidden', backgroundColor: 'white' }}>
                <button 
                  onClick={() => setCostCurrency('usd')}
                  style={{ padding: '0.6rem 1.5rem', border: 'none', backgroundColor: costCurrency === 'usd' ? 'var(--primary)' : 'white', color: costCurrency === 'usd' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}
                >
                  USD ($)
                </button>
                <button 
                  onClick={() => setCostCurrency('eur')}
                  style={{ padding: '0.6rem 1.5rem', border: 'none', backgroundColor: costCurrency === 'eur' ? 'var(--primary)' : 'white', color: costCurrency === 'eur' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}
                >
                  EUR (€)
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Product / Dosage</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Base Cost (USD)</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Calculated Cost ({costCurrency.toUpperCase()})</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const eurRate = settings.exchangeRates.euro || 0.92;
                    const displayCost = costCurrency === 'usd' ? p.costPrice : (p.costPrice * eurRate).toFixed(2);
                    
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.dosage}</div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$</span>
                            <input 
                              type="number" 
                              defaultValue={p.costPrice}
                              onBlur={(e) => handleUpdateProduct(p.id, { costPrice: parseFloat(e.target.value) || 0 })}
                              style={{ width: '100px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                          {costCurrency === 'usd' ? '$' : '€'} {displayCost}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="view-container">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Product-Category Relationships</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage how products are organized within the catalog and investigational pathways.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
              <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Current Category</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .sort((a,b) => a.name.localeCompare(b.name))
                      .map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.dosage}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select 
                            value={p.category}
                            onChange={(e) => handleUpdateProduct(p.id, { category: e.target.value })}
                            style={{ 
                              width: '100%', 
                              padding: '0.5rem', 
                              borderRadius: '6px', 
                              border: '1px solid var(--border)',
                              fontSize: '0.9rem'
                            }}
                          >
                            {[
                              "Healing & Recovery",
                              "Weight Management & Metabolic",
                              "Anti-Aging & Longevity",
                              "Cognitive & Neuro-Protection",
                              "Muscle Growth & Performance",
                              "Hormonal Support",
                              "Research Supplies",
                              "Other Research Peptides"
                            ].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {savingProduct === p.id ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updating...</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Synced</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} color="var(--primary)" />
                    Catalog Overview
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      "Healing & Recovery",
                      "Weight Management & Metabolic",
                      "Anti-Aging & Longevity",
                      "Cognitive & Neuro-Protection",
                      "Muscle Growth & Performance",
                      "Hormonal Support",
                      "Research Supplies",
                      "Other Research Peptides"
                    ].map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      return (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{cat}</span>
                          <span style={{ fontWeight: 700, backgroundColor: 'rgba(0,54,102,0.05)', padding: '2px 8px', borderRadius: '10px' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'rgba(0,163,224,0.02)', border: '1px dashed var(--primary)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--primary)' }}>Real-time Sync</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Changes made here are instantly reflected in the live customer catalog and investigational pathways.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="view-container">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Pricing Management</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Adjust global pricing strategies and regional adjustments.</p>
            </div>
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <Percent size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
               <p>Pricing matrix and regional adjustments are managed via the Products and Settings tabs.</p>
            </div>
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className="view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Search size={24} color="var(--primary)" />
                  AI Semantic Intelligence Sync
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Enrich the Firestore database with the latest semantic metadata for AI natural language search.
                </p>
              </div>
              <button 
                onClick={handleSemanticSync} 
                disabled={semanticSyncing}
                className="btn btn-primary"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0, 54, 102, 0.2)'
                }}
              >
                {semanticSyncing ? (
                  <>
                    <div className="spinner-small" style={{ width: '18px', height: '18px' }}></div>
                    Syncing Intelligence...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Sync Intelligence to Live Database
                  </>
                )}
              </button>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: 'rgba(52, 211, 153, 0.05)', border: '1px solid var(--success-light)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={24} color="var(--success)" style={{ marginTop: '0.25rem' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--success)' }}>Semantic Ready</h3>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    We have identified <strong>57 products</strong> with enriched metadata including hair health, skin rejuvenation, and acne treatments. Syncing will enable the AI search to understand natural language queries like
                    <em> "What is best for hair growth?"</em> or <em> "peptidos para acne"</em>.
                  </p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Search Goals</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Key Mechanisms</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>AI Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staticProducts.map(p => (
                    <tr key={p.name + p.dosage} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.dosage}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {(p.goals || []).map(g => (
                            <span key={g} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(0,54,102,0.05)', borderRadius: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                              {g}
                            </span>
                          ))}
                          {(p.secondaryFactors || []).map(f => (
                            <span key={f} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(15,23,42,0.05)', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', maxWidth: '300px' }}>
                          {p.mechanisms?.slice(0, 2).join(", ") || "Standard efficacy"}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: p.goals?.length > 0 ? 'var(--success)' : 'var(--error)', fontSize: '0.8rem', fontWeight: 800 }}>
                          {p.goals?.length > 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {p.goals?.length > 0 ? 'READY' : 'PENDING'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'variants' && <AdminVariantsTab />}

        {activeTab === 'protocols' && <AdminProtocolsTab />}

        {activeTab === 'blueprints' && <AdminBlueprintsTab />}

        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {/* Exchange Rates */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.75rem' }}>
                <Globe size={24} color="var(--primary)" />
                Exchange Rates (Base: USD)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {settings.exchangeRates && Object.entries(settings.exchangeRates).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>1 USD to {key}</span>
                    <input 
                      type="number" step="0.001" defaultValue={value}
                      onBlur={(e) => {
                        const newVal = parseFloat(e.target.value);
                        if (isNaN(newVal)) return;
                        const newRates = { ...settings.exchangeRates, [key]: newVal };
                        handleUpdateSettings({ exchangeRates: newRates });
                      }}
                      style={{ width: '100px', padding: '0.4rem', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                  </div>
                ))}
              </div>

              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginTop: '2rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--secondary-light)', paddingBottom: '0.75rem' }}>
                <Globe size={24} color="var(--secondary)" />
                Exchange Rates (Base: EUR)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {settings.eurExchangeRates && Object.entries(settings.eurExchangeRates).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>1 EUR to {key}</span>
                    <input 
                      type="number" step="0.001" defaultValue={value}
                      onBlur={(e) => {
                        const newVal = parseFloat(e.target.value);
                        if (isNaN(newVal)) return;
                        const newRates = { ...(settings.eurExchangeRates || {}), [key]: newVal };
                        handleUpdateSettings({ eurExchangeRates: newRates });
                      }}
                      style={{ width: '100px', padding: '0.4rem', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics & Delivery */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--secondary-light)', paddingBottom: '0.75rem' }}>
                <Truck size={24} color="var(--secondary)" />
                Logistics & Delivery
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Configure shipping costs (USD) and estimated windows.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.keys(settings.shippingCosts).map(method => (
                  <div key={method} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>{method} Method</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cost ($)</label>
                        <input 
                          type="number" 
                          defaultValue={settings.shippingCosts[method]}
                          onBlur={(e) => {
                            const newVal = parseFloat(e.target.value);
                            if (isNaN(newVal)) return;
                            const newCosts = { ...settings.shippingCosts, [method]: newVal };
                            handleUpdateSettings({ shippingCosts: newCosts });
                          }}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Time (Days)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 5-7 days"
                          defaultValue={settings.deliveryTimes?.[method] || ''}
                          onBlur={(e) => {
                            const newTimes = { ...(settings.deliveryTimes || {}), [method]: e.target.value };
                            handleUpdateSettings({ deliveryTimes: newTimes });
                          }}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cache Control */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.75rem' }}>
                <HardDrive size={24} color="var(--primary)" />
                App Cache Control
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Clear all cached session data (products, protocols, exchange rates). Use this after making bulk Firestore changes so users see fresh data on next load.
              </p>
              <button
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={() => {
                  Object.keys(sessionStorage)
                    .filter(k => k.startsWith('rp_'))
                    .forEach(k => sessionStorage.removeItem(k));
                  alert('Cache cleared. Reloading...');
                  window.location.reload();
                }}
              >
                <Trash2 size={16} /> Clear App Cache &amp; Reload
              </button>
            </div>
          </div>
        )}

        {emailPreview && (
          <div id="email-preview-container" className="card" style={{ padding: '2rem', marginTop: '2rem', border: '2px solid var(--primary-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Approval Email Template</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>For: {emailPreview.fullName || emailPreview.displayName} ({emailPreview.email})</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn" onClick={handleCopyHtml} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <Copy size={16} /> Copy HTML Code
                </button>
                <button className="btn" onClick={() => setEmailPreview(null)} style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: 'transparent' }}>
                  Close
                </button>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#f1f5f9', padding: '2rem', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
               <div 
                 style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                 dangerouslySetInnerHTML={{ __html: getApprovalEmailHtml(emailPreview.fullName || emailPreview.displayName) }}
               />
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
