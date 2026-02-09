    // Weather App (OpenWeatherMap)
    // - Uses 2 endpoints: /weather (current) + /forecast (5 day / 3 hour)
    // - Search by city query or use Geolocation (lat/lon)
    // - Stores apiKey + units in localStorage

    const els = {
      q: document.querySelector('#q'),
      btnSearch: document.querySelector('#btnSearch'),
      btnHere: document.querySelector('#btnHere'),
      apiKey: document.querySelector('#apiKey'),
      units: document.querySelector('#units'),

      statusDot: document.querySelector('#statusDot'),
      statusText: document.querySelector('#statusText'),

      city: document.querySelector('#city'),
      meta: document.querySelector('#meta'),
      temp: document.querySelector('#temp'),
      desc: document.querySelector('#desc'),
      feels: document.querySelector('#feels'),
      humidity: document.querySelector('#humidity'),
      wind: document.querySelector('#wind'),
      pressure: document.querySelector('#pressure'),
      updated: document.querySelector('#updated'),
      icon: document.querySelector('#icon'),

      tz: document.querySelector('#tz'),
      forecast: document.querySelector('#forecast'),

      toast: document.querySelector('#toast'),
      toastTitle: document.querySelector('#toastTitle'),
      toastBody: document.querySelector('#toastBody'),
    };

    const LS = {
      apiKey: 'owm_api_key',
      units: 'owm_units',
      lastQuery: 'owm_last_query'
    };

    const OWM = {
      base: 'https://api.openweathermap.org/data/2.5',
      icon: (code) => `https://openweathermap.org/img/wn/${code}@2x.png`,
    };

    init();

    function init() {
      // Restore settings
      const savedKey = localStorage.getItem(LS.apiKey);
      const savedUnits = localStorage.getItem(LS.units);
      const savedQuery = localStorage.getItem(LS.lastQuery);

      if (savedKey) els.apiKey.value = savedKey;
      if (savedUnits) els.units.value = savedUnits;
      if (savedQuery) els.q.value = savedQuery;

      updateUnitsMeta();
      setStatus('Idle', 'neutral');

      // Events
      els.btnSearch.addEventListener('click', onSearch);
      els.btnHere.addEventListener('click', onUseMyLocation);
      els.q.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') onSearch();
      });

      els.apiKey.addEventListener('input', () => {
        localStorage.setItem(LS.apiKey, els.apiKey.value.trim());
      });

      els.units.addEventListener('input', () => {
        localStorage.setItem(LS.units, els.units.value.trim());
        updateUnitsMeta();
      });

      // Optional: auto-load last query on refresh (if key exists)
      if (savedKey && savedQuery) {
        onSearch(true);
      }
    }

    function updateUnitsMeta() {
      const u = (els.units.value || 'imperial').trim();
      const label = u === 'metric' ? '°C / m/s' : (u === 'standard' ? 'K / m/s' : '°F / mph');
      els.meta.textContent = `units: ${label}`;
    }

    function setStatus(text, state) {
      // state: 'neutral' | 'ok' | 'bad'
      els.statusText.textContent = text;
      els.statusDot.className = 'dot' + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '');
    }

    function toast(title, body) {
      els.toastTitle.textContent = title;
      els.toastBody.textContent = body;
      els.toast.classList.add('show');
      window.clearTimeout(toast._t);
      toast._t = window.setTimeout(() => els.toast.classList.remove('show'), 4500);
    }

    function getKey() {
      const key = (els.apiKey.value || '').trim();
      if (!key) {
        toast('Missing API key', 'Paste your OpenWeatherMap API key in Config.');
        throw new Error('Missing API key');
      }
      return key;
    }

    function getUnits() {
      const u = (els.units.value || 'imperial').trim();
      return u || 'imperial';
    }

    async function onSearch(silent = false) {
      const q = (els.q.value || '').trim();
      if (!q) {
        if (!silent) toast('Type a city', 'Example: “Orlando, FL” or “London”.');
        return;
      }

      localStorage.setItem(LS.lastQuery, q);

      try {
        setStatus('Loading…', 'neutral');
        const key = getKey();
        const units = getUnits();

        // Current
        const current = await owmFetch('/weather', { q, appid: key, units });
        renderCurrent(current, units);

        // Forecast (same city query)
        const fc = await owmFetch('/forecast', { q, appid: key, units });
        renderForecast(fc, units);

        setStatus('Live', 'ok');
      } catch (err) {
        console.error(err);
        setStatus('Error', 'bad');
        toast('Could not load weather', humanizeError(err));
      }
    }

    async function onUseMyLocation() {
      if (!('geolocation' in navigator)) {
        toast('Geolocation not available', 'Your browser/device does not support geolocation.');
        return;
      }

      try {
        setStatus('Locating…', 'neutral');
        const pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 });
        const { latitude: lat, longitude: lon } = pos.coords;

        setStatus('Loading…', 'neutral');
        const key = getKey();
        const units = getUnits();

        // Current
        const current = await owmFetch('/weather', { lat, lon, appid: key, units });
        renderCurrent(current, units);

        // Forecast
        const fc = await owmFetch('/forecast', { lat, lon, appid: key, units });
        renderForecast(fc, units);

        // Put a friendly label into the search box for later
        if (current?.name) {
          els.q.value = current.sys?.country ? `${current.name}, ${current.sys.country}` : current.name;
          localStorage.setItem(LS.lastQuery, els.q.value);
        }

        setStatus('Live', 'ok');
      } catch (err) {
        console.error(err);
        setStatus('Error', 'bad');
        toast('Location failed', humanizeError(err));
      }
    }

    function getPosition(options) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    }

    async function owmFetch(path, params) {
      const url = new URL(OWM.base + path);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

      const res = await fetch(url.toString());
      let data;
      try { data = await res.json(); } catch { data = null; }

      if (!res.ok) {
        const msg = data?.message ? String(data.message) : `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    }

    function renderCurrent(data, units) {
      // Defensive: OpenWeatherMap can omit some fields based on errors
      const name = data?.name ?? 'Unknown';
      const country = data?.sys?.country ?? '';
      const dt = data?.dt ? new Date(data.dt * 1000) : new Date();

      const w = Array.isArray(data?.weather) ? data.weather[0] : null;
      const main = data?.main ?? {};
      const wind = data?.wind ?? {};

      els.city.textContent = country ? `${name}, ${country}` : name;
      els.desc.textContent = w?.description ? capitalize(w.description) : '—';

      const t = main?.temp;
      els.temp.textContent = Number.isFinite(t) ? `${Math.round(t)}°` : '--°';

      const feels = main?.feels_like;
      els.feels.textContent = Number.isFinite(feels) ? fmtTemp(feels, units) : '—';

      const hum = main?.humidity;
      els.humidity.textContent = Number.isFinite(hum) ? `${Math.round(hum)}%` : '—';

      const pres = main?.pressure;
      els.pressure.textContent = Number.isFinite(pres) ? `${Math.round(pres)} hPa` : '—';

      const wSpeed = wind?.speed;
      els.wind.textContent = Number.isFinite(wSpeed) ? fmtWind(wSpeed, units) : '—';

      els.updated.textContent = `Last updated: ${dt.toLocaleString()}`;

      // icon
      const iconCode = w?.icon;
      if (iconCode) {
        els.icon.src = OWM.icon(iconCode);
        els.icon.hidden = false;
        els.icon.alt = w?.main ? `Icon: ${w.main}` : 'Weather icon';
      } else {
        els.icon.hidden = true;
        els.icon.alt = '';
      }

      // timezone info
      const tzSeconds = Number.isFinite(data?.timezone) ? data.timezone : null;
      if (tzSeconds !== null) {
        const hours = tzSeconds / 3600;
        els.tz.textContent = `Timezone offset: UTC${hours >= 0 ? '+' : ''}${hours}`;
      } else {
        els.tz.textContent = 'Timezone: --';
      }
    }

    function renderForecast(data, units) {
      // OpenWeatherMap /forecast gives list[] of 3-hour steps
      const list = Array.isArray(data?.list) ? data.list : [];
      const first8 = list.slice(0, 8);

      els.forecast.innerHTML = '';

      if (!first8.length) {
        els.forecast.innerHTML = `<div class="small">No forecast data.</div>`;
        return;
      }

      for (const item of first8) {
        const dt = item?.dt ? new Date(item.dt * 1000) : null;
        const when = dt ? dt.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

        const w = Array.isArray(item?.weather) ? item.weather[0] : null;
        const icon = w?.icon;

        const t = item?.main?.temp;
        const tTxt = Number.isFinite(t) ? fmtTemp(t, units) : '—';

        const pop = Number.isFinite(item?.pop) ? `${Math.round(item.pop * 100)}%` : '—';

        const el = document.createElement('div');
        el.className = 'slot';
        el.innerHTML = `
          <div class="when">${escapeHtml(when)}</div>
          <div class="line">
            <div class="t">${escapeHtml(tTxt)}</div>
            ${icon ? `<img alt="" src="${OWM.icon(icon)}" />` : ``}
          </div>
          <div class="small">${escapeHtml(w?.description ? capitalize(w.description) : '—')}</div>
          <div class="small">Rain chance: <span style="font-family: var(--mono)">${escapeHtml(pop)}</span></div>
        `;

        els.forecast.appendChild(el);
      }
    }

    function fmtTemp(value, units) {
      const v = Math.round(value);
      if (units === 'metric') return `${v}°C`;
      if (units === 'standard') return `${v}K`;
      return `${v}°F`;
    }

    function fmtWind(value, units) {
      // OpenWeatherMap returns m/s for metric & standard; mph for imperial
      const v = Math.round(value);
      if (units === 'imperial') return `${v} mph`;
      return `${v} m/s`;
    }

    function capitalize(s) {
      return String(s).split(' ').map(w => w ? (w[0].toUpperCase() + w.slice(1)) : '').join(' ');
    }

    function humanizeError(err) {
      if (!err) return 'Unknown error';
      const msg = String(err.message || err);

      // Common OWM responses: "city not found", "Invalid API key", etc.
      if (msg.toLowerCase().includes('invalid api key')) {
        return 'Your API key looks invalid. Double-check it in OpenWeatherMap and try again.';
      }
      if (msg.toLowerCase().includes('city not found')) {
        return 'City not found. Try a different spelling or add a country/state.';
      }
      if (err.status === 401) {
        return 'Unauthorized (401). Check your API key.';
      }
      if (err.status === 429) {
        return 'Rate limited (429). You hit the API too fast. Try again in a minute.';
      }
      return msg;
    }

    function escapeHtml(str) {
      return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }