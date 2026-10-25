/**
 * adminNewUserAlert.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates an administrative alert email when a new user registers on Atlas Health.
 * Delivered to jose@mediluxeme.com with mobile-optimized formatting.
 */

function buildAdminNewUserAlertEmail(userData, userId) {
  const fullName = userData.name || 
    (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : '') || 
    userData.displayName || 
    'Usuario';

  const email = userData.email || 'No proporcionado';
  const roleRaw = userData.role || (Array.isArray(userData.roles) && userData.roles[0]) || 'User';
  const roleBadge = roleRaw.toUpperCase();
  const institution = userData.institution || userData.organization || userData.clinicName || 'No especificada';
  const country = userData.country || userData.shippingCountry || userData.billingCountry || 'No especificado';
  const phone = userData.phone || userData.phoneNumber || 'No especificado';
  const isApproved = userData.approved === true || userData.isVerified === true;
  const approvalStatus = isApproved ? 'Verificado / Activo' : 'Pendiente de Aprobación';
  const uid = userId || userData.uid || userData.id || 'N/A';

  const dateFormatted = new Date().toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = `[Atlas Health] 👤 Nuevo Registro: ${fullName} (${roleBadge})`;

  const text = `
NUEVO REGISTRO EN ATLAS HEALTH SERVICES

Un nuevo usuario se ha registrado en la plataforma.

DETALLES DEL USUARIO:
--------------------------------------------------
• Nombre Completo: ${fullName}
• Correo Electrónico: ${email}
• Rol Asignado: ${roleBadge}
• Organización / Clínica: ${institution}
• País: ${country}
• Teléfono: ${phone}
• Estado: ${approvalStatus}
• ID de Usuario (UID): ${uid}
• Fecha y Hora (Madrid): ${dateFormatted}

GESTIONAR EN EL PANEL DE ADMINISTRACIÓN:
https://www.atlashealth-services.com/admin/users

--------------------------------------------------
Este es un mensaje automático del sistema Atlas Health Platform enviado a jose@mediluxeme.com.
  `.trim();

  // Role badge color coding
  let roleColor = '#0284c7'; // default blue
  let roleBg = '#e0f2fe';
  if (roleRaw.toLowerCase() === 'doctor' || roleRaw.toLowerCase() === 'physician') {
    roleColor = '#0d9488'; // teal
    roleBg = '#ccfbf1';
  } else if (roleRaw.toLowerCase() === 'wholesaler' || roleRaw.toLowerCase() === 'wholeseller') {
    roleColor = '#c2410c'; // amber/orange
    roleBg = '#ffedd5';
  } else if (roleRaw.toLowerCase() === 'admin') {
    roleColor = '#7c3aed'; // purple
    roleBg = '#ede9fe';
  }

  const statusColor = isApproved ? '#16a34a' : '#d97706';
  const statusBg = isApproved ? '#f0fdf4' : '#fffbeb';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #003666 0%, #002244 100%);
      color: #ffffff;
      padding: 24px 20px;
      text-align: left;
    }
    .header-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background-color: rgba(255, 255, 255, 0.18);
      color: #93c5fd;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
    }
    .content {
      padding: 24px 20px;
    }
    .alert-banner {
      background-color: #f8fafc;
      border-left: 4px solid #0284c7;
      padding: 12px 14px;
      border-radius: 4px;
      font-size: 14px;
      color: #334155;
      margin-bottom: 20px;
    }
    .info-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .info-row {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      width: 38%;
      color: #64748b;
      font-weight: 600;
      flex-shrink: 0;
    }
    .info-value {
      width: 62%;
      color: #0f172a;
      word-break: break-word;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 16px 0;
    }
    .btn {
      display: inline-block;
      background-color: #0071bd;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 113, 189, 0.25);
    }
    .notice {
      font-size: 12px;
      color: #64748b;
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 16px;
      line-height: 1.4;
    }
    .footer {
      padding: 16px 20px;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="header-tag">Atlas Health Admin Alert</span>
        <h1>Nuevo Usuario Registrado</h1>
      </div>
      <div class="content">
        <div class="alert-banner">
          Se ha completado un nuevo registro en la plataforma <strong>Atlas Health Services</strong>. A continuación tienes los detalles completos:
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; font-size: 14px;">
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; width: 38%; border-bottom: 1px solid #f1f5f9;">Nombre</td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 600; width: 62%; border-bottom: 1px solid #f1f5f9;">${fullName}</td>
          </tr>
          <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Email</td>
            <td style="padding: 12px 16px; color: #0284c7; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #0071bd; text-decoration: none;">${email}</a></td>
          </tr>
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Rol Asignado</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
              <span style="background-color: ${roleBg}; color: ${roleColor}; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                ${roleBadge}
              </span>
            </td>
          </tr>
          <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Organización / Clínica</td>
            <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${institution}</td>
          </tr>
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">País</td>
            <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${country}</td>
          </tr>
          <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Teléfono</td>
            <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${phone}</td>
          </tr>
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Estado</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
              <span style="background-color: ${statusBg}; color: ${statusColor}; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                ${approvalStatus}
              </span>
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 600;">Fecha y Hora</td>
            <td style="padding: 12px 16px; color: #64748b; font-size: 13px;">${dateFormatted} (Madrid)</td>
          </tr>
        </table>

        ${!isApproved ? `
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #92400e; margin-bottom: 20px;">
            ⚠️ <strong>Atención:</strong> Esta cuenta está en estado pendiente de aprobación. Puedes revisar sus credenciales y activarla desde el Admin Panel.
          </div>
        ` : ''}

        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="https://www.atlashealth-services.com/admin/users" style="display: inline-block; background-color: #0071bd; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">
            👉 Gestionar Usuarios en el Admin Panel
          </a>
        </div>
      </div>
      <div class="footer">
        Atlas Health Platform • Notificación automática enviada a jose@mediluxeme.com
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

module.exports = { buildAdminNewUserAlertEmail };
