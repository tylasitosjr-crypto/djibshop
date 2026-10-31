const localtunnel = require('localtunnel');
const http = require('http');

const PORT = 3000;
const PREFERRED_SUBDOMAIN = 'djibshop-' + Math.random().toString(36).substring(2, 7);

async function startTunnel() {
  console.log(`[DjibSHOP Tunnel] Establishing public online connection on port ${PORT}...`);

  try {
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: PREFERRED_SUBDOMAIN
    });

    console.log('\n======================================================');
    console.log('         🚀 DJIBHOP IS NOW LIVE ONLINE! 🚀            ');
    console.log('======================================================');
    console.log(`\n1. USER DASHBOARD (Storefront):`);
    console.log(`   👉 ${tunnel.url}`);
    console.log(`   👉 ${tunnel.url}/index.html`);
    console.log(`\n2. ADMIN PANEL:`);
    console.log(`   👉 ${tunnel.url}/admin`);
    console.log(`   👉 ${tunnel.url}/admin.html`);
    console.log('\n------------------------------------------------------');
    console.log('NOTE for first-time browser access on some networks:');
    console.log('If localtunnel asks for "Tunnel Password", enter your IP:');
    console.log('IP: 41.189.255.143');
    console.log('======================================================\n');

    tunnel.on('close', () => {
      console.log('[DjibSHOP Tunnel] Tunnel closed. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('[DjibSHOP Tunnel] Tunnel error:', err.message);
      setTimeout(startTunnel, 3000);
    });

  } catch (err) {
    console.error('[DjibSHOP Tunnel] Failed to start tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

// Keep event loop alive
setInterval(() => {}, 1000 * 60 * 60);

startTunnel();
