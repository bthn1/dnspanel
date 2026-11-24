/* DNS PRO provider registry and connection routing.
 * Secrets are never written to localStorage. Provider adapters must declare capabilities;
 * unsupported features are intentionally hidden rather than simulated.
 */
(() => {
  'use strict';

  const providers = [
    { id:'nextdns', name:'NextDNS', type:'managed', status:'ready', auth:'api-key', features:['profiles','analytics','logs','allowlist','denylist','parental','privacy'], note:'Mevcut NextDNS API bağlantısı korunur.' },
    { id:'cloudflare', name:'Cloudflare Gateway', type:'managed', status:'adapter-required', auth:'api-token', features:['policies','locations','analytics'], note:'Zero Trust hesabı, account ID ve API token gerekir. Güvenli yönetim için sunucu tarafı bağlayıcı gerekir.' },
    { id:'adguard-home', name:'AdGuard Home', type:'self-hosted', status:'adapter-required', auth:'instance', features:['filters','clients','statistics','rewrites'], note:'Kendi AdGuard Home sunucu adresin ve yönetici erişimin gerekir.' },
    { id:'controld', name:'Control D', type:'managed', status:'adapter-required', auth:'api-key', features:['profiles','devices','analytics'], note:'Control D API kimlik doğrulaması ve hesap kapsamı bağlanacak.' },
    { id:'umbrella', name:'Cisco Umbrella', type:'enterprise', status:'adapter-required', auth:'oauth', features:['policies','identities','reports'], note:'Kurumsal kuruluş bilgileri ve OAuth/API erişimi gerekir.' },
    { id:'quad9', name:'Quad9', type:'resolver', status:'resolver-ready', auth:'none', features:['resolver-setup'], doh:'https://dns.quad9.net/dns-query', dns:['9.9.9.9','149.112.112.112'], note:'Genel DNS çözümleyici. Bu servis kişisel hesap yönetimi, cihaz listesi veya sorgu paneli API’si sunmaz.' },
    { id:'google', name:'Google Public DNS', type:'resolver', status:'resolver-ready', auth:'none', features:['resolver-setup'], doh:'https://dns.google/dns-query', dns:['8.8.8.8','8.8.4.4'], note:'Genel DNS çözümleyici; sağlayıcı hesabı ve yönetim paneli API’si yoktur.' },
    { id:'mullvad', name:'Mullvad DNS', type:'resolver', status:'resolver-ready', auth:'none', features:['resolver-setup'], doh:'https://doh.mullvad.net/dns-query', dns:[], note:'Resolver profili olarak eklenir; yönetim API’si gibi gösterilmez.' },
    { id:'opendns', name:'OpenDNS', type:'resolver', status:'resolver-ready', auth:'none', features:['resolver-setup'], doh:'', dns:['208.67.222.222','208.67.220.220'], note:'Temel resolver kurulumu. Gelişmiş Cisco/OpenDNS yönetimi ayrı kurumsal adaptör gerektirir.' },
    { id:'other', name:'Diğer DNS', type:'custom', status:'custom', auth:'endpoint', features:['resolver-setup'], note:'Özel DNS-over-HTTPS adresi veya IP adresi eklemek için.' },
    { id:'pihole', name:'Pi-hole', type:'self-hosted', status:'adapter-required', auth:'instance', features:['lists','clients','statistics'], note:'Pi-hole sunucu adresi ve API erişimi gerekir.' },
    { id:'technitium', name:'Technitium DNS', type:'self-hosted', status:'adapter-required', auth:'instance', features:['zones','scopes','statistics','blocking'], note:'Technitium sunucu adresi ve API erişimi gerekir.' }
  ];

  const state = { selected: localStorage.getItem('dnspro_provider') || 'nextdns' };
  const byId = id => providers.find(p => p.id === id) || providers[0];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function render() {
    const select = document.getElementById('dns-provider-select');
    const info = document.getElementById('dns-provider-info');
    const badge = document.getElementById('dns-provider-badge');
    const keyLabel = document.querySelector('label[for="api-key-input"]');
    const keyInput = document.getElementById('api-key-input');
    const loginBtn = document.getElementById('login-btn');
    if (!select || !info || !loginBtn) return;
    select.innerHTML = providers.map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('');
    select.value = state.selected;
    const p = byId(state.selected);
    info.innerHTML = '<div class="font-semibold text-zinc-200 mb-1">' + esc(p.name) + '</div><p>' + esc(p.note) + '</p>' +
      (p.doh ? '<p class="mt-2 break-all text-blue-300">DoH: ' + esc(p.doh) + '</p>' : '') +
      (p.dns && p.dns.length ? '<p class="mt-1 text-blue-300">DNS: ' + esc(p.dns.join(' · ')) + '</p>' : '') +
      (p.status === 'adapter-required' || p.status === 'enterprise' ? '<p class="mt-2 text-amber-300">Yönetim adaptörü henüz etkin değil. API anahtarını bu ekrana girmek şu anda sağlayıcıya bağlanmaz.</p>' : '');
    if (badge) badge.textContent = p.type === 'resolver' ? 'Resolver profili' : p.status === 'ready' ? 'API bağlantısı hazır' : p.status === 'custom' ? 'Özel sağlayıcı' : 'Adaptör gerekli';
    if (keyLabel) keyLabel.textContent = p.id === 'nextdns' ? 'NextDNS API Anahtarı' : p.id === 'other' ? 'Özel DoH adresi / DNS bilgisi' : p.auth === 'none' ? 'Bu sağlayıcı için API anahtarı gerekmez' : 'Sağlayıcı kimlik bilgileri (adaptör etkinleştirildiğinde)';
    if (keyInput) {
      keyInput.placeholder = p.id === 'nextdns' ? 'NextDNS API anahtarınızı yapıştırın...' : p.id === 'other' ? 'https://dns.example/dns-query veya DNS IP' : 'Bu sağlayıcının bağlantısı henüz etkin değil';
      keyInput.disabled = !(p.id === 'nextdns' || p.id === 'other');
      if (p.id !== 'nextdns' && p.id !== 'other') keyInput.value = '';
    }
    loginBtn.textContent = p.id === 'nextdns' ? 'NextDNS hesabına bağlan' : (p.status === 'resolver-ready' || p.id === 'other') ? 'Resolver profilini kaydet' : 'Sağlayıcı adaptörü gerekli';
    loginBtn.disabled = p.status === 'adapter-required' || p.status === 'enterprise';
    loginBtn.classList.toggle('opacity-50', loginBtn.disabled);
    document.getElementById('readonly-stats-btn')?.toggleAttribute('disabled', p.id !== 'nextdns');
    document.getElementById('readonly-profile-id')?.toggleAttribute('disabled', p.id !== 'nextdns');
    document.getElementById('nextdns-account-link')?.classList.toggle('hidden', p.id !== 'nextdns');
  }

  function init() {
    const select = document.getElementById('dns-provider-select');
    if (!select) return;
    select.addEventListener('change', () => {
      state.selected = select.value;
      localStorage.setItem('dnspro_provider', state.selected);
      render();
    });
    const button = document.getElementById('login-btn');
    button?.addEventListener('click', event => {
      const p = byId(state.selected);
      if (p.id === 'nextdns') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const info = document.getElementById('dns-provider-info');
      if (p.status === 'resolver-ready' || p.id === 'other') {
        const entered = document.getElementById('api-key-input')?.value.trim() || '';
        if (p.id === 'other' && !(entered.startsWith('https://') || entered.startsWith('http://') || /^[a-zA-Z0-9.-]+$/.test(entered))) {
          info.insertAdjacentHTML('beforeend', '<p class="mt-3 text-amber-300">Geçerli bir DoH URL’si veya DNS sunucu adresi gir.</p>');
          return;
        }
        const profile = { provider:p.id, name:p.name, doh:p.doh || (entered.startsWith('http') ? entered : ''), address:p.id === 'other' && !entered.startsWith('http') ? entered : '', savedAt:new Date().toISOString() };
        const saved = JSON.parse(localStorage.getItem('dnspro_resolver_profiles') || '[]').filter(x => x.provider !== p.id || p.id !== 'other');
        saved.push(profile);
        localStorage.setItem('dnspro_resolver_profiles', JSON.stringify(saved));
        info.insertAdjacentHTML('beforeend', '<p class="mt-3 text-emerald-300">Resolver profili bu tarayıcıya kaydedildi. DNS ayarlarına otomatik uygulanmadı; cihaz kurulum adımı ayrıca yapılmalı.</p>');
      }
    }, true);
    render();
  }

  window.DNSPRO = Object.freeze({
    providers,
    get selectedProvider() { return byId(state.selected); },
    getCapabilities(providerId) { return [...byId(providerId).features]; },
    supports(providerId, capability) { return byId(providerId).features.includes(capability); },
    getAdapterStatus(providerId) { return byId(providerId).status; }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();