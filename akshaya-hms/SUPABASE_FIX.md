# ⚠️ Supabase Ban in India: The Fix

As of February 24, 2026, the Indian government (MeitY) has blocked the `supabase.co` domain across major ISPs (Jio, Airtel, etc.). This is why your app works on some networks (laptops with different DNS) but shows a **white screen on mobile**.

---

### 1. Immediate Workaround (For Testing)
On your mobile device, please download **1.1.1.1 (Cloudflare WARP)** from the Play Store or App Store.
*   Once enabled, all Supabase calls will work instantly across all apps.
*   Alternatively, changing your phone's Private DNS to `dns.google` or `1dot1dot1dot1.cloudflare-dns.com` will also work.

---

### 2. The Production Solution (Proxy)
To make the app work for **all your users** without them needing a VPN, you can "Proxy" the connection through a Cloudflare Worker.

#### Step 1: Create a Cloudflare Worker
1.  Go to [cloudflare.com](https://dash.cloudflare.com/) and login.
2.  Navigate to **Workers & Pages** -> **Create Worker**.
3.  Name it anything (e.g., `akshaya-proxy`).
4.  **Copy and Paste** the following script:

```javascript
/**
 * Akshaya HMS — Supabase Proxy for India
 * This script bypasses the DNS block by routing traffic through Cloudflare.
 */
export default {
    async fetch(request, env) {
        // REPLACE THIS with your actual Supabase URL (e.g., https://yourproject.supabase.co)
        const SUPABASE_URL = "https://YOUR_ACTUAL_URL_HERE.supabase.co";

        const url = new URL(request.url);
        url.hostname = new URL(SUPABASE_URL).hostname;

        const newRequest = new Request(url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: 'manual'
        });

        const response = await fetch(newRequest);
        const newResponse = new Response(response.body, response);
        
        // Add CORS headers so your frontend can call it 
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', '*');

        return newResponse;
    }
}
```

#### Step 2: Deploy & Update App
1.  Deploy the worker. It will give you a URL like `https://akshaya-proxy.yourname.workers.dev`.
2.  Update your environment variable:
    *   Add `VITE_SUPABASE_PROXY` = `https://akshaya-proxy.yourname.workers.dev`
3.  Your app will now call this Worker instead of the blocked `supabase.co` domain, and it will work perfectly in India!

---

### 3. Alternative: Custom Domain
If you have a **paid Supabase plan**, you can set up a custom domain (like `api.akshayahms.com`). Since this isn't a `.supabase.co` domain, it will not be blocked by Indian ISPs.
