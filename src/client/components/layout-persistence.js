export class LayoutStore {
  constructor(key = 'dashboardLayout', maxAge = 30 * 24 * 60 * 60 * 1000) {
    this.key = key;
    this.maxAge = maxAge;
  }

  save(data) {
    try {
      const payload = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.key, JSON.stringify(payload));
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded');
        this.clearOldData();
      } else if (err.name === 'SecurityError') {
        console.warn('localStorage access denied (private browsing?)');
      }
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;

      const { data, timestamp } = JSON.parse(raw);

      if (Date.now() - timestamp > this.maxAge) {
        this.clear();
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to parse localStorage data:', err);
      this.clear();
      return null;
    }
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  clearOldData() {
    Object.keys(localStorage).forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.timestamp && Date.now() - data.timestamp > this.maxAge) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Ignore malformed entries
      }
    });
  }
}
