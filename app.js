/* ============================================================
   VelinX Enterprise Application Platform — Prototype Logic
   ============================================================ */
(function () {
  'use strict';

  // ============================================================
  // DATA
  // ============================================================
  const TEMPLATES = [
    { id: 'marketplace', name: 'Marketplace', icon: '\u{1F6D2}', color: '#6366f1', desc: 'Multi-vendor marketplace with listings, cart, checkout, escrow, and review system.' },
    { id: 'mobility', name: 'Mobility', icon: '\u{1F697}', color: '#3b82f6', desc: 'Ride-hailing, vehicle rental, or logistics platform with real-time tracking and dispatch.' },
    { id: 'workplace', name: 'Workplace', icon: '\u{1F3E2}', color: '#8b5cf6', desc: 'HR management, attendance, leave, payroll, and employee self-service portal.' },
    { id: 'connect', name: 'Connect', icon: '\u{1F4AC}', color: '#06b6d4', desc: 'Messaging, dating, or community platform with profiles, matching, and real-time chat.' },
    { id: 'property', name: 'Property', icon: '\u{1F3E0}', color: '#10b981', desc: 'Real estate listings, property management, tenant portals, and lease workflows.' },
    { id: 'healthcare', name: 'Healthcare', icon: '\u{2695}\u{FE0F}', color: '#ef4444', desc: 'Clinic management, appointments, patient records, prescriptions, and telemedicine.' },
    { id: 'security', name: 'Security', icon: '\u{1F6E1}\u{FE0F}', color: '#f59e0b', desc: 'Guard patrol, incident reporting, access control, and site monitoring.' },
    { id: 'hospitality', name: 'Hospitality', icon: '\u{1F3E8}', color: '#ec4899', desc: 'Hotel or venue management with bookings, check-in, rooms, and guest services.' },
    { id: 'education', name: 'Education', icon: '\u{1F393}', color: '#14b8a6', desc: 'School or academy management, courses, students, grading, and LMS portal.' },
    { id: 'facilities', name: 'Facilities', icon: '\u{1F3ED}', color: '#f97316', desc: 'Maintenance, work orders, asset tracking, and service request management.' },
    { id: 'agriculture', name: 'Agriculture', icon: '\u{1F33E}', color: '#84cc16', desc: 'Farm management, crop tracking, inventory, and supply chain visibility.' },
    { id: 'retail', name: 'Retail', icon: '\u{1F3EA}', color: '#a855f7', desc: 'Point of sale, inventory, loyalty programs, and multi-store management.' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '\u{2699}\u{FE0F}', color: '#64748b', desc: 'Production planning, BOM, quality control, and shop floor management.' },
    { id: 'blank', name: 'Blank Canvas', icon: '\u{2728}', color: '#6b7280', desc: 'Start from scratch with a clean slate. Build anything you need.' },
  ];

  const WIZARD_STEPS = [
    { key: 'appInfo',      label: 'App Info' },
    { key: 'template',     label: 'Template' },
    { key: 'modules',      label: 'Modules' },
    { key: 'portals',      label: 'Portals' },
    { key: 'roles',        label: 'Roles' },
    { key: 'workflow',     label: 'Workflow' },
    { key: 'pricing',      label: 'Pricing' },
    { key: 'matching',     label: 'Matching' },
    { key: 'dashboards',   label: 'Dashboards' },
    { key: 'menus',        label: 'Menus' },
    { key: 'theme',        label: 'Theme' },
    { key: 'layout',       label: 'Layout' },
    { key: 'preview',      label: 'Preview' },
    { key: 'generate',     label: 'Generate' },
  ];

  const PORTALS_MAP = {
    customer: { label: 'Customer Portal', pages: ['Home', 'Browse', 'Orders', 'Profile', 'Support'] },
    worker:   { label: 'Worker Portal',   pages: ['Dashboard', 'Tasks', 'Schedule', 'Earnings', 'Messages'] },
    admin:    { label: 'Admin Portal',    pages: ['Dashboard', 'Users', 'Content', 'Reports', 'Settings'] },
  };

  const MODULE_LIST = [
    'User Management', 'Listings', 'Search & Filter', 'Cart & Checkout',
    'Payments', 'Escrow', 'Messaging', 'Notifications', 'Reviews & Ratings',
    'Booking & Scheduling', 'Calendar', 'Reports & Analytics', 'File Upload',
    'Multi-language', 'Roles & Permissions', 'Workflow Engine', 'Audit Log',
  ];

  const WORKFLOW_STEPS = ['Draft', 'Under Review', 'Approved', 'Active', 'Archived'];

  const STATUS_COLORS = { published: 'badge-success', draft: 'badge-warning', active: 'badge-success', pending: 'badge-info' };

  // ============================================================
  // STATE
  // ============================================================
  let state = {
    currentPage: 'dashboard',
    apps: [],
    wizardStep: 0,
    wizardData: {},
    viewingApp: null,
    viewerPage: null,
    viewerPortal: 'customer',
    sidebarCollapsed: false,
    currentTab: 'all',
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

  function slug(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

  function toast(msg, type = 'info') {
    const c = $('#toast-container');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(24px)'; setTimeout(() => el.remove(), 300); }, 3500);
  }

  function showModal(title, body, onConfirm) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = body;
    $('#modal-overlay').style.display = 'flex';
    const confirm = $('#modal-confirm');
    const handler = () => { onConfirm(); hideModal(); confirm.removeEventListener('click', handler); };
    confirm.addEventListener('click', handler);
  }
  function hideModal() { $('#modal-overlay').style.display = 'none'; }

  function randomColor() {
    const colors = ['#6366f1','#3b82f6','#8b5cf6','#06b6d4','#10b981','#ef4444','#f59e0b','#ec4899','#14b8a6','#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ============================================================
  // LOGIN
  // ============================================================
  function initLogin() {
    $('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = $('#login-user').value.trim();
      const pass = $('#login-pass').value.trim();
      if (!user || !pass) { toast('Please fill in all fields', 'error'); return; }
      // Simulate login
      toast('Signed in as ' + user, 'success');
      $('#login-screen').classList.remove('active');
      $('#platform-shell').classList.add('active');
      navigateTo('dashboard');
    });
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function navigateTo(page, opts = {}) {
    state.currentPage = page;
    $$('.page').forEach(p => p.classList.remove('active'));
    const el = $('#page-' + page);
    if (el) el.classList.add('active');

    $$('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === page);
    });

    const titles = { dashboard: 'Dashboard', generator: 'App Generator', templates: 'Templates', launcher: 'App Launcher', settings: 'Settings', viewer: 'App Viewer' };
    $('#page-title').textContent = titles[page] || page;

    // Page-specific renders
    if (page === 'dashboard') renderDashboard();
    if (page === 'templates') renderTemplates();
    if (page === 'launcher') renderLauncher();
    if (page === 'generator') renderWizard();
  }

  function initNavigation() {
    $$('.nav-item').forEach(n => {
      n.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(n.dataset.page);
      });
    });

    $$('[data-navigate]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.navigate));
    });

    $('#sidebar-toggle').addEventListener('click', () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      $('#sidebar').classList.toggle('collapsed', state.sidebarCollapsed);
    });

    $('#btn-logout').addEventListener('click', () => {
      $('#platform-shell').classList.remove('active');
      $('#login-screen').classList.add('active');
      toast('Signed out', 'info');
    });
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  function renderDashboard() {
    renderRecentApps();
    drawCategoriesChart();
    drawStatusChart();
  }

  function renderRecentApps() {
    const tbody = $('#recent-apps-body');
    if (!state.apps.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">No apps created yet. <a href="#" data-navigate="generator">Create one</a></td></tr>';
      $$('[data-navigate="generator"]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); navigateTo('generator'); }));
      return;
    }
    tbody.innerHTML = state.apps.slice(-5).reverse().map(a => `
      <tr>
        <td><strong>${a.name}</strong></td>
        <td>${a.template || 'Blank'}</td>
        <td><span class="badge ${STATUS_COLORS[a.status] || 'badge-ghost'}">${a.status}</span></td>
        <td style="color:var(--text-muted)">${a.created}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="window.__viewApp('${a.id}')">View</button></td>
      </tr>
    `).join('');
  }

  function drawCategoriesChart() {
    const canvas = $('#chart-categories');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth - 48;
    const H = canvas.height = 180;
    ctx.clearRect(0, 0, W, H);

    const counts = {};
    state.apps.forEach(a => { counts[a.template || 'Blank'] = (counts[a.template || 'Blank'] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!entries.length) {
      ctx.fillStyle = '#6b7280'; ctx.font = '13px Inter'; ctx.textAlign = 'center';
      ctx.fillText('No data yet', W / 2, H / 2);
      return;
    }
    const maxVal = Math.max(...entries.map(e => e[1]));
    const barW = Math.min(40, (W - 40) / entries.length - 8);
    const chartH = H - 40;
    const colors = ['#6366f1', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];

    entries.forEach(([label, val], i) => {
      const x = 30 + i * (barW + 8);
      const h = (val / maxVal) * chartH;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(x, H - 30 - h, barW, h, 4);
      ctx.fill();
      ctx.fillStyle = '#9ca3af'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(label.substring(0, 6), x + barW / 2, H - 14);
      ctx.fillStyle = '#f0f0f5'; ctx.font = '11px Inter';
      ctx.fillText(val, x + barW / 2, H - 34 - h);
    });
  }

  function drawStatusChart() {
    const canvas = $('#chart-status');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth - 48;
    const H = canvas.height = 180;
    ctx.clearRect(0, 0, W, H);

    const published = state.apps.filter(a => a.status === 'published').length;
    const drafts = state.apps.filter(a => a.status === 'draft').length;
    const total = published + drafts;
    if (!total) {
      ctx.fillStyle = '#6b7280'; ctx.font = '13px Inter'; ctx.textAlign = 'center';
      ctx.fillText('No data yet', W / 2, H / 2);
      return;
    }
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 20;
    const data = [{ val: published, color: '#22c55e', label: 'Published' }, { val: drafts, color: '#f59e0b', label: 'Drafts' }];

    let startAngle = -Math.PI / 2;
    data.forEach(d => {
      if (d.val === 0) return;
      const slice = (d.val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      // Label
      const mid = startAngle + slice / 2;
      const lx = cx + Math.cos(mid) * (r * 0.65);
      const ly = cy + Math.sin(mid) * (r * 0.65);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
      ctx.fillText(d.val, lx, ly + 4);
      startAngle += slice;
    });
    // Legend
    let lx = 10, ly = H - 10;
    data.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillRect(lx, ly - 8, 10, 10);
      ctx.fillStyle = '#9ca3af'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
      ctx.fillText(d.label + ' (' + d.val + ')', lx + 14, ly);
      lx += ctx.measureText(d.label + ' (' + d.val + ')').width + 24;
    });
  }

  // ============================================================
  // WIZARD
  // ============================================================
  function initWizard() {
    $('#wizard-prev').addEventListener('click', () => {
      if (state.wizardStep > 0) { state.wizardStep--; renderWizard(); }
    });
    $('#wizard-next').addEventListener('click', () => {
      // Validate current step
      if (state.wizardStep === 0) {
        const name = state.wizardData.appName || '';
        if (!name.trim()) { toast('Please enter an app name', 'error'); return; }
      }
      if (state.wizardStep < WIZARD_STEPS.length - 1) {
        state.wizardStep++;
        renderWizard();
      } else {
        generateApp();
      }
    });
  }

  function renderWizard() {
    const step = state.wizardStep;
    const total = WIZARD_STEPS.length;

    // Step dots
    $('#wizard-steps').innerHTML = WIZARD_STEPS.map((s, i) => {
      let cls = 'wizard-step-dot';
      if (i === step) cls += ' active';
      else if (i < step) cls += ' completed';
      return `<div class="${cls}" data-step="${i}"><span class="wizard-step-num">${i < step ? '' : i + 1}</span>${s.label}</div>`;
    }).join('');

    $$('.wizard-step-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const s = parseInt(dot.dataset.step);
        if (s <= state.wizardStep) { state.wizardStep = s; renderWizard(); }
      });
    });

    // Content
    const fn = WIZARD_RENDERERS[WIZARD_STEPS[step].key];
    $('#wizard-content').innerHTML = fn ? fn() : '<p>Coming soon...</p>';

    // Nav
    $('#wizard-prev').disabled = step === 0;
    const nextBtn = $('#wizard-next');
    if (step === total - 1) {
      nextBtn.textContent = 'Generate App';
      nextBtn.className = 'btn btn-primary';
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.className = 'btn btn-primary';
    }
    $('#wizard-step-label').textContent = `Step ${step + 1} of ${total}`;

    // Bind step-specific inputs
    bindWizardInputs();
  }

  const WIZARD_RENDERERS = {
    appInfo() {
      const d = state.wizardData;
      return `
        <h3>Application Information</h3>
        <p class="step-desc">Provide the basic details for your new application.</p>
        <div class="wizard-form-row">
          <div class="field"><label>App Name *</label><input type="text" id="wiz-name" value="${d.appName || ''}" placeholder="e.g. Insika Marketplace"></div>
          <div class="field"><label>Slug</label><input type="text" id="wiz-slug" value="${d.appSlug || ''}" placeholder="auto-generated" readonly style="opacity:.7"></div>
        </div>
        <div class="field"><label>Description</label><textarea id="wiz-desc" placeholder="What does this app do?">${d.appDesc || ''}</textarea></div>
        <div class="wizard-form-row">
          <div class="field"><label>Category</label><select id="wiz-category"><option value="">Select...</option>${TEMPLATES.map(t => `<option value="${t.id}" ${d.category === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>
          <div class="field"><label>Version</label><input type="text" id="wiz-version" value="${d.version || '1.0.0'}" placeholder="1.0.0"></div>
        </div>`;
    },

    template() {
      const sel = state.wizardData.templateId;
      return `
        <h3>Choose Template</h3>
        <p class="step-desc">Select a pre-built template or start from scratch.</p>
        <div class="templates-grid">${TEMPLATES.map(t => `
          <div class="template-card ${sel === t.id ? 'selected' : ''}" data-tpl="${t.id}" style="${sel === t.id ? 'border-color:' + t.color : ''}">
            <div class="template-card-icon" style="background:${t.color}22;color:${t.color}">${t.icon}</div>
            <h4>${t.name}</h4>
            <p>${t.desc}</p>
          </div>`).join('')}
        </div>`;
    },

    modules() {
      const sel = state.wizardData.modules || [];
      return `
        <h3>Modules</h3>
        <p class="step-desc">Select which modules to include in your application.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          ${MODULE_LIST.map(m => `
            <label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all .2s;${sel.includes(m) ? 'border-color:var(--accent);background:var(--accent-muted)' : ''}">
              <input type="checkbox" class="wiz-module" value="${m}" ${sel.includes(m) ? 'checked' : ''} style="accent-color:var(--accent)">
              ${m}
            </label>`).join('')}
        </div>`;
    },

    portals() {
      const sel = state.wizardData.portals || [];
      return `
        <h3>Portals</h3>
        <p class="step-desc">Configure which portal interfaces to create.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
          ${Object.entries(PORTALS_MAP).map(([k, v]) => `
            <div style="padding:20px;background:var(--bg-elevated);border:2px solid ${sel.includes(k) ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius);cursor:pointer;transition:all .2s" class="wiz-portal-card" data-portal="${k}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <strong>${v.label}</strong>
                <input type="checkbox" class="wiz-portal" value="${k}" ${sel.includes(k) ? 'checked' : ''} style="accent-color:var(--accent)">
              </div>
              <p style="font-size:.8rem;color:var(--text-muted)">Pages: ${v.pages.join(', ')}</p>
            </div>`).join('')}
        </div>`;
    },

    roles() {
      const roles = state.wizardData.roles || ['Admin', 'User'];
      return `
        <h3>Roles & Permissions</h3>
        <p class="step-desc">Define user roles for your application.</p>
        <div id="wiz-roles-list">
          ${roles.map((r, i) => `
            <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
              <input type="text" class="wiz-role" value="${r}" style="flex:1;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary)">
              ${i > 0 ? `<button class="btn-icon wiz-role-remove" title="Remove" style="color:var(--danger)">&times;</button>` : ''}
            </div>`).join('')}
        </div>
        <button class="btn btn-sm btn-outline" id="wiz-add-role" style="margin-top:8px">+ Add Role</button>`;
    },

    workflow() {
      const steps = state.wizardData.workflow || [...WORKFLOW_STEPS];
      return `
        <h3>Workflow</h3>
        <p class="step-desc">Define the lifecycle stages for items in your application.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${steps.map((s, i) => `
            <div style="display:flex;align-items:center;gap:4px">
              <input type="text" class="wiz-workflow-step" value="${s}" style="width:140px;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:.85rem">
              ${i < steps.length - 1 ? '<svg width="20" height="20" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M6 10h8M11 6l3 4-3 4"/></svg>' : ''}
            </div>`).join('')}
        </div>
        <p class="step-desc" style="margin-top:12px">Items will move through these stages sequentially.</p>`;
    },

    pricing() {
      const pricing = state.wizardData.pricing || { model: 'free' };
      return `
        <h3>Pricing Model</h3>
        <p class="step-desc">Choose how your application monetizes.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
          ${['free', 'subscription', 'commission', 'listing_fee', 'tiered'].map(m => `
            <div style="padding:20px;background:var(--bg-elevated);border:2px solid ${pricing.model === m ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius);cursor:pointer;text-align:center;transition:all .2s" class="wiz-pricing-card" data-model="${m}">
              <div style="font-size:1.5rem;margin-bottom:6px">${{ free: '\u{1F193}', subscription: '\u{1F4B0}', commission: '\u{1F3ED}', listing_fee: '\u{1F4CB}', tiered: '\u{1F4C8}' }[m]}</div>
              <strong style="text-transform:capitalize">${m.replace('_', ' ')}</strong>
            </div>`).join('')}
        </div>`;
    },

    matching() {
      const enabled = state.wizardData.matching || false;
      return `
        <h3>Matching Engine</h3>
        <p class="step-desc">Enable intelligent matching between entities (e.g. buyers/sellers, riders/drivers).</p>
        <label style="display:flex;align-items:center;gap:12px;padding:20px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer">
          <input type="checkbox" id="wiz-matching" ${enabled ? 'checked' : ''} style="accent-color:var(--accent);width:20px;height:20px">
          <div>
            <strong>Enable Matching Engine</strong>
            <p style="font-size:.8rem;color:var(--text-muted);margin-top:2px">Automatically match entities based on configurable criteria</p>
          </div>
        </label>
        <div id="wiz-matching-options" style="margin-top:16px;${enabled ? '' : 'display:none'}">
          <div class="wizard-form-row">
            <div class="field"><label>Match Strategy</label><select class="wiz-match-strategy"><option>Proximity-based</option><option>Attribute-based</option><option>Score-based</option><option>Custom Rules</option></select></div>
            <div class="field"><label>Auto-match</label><select class="wiz-match-auto"><option value="manual">Manual Confirmation</option><option value="auto">Auto-match</option><option value="hybrid">Hybrid</option></select></div>
          </div>
        </div>`;
    },

    dashboards() {
      const boards = state.wizardData.dashboards || ['Overview', 'Analytics', 'Reports'];
      return `
        <h3>Dashboards</h3>
        <p class="step-desc">Configure dashboard pages for your portals.</p>
        <div id="wiz-dashboards-list">
          ${boards.map((b, i) => `
            <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
              <input type="text" class="wiz-dashboard" value="${b}" style="flex:1;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary)">
              ${i > 0 ? `<button class="btn-icon wiz-dashboard-remove" title="Remove" style="color:var(--danger)">&times;</button>` : ''}
            </div>`).join('')}
        </div>
        <button class="btn btn-sm btn-outline" id="wiz-add-dashboard" style="margin-top:8px">+ Add Dashboard</button>`;
    },

    menus() {
      const portals = state.wizardData.portals || ['customer'];
      const menus = state.wizardData.menus || {};
      return `
        <h3>Menus</h3>
        <p class="step-desc">Configure navigation menus for each portal.</p>
        ${portals.map(p => `
          <div style="margin-bottom:20px">
            <h4 style="margin-bottom:8px;color:var(--accent);text-transform:capitalize">${p} Portal</h4>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${(PORTALS_MAP[p]?.pages || []).map(pg => `
                <div style="padding:6px 14px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.85rem">
                  <input type="checkbox" checked class="wiz-menu-item" data-portal="${p}" value="${pg}" style="accent-color:var(--accent);margin-right:6px">${pg}
                </div>`).join('')}
            </div>
          </div>`).join('')}`;
    },

    theme() {
      const t = state.wizardData.theme || { primary: '#6366f1', radius: '10px', font: 'Inter' };
      return `
        <h3>Theme</h3>
        <p class="step-desc">Customize the visual appearance of your application.</p>
        <div class="wizard-form-row">
          <div class="field"><label>Primary Color</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="color" id="wiz-theme-color" value="${t.primary}" style="width:48px;height:40px;border:none;cursor:pointer">
              <input type="text" id="wiz-theme-color-text" value="${t.primary}" style="flex:1">
            </div>
          </div>
          <div class="field"><label>Border Radius</label><select id="wiz-theme-radius"><option ${t.radius === '4px' ? 'selected' : ''}>4px</option><option ${t.radius === '8px' || t.radius === '10px' ? 'selected' : ''}>10px</option><option ${t.radius === '16px' ? 'selected' : ''}>16px</option><option ${t.radius === '24px' ? 'selected' : ''}>24px</option></select></div>
        </div>
        <div class="field"><label>Font Family</label><select id="wiz-theme-font"><option ${t.font === 'Inter' ? 'selected' : ''}>Inter</option><option ${t.font === 'Roboto' ? 'selected' : ''}>Roboto</option><option ${t.font === 'Open Sans' ? 'selected' : ''}>Open Sans</option><option ${t.font === 'System' ? 'selected' : ''}>System</option></select></div>
        <div style="margin-top:16px">
          <label style="font-weight:500;color:var(--text-secondary);font-size:.85rem">Preview</label>
          <div style="margin-top:8px;padding:20px;background:var(--bg-elevated);border-radius:var(--radius);display:flex;gap:12px;align-items:center">
            <div style="width:48px;height:48px;border-radius:${t.radius};background:${t.primary};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">V</div>
            <div>
              <div style="font-weight:600;font-family:${t.font}">App Title</div>
              <div style="font-size:.8rem;color:var(--text-muted)">Sample content text</div>
            </div>
            <button class="btn btn-primary" style="background:${t.primary}">Button</button>
          </div>
        </div>`;
    },

    layout() {
      const l = state.wizardData.layout || 'sidebar';
      return `
        <h3>Layout</h3>
        <p class="step-desc">Choose the overall layout structure.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
          ${[
            { id: 'sidebar', label: 'Sidebar Navigation', icon: '\u{25A5}' },
            { id: 'topbar', label: 'Top Navigation', icon: '\u{2581}\u{2581}\u{2581}' },
            { id: 'hybrid', label: 'Hybrid', icon: '\u{25A5}\u{2581}' },
          ].map(o => `
            <div style="padding:24px;background:var(--bg-elevated);border:2px solid ${l === o.id ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius);cursor:pointer;text-align:center;transition:all .2s" class="wiz-layout-card" data-layout="${o.id}">
              <div style="font-size:2rem;margin-bottom:8px">${o.icon}</div>
              <strong>${o.label}</strong>
            </div>`).join('')}
        </div>`;
    },

    preview() {
      const d = state.wizardData;
      return `
        <h3>Preview</h3>
        <p class="step-desc">Review your configuration before generating.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="card"><h3 style="font-size:.9rem">App Details</h3>
            <table class="table">
              <tr><td style="color:var(--text-muted)">Name</td><td>${d.appName || '-'}</td></tr>
              <tr><td style="color:var(--text-muted)">Slug</td><td>${d.appSlug || '-'}</td></tr>
              <tr><td style="color:var(--text-muted)">Template</td><td>${d.templateId || 'Blank'}</td></tr>
              <tr><td style="color:var(--text-muted)">Version</td><td>${d.version || '1.0.0'}</td></tr>
            </table>
          </div>
          <div class="card"><h3 style="font-size:.9rem">Configuration</h3>
            <table class="table">
              <tr><td style="color:var(--text-muted)">Modules</td><td>${(d.modules || []).length} selected</td></tr>
              <tr><td style="color:var(--text-muted)">Portals</td><td>${(d.portals || []).join(', ') || '-'}</td></tr>
              <tr><td style="color:var(--text-muted)">Roles</td><td>${(d.roles || []).join(', ')}</td></tr>
              <tr><td style="color:var(--text-muted)">Pricing</td><td style="text-transform:capitalize">${(d.pricing?.model || 'free').replace('_', ' ')}</td></tr>
              <tr><td style="color:var(--text-muted)">Matching</td><td>${d.matching ? 'Enabled' : 'Disabled'}</td></tr>
            </table>
          </div>
        </div>`;
    },

    generate() {
      const d = state.wizardData;
      return `
        <h3>Generate Application</h3>
        <p class="step-desc">Everything is ready. Click <strong>Generate App</strong> to create your application.</p>
        <div style="padding:24px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius);text-align:center">
          <div style="font-size:3rem;margin-bottom:12px">${TEMPLATES.find(t => t.id === d.templateId)?.icon || '\u{2728}'}</div>
          <h2 style="margin-bottom:8px">${d.appName || 'New App'}</h2>
          <p style="color:var(--text-muted)">${d.appDesc || 'A new VelinX application'}</p>
        </div>`;
    },
  };

  function bindWizardInputs() {
    // App info
    const nameEl = $('#wiz-name');
    if (nameEl) {
      nameEl.addEventListener('input', () => {
        state.wizardData.appName = nameEl.value;
        const slugEl = $('#wiz-slug');
        if (slugEl) slugEl.value = slug(nameEl.value);
        state.wizardData.appSlug = slug(nameEl.value);
      });
    }
    const descEl = $('#wiz-desc');
    if (descEl) descEl.addEventListener('input', () => { state.wizardData.appDesc = descEl.value; });
    const catEl = $('#wiz-category');
    if (catEl) catEl.addEventListener('change', () => { state.wizardData.category = catEl.value; });
    const verEl = $('#wiz-version');
    if (verEl) verEl.addEventListener('input', () => { state.wizardData.version = verEl.value; });

    // Template
    $$('.template-card[data-tpl]').forEach(c => {
      c.addEventListener('click', () => {
        state.wizardData.templateId = c.dataset.tpl;
        const tpl = TEMPLATES.find(t => t.id === c.dataset.tpl);
        if (tpl && !state.wizardData.appName) {
          state.wizardData.appName = 'My ' + tpl.name + ' App';
          state.wizardData.appSlug = slug(state.wizardData.appName);
          state.wizardData.category = tpl.id;
        }
        renderWizard();
      });
    });

    // Modules
    $$('.wiz-module').forEach(cb => {
      cb.addEventListener('change', () => {
        const mods = state.wizardData.modules = state.wizardData.modules || [];
        if (cb.checked && !mods.includes(cb.value)) mods.push(cb.value);
        else if (!cb.checked) { const i = mods.indexOf(cb.value); if (i >= 0) mods.splice(i, 1); }
      });
    });

    // Portals
    $$('.wiz-portal').forEach(cb => {
      cb.addEventListener('change', () => {
        const p = state.wizardData.portals = state.wizardData.portals || [];
        if (cb.checked && !p.includes(cb.value)) p.push(cb.value);
        else if (!cb.checked) { const i = p.indexOf(cb.value); if (i >= 0) p.splice(i, 1); }
      });
    });
    $$('.wiz-portal-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); }
      });
    });

    // Roles
    $$('.wiz-role').forEach(inp => inp.addEventListener('input', () => {
      state.wizardData.roles = $$('.wiz-role').map(i => i.value);
    }));
    $$('.wiz-role-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.wizardData.roles = $$('.wiz-role').filter(i => i !== btn.previousElementSibling).map(i => i.value);
        renderWizard();
      });
    });
    const addRole = $('#wiz-add-role');
    if (addRole) addRole.addEventListener('click', () => {
      state.wizardData.roles = state.wizardData.roles || ['Admin', 'User'];
      state.wizardData.roles.push('New Role');
      renderWizard();
    });

    // Workflow
    $$('.wiz-workflow-step').forEach(inp => inp.addEventListener('input', () => {
      state.wizardData.workflow = $$('.wiz-workflow-step').map(i => i.value);
    }));

    // Pricing
    $$('.wiz-pricing-card').forEach(card => {
      card.addEventListener('click', () => {
        state.wizardData.pricing = { model: card.dataset.model };
        renderWizard();
      });
    });

    // Matching
    const matchCb = $('#wiz-matching');
    if (matchCb) matchCb.addEventListener('change', () => {
      state.wizardData.matching = matchCb.checked;
      const opt = $('#wiz-matching-options');
      if (opt) opt.style.display = matchCb.checked ? '' : 'none';
    });

    // Dashboards
    $$('.wiz-dashboard').forEach(inp => inp.addEventListener('input', () => {
      state.wizardData.dashboards = $$('.wiz-dashboard').map(i => i.value);
    }));
    const addDash = $('#wiz-add-dashboard');
    if (addDash) addDash.addEventListener('click', () => {
      state.wizardData.dashboards = state.wizardData.dashboards || ['Overview'];
      state.wizardData.dashboards.push('New Dashboard');
      renderWizard();
    });

    // Theme
    const themeColor = $('#wiz-theme-color');
    const themeColorText = $('#wiz-theme-color-text');
    if (themeColor) themeColor.addEventListener('input', () => {
      state.wizardData.theme = { ...(state.wizardData.theme || {}), primary: themeColor.value };
      if (themeColorText) themeColorText.value = themeColor.value;
    });
    if (themeColorText) themeColorText.addEventListener('input', () => {
      state.wizardData.theme = { ...(state.wizardData.theme || {}), primary: themeColorText.value };
      if (themeColor) themeColor.value = themeColorText.value;
    });
    const radiusEl = $('#wiz-theme-radius');
    if (radiusEl) radiusEl.addEventListener('change', () => {
      state.wizardData.theme = { ...(state.wizardData.theme || {}), radius: radiusEl.value };
    });
    const fontEl = $('#wiz-theme-font');
    if (fontEl) fontEl.addEventListener('change', () => {
      state.wizardData.theme = { ...(state.wizardData.theme || {}), font: fontEl.value };
    });

    // Layout
    $$('.wiz-layout-card').forEach(card => {
      card.addEventListener('click', () => {
        state.wizardData.layout = card.dataset.layout;
        renderWizard();
      });
    });
  }

  function generateApp() {
    const d = state.wizardData;
    if (!d.appName) { toast('App name is required', 'error'); return; }

    const app = {
      id: 'app-' + Date.now(),
      name: d.appName,
      slug: d.appSlug || slug(d.appName),
      template: d.templateId || 'blank',
      description: d.appDesc || '',
      status: 'published',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      config: { ...d },
      portals: d.portals || ['customer'],
      modules: d.modules || [],
      roles: d.roles || ['Admin', 'User'],
      theme: d.theme || { primary: '#6366f1' },
      layout: d.layout || 'sidebar',
    };

    // Ensure at least customer portal
    if (!app.portals.length) app.portals.push('customer');

    state.apps.push(app);
    toast(`"${app.name}" created successfully!`, 'success');

    // Reset wizard
    state.wizardStep = 0;
    state.wizardData = {};
    navigateTo('launcher');
  }

  // ============================================================
  // TEMPLATES PAGE
  // ============================================================
  function renderTemplates() {
    $('#templates-grid').innerHTML = TEMPLATES.map(t => `
      <div class="template-card" data-tpl="${t.id}">
        <div class="template-card-icon" style="background:${t.color}22;color:${t.color}">${t.icon}</div>
        <h4>${t.name}</h4>
        <p>${t.desc}</p>
        <button class="btn btn-sm btn-primary" data-use-template="${t.id}">Use Template</button>
      </div>`).join('');

    $$('[data-use-template]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.wizardData.templateId = btn.dataset.useTemplate;
        const tpl = TEMPLATES.find(t => t.id === btn.dataset.useTemplate);
        state.wizardData.appName = 'My ' + (tpl ? tpl.name : 'App') + ' App';
        state.wizardData.appSlug = slug(state.wizardData.appName);
        state.wizardData.category = btn.dataset.useTemplate;
        navigateTo('generator');
      });
    });
  }

  // ============================================================
  // LAUNCHER
  // ============================================================
  function renderLauncher() {
    const grid = $('#launcher-grid');
    const empty = $('#launcher-empty');
    const filtered = state.currentTab === 'all' ? state.apps : state.apps.filter(a => a.status === state.currentTab);

    if (!filtered.length) {
      grid.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = filtered.map(a => {
      const tpl = TEMPLATES.find(t => t.id === a.template);
      const color = tpl?.color || a.theme?.primary || '#6366f1';
      return `
        <div class="launcher-card">
          <div class="launcher-card-header">
            <div class="launcher-card-icon" style="background:${color}22;color:${color}">${tpl?.icon || '\u{1F4E6}'}</div>
            <div>
              <h4>${a.name}</h4>
              <div class="app-type">${tpl?.name || 'Blank'}</div>
            </div>
          </div>
          <p>${a.description || 'No description'}</p>
          <div class="launcher-card-footer">
            <button class="btn btn-sm btn-primary" onclick="window.__viewApp('${a.id}')">Open</button>
            <button class="btn btn-sm btn-outline" onclick="window.__editApp('${a.id}')">Edit</button>
            <button class="btn btn-sm btn-ghost" onclick="window.__deleteApp('${a.id}')" style="color:var(--danger)">Delete</button>
          </div>
        </div>`;
    }).join('');
  }

  function initLauncher() {
    $$('.tab[data-tab]').forEach(t => {
      t.addEventListener('click', () => {
        state.currentTab = t.dataset.tab;
        $$('.tab').forEach(x => x.classList.toggle('active', x === t));
        renderLauncher();
      });
    });
  }

  // ============================================================
  // APP VIEWER
  // ============================================================
  window.__viewApp = function (id) {
    const app = state.apps.find(a => a.id === id);
    if (!app) return;
    state.viewingApp = app;
    state.viewerPortal = app.portals?.[0] || 'customer';
    state.viewerPage = null;
    navigateTo('viewer');
    renderViewer();
  };

  window.__editApp = function (id) {
    const app = state.apps.find(a => a.id === id);
    if (!app) return;
    state.wizardData = { ...(app.config || {}), appName: app.name, appSlug: app.slug };
    state.wizardStep = 0;
    navigateTo('generator');
  };

  window.__deleteApp = function (id) {
    const app = state.apps.find(a => a.id === id);
    if (!app) return;
    showModal('Delete App', `Are you sure you want to delete "<strong>${app.name}</strong>"? This cannot be undone.`, () => {
      state.apps = state.apps.filter(a => a.id !== id);
      toast('App deleted', 'info');
      renderLauncher();
    });
  };

  function renderViewer() {
    const app = state.viewingApp;
    if (!app) return;

    $('#viewer-app-name').textContent = app.name;

    // Portal select
    const sel = $('#viewer-portal');
    sel.innerHTML = app.portals.map(p => `<option value="${p}" ${p === state.viewerPortal ? 'selected' : ''}>${PORTALS_MAP[p]?.label || p}</option>`).join('');
    sel.onchange = () => { state.viewerPortal = sel.value; state.viewerPage = null; renderViewerNav(); renderViewerContent(); };

    renderViewerNav();
    renderViewerContent();
  }

  function renderViewerNav() {
    const app = state.viewingApp;
    const portal = state.viewerPortal;
    const pages = PORTALS_MAP[portal]?.pages || ['Dashboard'];
    if (!state.viewerPage) state.viewerPage = pages[0];

    $('#viewer-nav').innerHTML = pages.map(p => `
      <div class="viewer-nav-item ${p === state.viewerPage ? 'active' : ''}" data-page="${p}">${p}</div>
    `).join('');

    $$('.viewer-nav-item', $('#viewer-nav')).forEach(item => {
      item.addEventListener('click', () => {
        state.viewerPage = item.dataset.page;
        renderViewerNav();
        renderViewerContent();
      });
    });
  }

  function renderViewerContent() {
    const app = state.viewingApp;
    const page = state.viewerPage || 'Dashboard';
    const portal = state.viewerPortal;
    const color = app.theme?.primary || '#6366f1';

    const widgets = generateWidgets(page, portal);
    const listItems = generateListItems(page, portal, app);

    $('#viewer-content').innerHTML = `
      <div class="viewer-page-header">
        <h1>${page}</h1>
        <p>${app.name} &mdash; ${PORTALS_MAP[portal]?.label || portal}</p>
      </div>
      ${widgets ? `<div class="widget-grid">${widgets}</div>` : ''}
      ${listItems ? `<div class="card"><ul class="viewer-list">${listItems}</ul></div>` : ''}
      ${page === 'Settings' ? renderSettings(app) : ''}
    `;
  }

  function generateWidgets(page, portal) {
    if (['Dashboard', 'Overview'].includes(page)) {
      return `
        <div class="widget-card"><h4>Total Users</h4><div class="widget-value">1,284</div></div>
        <div class="widget-card"><h4>Active Sessions</h4><div class="widget-value">73</div></div>
        <div class="widget-card"><h4>Revenue</h4><div class="widget-value" style="color:var(--success)">$12.4K</div></div>
        <div class="widget-card"><h4>Growth</h4><div class="widget-value" style="color:var(--info)">+18%</div></div>`;
    }
    if (page === 'Analytics' || page === 'Reports') {
      return `
        <div class="widget-card" style="grid-column:span 2"><h4>Trend</h4><div class="chart-placeholder">Chart Placeholder</div></div>`;
    }
    return '';
  }

  function generateListItems(page, portal, app) {
    if (['Orders', 'Tasks', 'Content'].includes(page)) {
      const items = ['Item #1001', 'Item #1002', 'Item #1003', 'Item #1004', 'Item #1005'];
      return items.map(i => `
        <li>
          <span><strong>${i}</strong> <span style="color:var(--text-muted)">&middot; ${page === 'Orders' ? 'Pending' : page === 'Tasks' ? 'In Progress' : 'Published'}</span></span>
          <span class="badge ${page === 'Orders' ? 'badge-warning' : page === 'Tasks' ? 'badge-info' : 'badge-success'}">${page === 'Orders' ? 'Pending' : page === 'Tasks' ? 'Active' : 'Live'}</span>
        </li>`).join('');
    }
    if (['Browse', 'Listings'].includes(page)) {
      const items = ['Listing Alpha', 'Listing Beta', 'Listing Gamma', 'Listing Delta'];
      return items.map(i => `
        <li>
          <span><strong>${i}</strong> <span style="color:var(--text-muted)">&middot; Listed 2 days ago</span></span>
          <button class="btn btn-sm btn-ghost">View</button>
        </li>`).join('');
    }
    if (['Users', 'Profile'].includes(page)) {
      const users = ['Alice Mokoena', 'Thabo Nkosi', 'Lerato Dlamini', 'Sipho Molefe'];
      return users.map(u => `
        <li>
          <span><strong>${u}</strong> <span style="color:var(--text-muted)">&middot; Active</span></span>
          <button class="btn btn-sm btn-ghost">Edit</button>
        </li>`).join('');
    }
    if (['Messages', 'Support'].includes(page)) {
      const msgs = ['How do I reset my password?', 'Can I change my subscription?', 'I need help with checkout', 'When will my order arrive?'];
      return msgs.map(m => `
        <li>
          <span>${m}</span>
          <span class="badge badge-info">Open</span>
        </li>`).join('');
    }
    if (page === 'Earnings') {
      return `
        <li><span>March 2026</span><span style="color:var(--success);font-weight:600">$3,420.00</span></li>
        <li><span>February 2026</span><span style="color:var(--success);font-weight:600">$2,890.00</span></li>
        <li><span>January 2026</span><span style="color:var(--success);font-weight:600">$3,150.00</span></li>`;
    }
    if (page === 'Schedule') {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      return days.map(d => `
        <li><span><strong>${d}</strong></span><span style="color:var(--text-muted)">8:00 AM &mdash; 5:00 PM</span></li>`).join('');
    }
    return '';
  }

  function renderSettings(app) {
    return `
      <div class="card" style="margin-bottom:16px">
        <h3>Application Settings</h3>
        <div class="field"><label>App Name</label><input type="text" value="${app.name}" readonly></div>
        <div class="field"><label>Description</label><textarea readonly>${app.description}</textarea></div>
        <div class="field"><label>Template</label><input type="text" value="${app.template}" readonly></div>
      </div>`;
  }

  // ============================================================
  // SETTINGS (Theme)
  // ============================================================
  function initSettings() {
    $$('.swatch').forEach(s => {
      s.addEventListener('click', () => {
        $$('.swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        const themes = {
          indigo: '#6366f1', blue: '#3b82f6', emerald: '#10b981',
          rose: '#f43f5e', amber: '#f59e0b', cyan: '#06b6d4',
        };
        document.documentElement.style.setProperty('--accent', themes[s.dataset.theme] || '#6366f1');
        toast('Theme updated', 'success');
      });
    });
  }

  // ============================================================
  // MODAL
  // ============================================================
  function initModal() {
    $('#modal-close').addEventListener('click', hideModal);
    $('#modal-cancel').addEventListener('click', hideModal);
    $('#modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) hideModal(); });
  }

  // ============================================================
  // BOOT
  // ============================================================
  function init() {
    initLogin();
    initNavigation();
    initWizard();
    initLauncher();
    initSettings();
    initModal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
