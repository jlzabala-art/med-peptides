// cypress/e2e/flows/cross_role_refill.cy.js
// Exhaustive test: Doctor-Patient-Wholesaler Refill Reminder Lifecycle

describe('Doctor-Patient-Wholesaler Refill Lifecycle', () => {
  before(() => {
    // Clean all test records first to ensure test isolation
    cy.task('cleanTestRecords');
  });

  // Helper function to dismiss regional overlay if it appears
  const handleRegionOverlay = () => {
    cy.get('body').then(($body) => {
      if ($body.find('h2:contains("Select Destination")').length > 0) {
        cy.contains('Spain').click();
        cy.contains('Confirm Selection').click();
      }
    });
  };

  it('completes the entire prescription -> bulk order -> delivery -> refill banner lifecycle', () => {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Doctor creates a prescription and assigns it to Wholesaler
    // ─────────────────────────────────────────────────────────────────────────
    cy.loginAs('doctor');
    cy.url({ timeout: 15000 }).should('include', '/doctor');
    handleRegionOverlay();

    // Wait for session hydration and profile load to stabilize the UI
    cy.contains('Dr. Test Doctor', { timeout: 15000 }).should('be.visible');
    cy.wait(1000); // extra buffer for react state updates to settle

    // 1. Visit patients tab first to populate the shared patients state
    cy.window().then((win) => {
      cy.task('log', '--- BROWSER LOGS BEFORE CLICKING MY PATIENTS ---');
      (win.__browser_logs || []).forEach(l => cy.task('log', l));
    });
    cy.get('[data-testid="sb-item-patients"]').click();
    
    cy.window().then(async (win) => {
      win.console.log('--- CYPRESS DIRECT FIRESTORE TEST QUERY ---');
      if (!win.db || !win.fs) {
        win.console.log('Firestore db or fs not found on window');
        return;
      }
      try {
        const { collection, query, where, getDocs } = win.fs;
        const q = query(collection(win.db, 'doctor_patient_relationships'), where('doctorId', '==', '754OYGgejoelucER7ReDaGUbAJu2'));
        win.console.log('Starting direct query via getDocs...');
        const snap = await getDocs(q);
        win.console.log(`Direct query complete. Size: ${snap.size}`);
        snap.forEach(d => {
          win.console.log(`Doc: ${d.id} -> ${JSON.stringify(d.data())}`);
        });
      } catch (e) {
        win.console.error(`Direct query failed: ${e.stack || e.message || e}`);
      }
    });

    cy.get('body').then(($body) => {
      cy.task('log', '--- BROWSER HTML DOM BODY ---');
      cy.task('log', $body.html());
      if (!$body.text().includes('Ana Martínez')) {
        cy.window().then((win) => {
          cy.task('log', '--- ALL BROWSER LOGS ON PATIENTS TAB FAILURE ---');
          (win.__browser_logs || []).forEach(l => cy.task('log', l));
        });
      }
    });
    cy.contains('Ana Martínez', { timeout: 10000 }).should('be.visible');

    // 2. Go to Prescriptions tab
    cy.contains('button', 'Prescriptions').click();
    cy.contains('button', 'Nueva Prescripción').click();

    // 3. Select registered patient
    cy.get('select').first().select('Ana Martínez');

    // 4. Select wholesaler (Test Wholesaler)
    cy.contains('Test Wholesaler').click();

    // 5. Add product BPC-157
    cy.get('input[placeholder*="añadir"]').type('BPC');
    cy.wait(1000);
    cy.window().then((win) => {
      cy.task('log', '--- BROWSER LOGS AFTER TYPING BPC ---');
      (win.__browser_logs || []).forEach(l => cy.task('log', l));
    });
    // Click the result in dropdown
    cy.get('button').contains('BPC-157').should('be.visible').click();

    // 6. Send the prescription
    cy.contains('button', 'Enviar Prescripción').click();

    // 7. Extract the generated Prescription ID
    cy.contains(/Enlace directo/i, { timeout: 15000 }).parent().find('span').then(($span) => {
      const url = $span.text().trim();
      const rxId = url.split('/rx/')[1];
      expect(rxId).to.not.be.undefined;
      cy.wrap(rxId).as('prescriptionId');
      cy.task('log', `Created prescription with ID: ${rxId}`);
    });

    cy.task('logPrescriptions');

    cy.logout();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Wholesaler adds prescription to B2B Bulk Order and submits
    // ─────────────────────────────────────────────────────────────────────────
    cy.loginAs('wholesaler');
    cy.url({ timeout: 15000 }).should('include', '/wholesaler');
    handleRegionOverlay();

    // Intercept submitBulkOrder to mock Zoho Books creation and prevent polluting prod
    cy.intercept('POST', '**/submitBulkOrder', {
      statusCode: 200,
      body: {
        success: true,
        aggregated_items: [{ id: 'bpc-157', productName: 'BPC-157', quantity: 1, unit: 'vials' }],
        totalItems: 1
      }
    }).as('submitBulkCall');

    cy.contains('button', 'Open Builder').click();
    
    // Switch to Prescriptions tab (just to be safe, though it's default)
    cy.contains('button', 'Prescripciones').click();

    cy.window().then(async (win) => {
      cy.task('log', '--- WHOLESALER FIRESTORE QUERY ---');
      await new Promise(r => setTimeout(r, 3000));
      if (!win.db || !win.fs) {
        cy.task('log', 'No db or fs found');
        return;
      }
      try {
        const { collection, query, where, getDocs } = win.fs;
        const authUid = win.firebaseAuth?.currentUser?.uid;
        if (!authUid) {
          cy.task('log', 'No current user uid found');
          return;
        }
        const q = query(collection(win.db, 'prescriptions'), where('wholesalerIds', 'array-contains', authUid));
        const snap = await getDocs(q);
        cy.task('log', `Prescriptions for ${authUid}: ${snap.size}`);
        snap.forEach(d => {
          cy.task('log', `Rx: ${d.id} -> ${JSON.stringify(d.data())}`);
        });
      } catch(e) {
        cy.task('log', 'Error querying: ' + e);
      }
    });

    // Select the newly assigned prescription in the Prescriptions tab of the builder
    cy.contains('Ana Martínez').should('be.visible').click();

    // Save draft to generate bulk ID
    cy.contains('button', 'Guardar borrador').click();
    cy.contains(/Draft ID/i, { timeout: 10000 }).should('be.visible');

    // Submit to Admin
    cy.contains('button', 'Enviar al Admin').click();
    cy.contains('Bulk Order enviado correctamente al Admin', { timeout: 15000 }).should('be.visible');

    cy.logout();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Admin / DB Task triggers delivery and creates refill reminder
    // ─────────────────────────────────────────────────────────────────────────
    cy.get('@prescriptionId').then((rxId) => {
      cy.task('deliverPrescriptionAndCreateReminder', { prescriptionId: rxId });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: Verify Refill Banners display and can be dismissed independently
    // ─────────────────────────────────────────────────────────────────────────

        // A. PATIENT
    cy.loginAs('patient');
    cy.url({ timeout: 15000 }).should('include', '/patient');
    handleRegionOverlay();
    // Verify Refill Banner
    cy.contains(/time to refill/i, { timeout: 10000 }).should('be.visible');
    // Dismiss
    cy.get('button[title="Dismiss reminder"]').first().click();
    cy.contains(/time to refill/i).should('not.exist');
    cy.logout();

    // B. DOCTOR
    cy.loginAs('doctor');
    cy.url({ timeout: 15000 }).should('include', '/doctor');
    handleRegionOverlay();
    // Verify Refill Banner
    cy.contains(/refill reminder/i, { timeout: 10000 }).should('be.visible');
    // Dismiss
    cy.get('button[title="Dismiss reminder"]').first().click();
    cy.contains(/refill reminder/i).should('not.exist');
    cy.logout();

    // C. WHOLESALER
    cy.loginAs('wholesaler');
    cy.url({ timeout: 15000 }).should('include', '/wholesaler');
    handleRegionOverlay();
    // Verify Refill Banner
    cy.contains(/refill reminder/i, { timeout: 10000 }).should('be.visible');
    // Dismiss
    cy.get('button[title="Dismiss reminder"]').first().click();
    cy.contains(/refill reminder/i).should('not.exist');
    cy.logout();

    // D. ADMIN
    cy.loginAs('admin');
    cy.url({ timeout: 15000 }).should('include', '/admin');
    handleRegionOverlay();
    // Verify Refill Banner
    cy.contains(/refill reminder/i, { timeout: 10000 }).should('be.visible');
    // Dismiss
    cy.get('button[title="Dismiss reminder"]').first().click();
    cy.contains(/refill reminder/i).should('not.exist');
    cy.logout();
  });
});
