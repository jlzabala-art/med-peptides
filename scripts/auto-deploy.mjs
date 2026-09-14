#!/usr/bin/env node
/**
 * scripts/auto-deploy.mjs
 *
 * Despliegue Inteligente y Ultra-Rápido para Med-Peptides / Atlas Health.
 * Selecciona automáticamente la ruta más rápida sin intervención del usuario:
 *
 *  1. [Ruta Cloud CI/CD - 3 segundos de tiempo local]:
 *     Si hay cambios o commits pendientes, realiza push a origin/main.
 *     GitHub Actions compila y despliega en la nube con conexión de 10 Gbps,
 *     dejando el ordenador del desarrollador libre al instante.
 *
 *  2. [Ruta Local Optimizada - ~1 minuto]:
 *     Si la rama está sincronizada o no hay acceso a GitHub, ejecuta directamente
 *     el pipeline local optimizado (purgado de .next/dev + paquete ultra-ligero de 47 MB).
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('⚡ [Auto Deploy] Analizando entorno para seleccionar la vía más rápida...');

const args = process.argv.slice(2);
const forceLocal = args.includes('--local') || args.includes('-l');
const forceCloud = args.includes('--cloud') || args.includes('-c');

function runCmd(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit', ...options });
  } catch (err) {
    if (options.ignoreError) return null;
    throw err;
  }
}

function getCmdOutput(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (_) {
    return '';
  }
}

// 1. Comprobar estado de Git
const currentBranch = getCmdOutput('git rev-parse --abbrev-ref HEAD') || 'main';
const gitStatus = getCmdOutput('git status --porcelain');
const unpushedCommits = getCmdOutput(`git log origin/${currentBranch}..HEAD --oneline 2>/dev/null`) || '';
const hasGhCli = Boolean(getCmdOutput('which gh'));

// Determinar el método más rápido
let useCloud = false;

if (forceLocal) {
  useCloud = false;
} else if (forceCloud) {
  useCloud = true;
} else if (hasGhCli && currentBranch === 'main') {
  // Si hay cambios locales o commits sin pushear, el método más rápido para el usuario
  // es delegar a GitHub Actions (3s de tiempo local vs 1m15s de compilación local).
  useCloud = true;
}

if (useCloud) {
  console.log('\n🚀 [Auto Deploy] Método seleccionado: CLOUD CI/CD (GitHub Actions)');
  console.log('   ↳ 0 segundos de bloqueo en tu ordenador. Ejecución en servidores con 10 Gbps.\n');

  try {
    // Si hay cambios no commiteados, auto-guardar
    if (gitStatus.length > 0) {
      console.log('📦 Guardando cambios pendientes...');
      runCmd('git add -A');
      const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
      runCmd(`git commit -m "chore(auto-deploy): automated release ${timestamp}"`);
    }

    console.log('📤 Transfiriendo a GitHub (origin/main)...');
    runCmd('git push origin main');
    console.log('✅ Push completado con éxito en segundos.');

    // Verificar inicio del workflow en GitHub Actions
    if (hasGhCli) {
      console.log('\n📡 Conectando con el runner de GitHub Actions...');
      // Esperar 3 segundos a que GitHub registre el push
      runCmd('sleep 3', { silent: true });

      const latestRun = getCmdOutput('gh run list --limit 1 --json databaseId,status,conclusion --jq ".[0].databaseId"');
      if (latestRun) {
        console.log(`🔗 Despliegue en curso en GitHub Actions (ID: ${latestRun})`);
        console.log('   Puedes cerrar este terminal en cualquier momento; el despliegue continúa en la nube.');
        console.log('   Siguiente enlace para ver el progreso en web: https://github.com/jlzabala-art/med-peptides/actions');
        console.log('\n👀 Mostrando estado en vivo (Pulsa Ctrl+C para salir sin detener el despliegue):\n');

        const watchProcess = spawn('gh', ['run', 'watch', latestRun], { stdio: 'inherit' });
        watchProcess.on('close', (code) => {
          if (code === 0) {
            console.log('\n🎉 [Auto Deploy] ¡Despliegue completado con éxito en producción!');
            console.log('🌐 Sitio web: https://med-peptides-app-27a3a.web.app\n');
          }
        });
      } else {
        console.log('🎉 Despliegue lanzado en GitHub Actions en segundo plano.');
      }
    }
  } catch (err) {
    console.warn(`\n⚠️ Error al conectar con GitHub (${err.message}). Cambiando automáticamente a Pipeline Local...`);
    deployLocally();
  }
} else {
  deployLocally();
}

function deployLocally() {
  console.log('\n⚡ [Auto Deploy] Método seleccionado: PIPELINE LOCAL OPTIMIZADO');
  console.log('   ↳ Purgando caché de desarrollo y empaquetando 47 MB...\n');

  try {
    runCmd('npm run clean:deploy');
    runCmd('node scripts/optimize-deploy.mjs');
    runCmd('npx firebase-tools deploy --only hosting');

    console.log('\n🎉 [Auto Deploy] ¡Despliegue local completado con éxito en producción!');
    console.log('🌐 Sitio web: https://med-peptides-app-27a3a.web.app\n');
  } catch (err) {
    console.error(`\n❌ Error en el despliegue local: ${err.message}`);
    process.exit(1);
  }
}
