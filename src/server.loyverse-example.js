// ຕົວຢ່າງ route ສຳລັບ proxy Loyverse API — ເອົາ route ນີ້ໄປລວມເຂົ້າກັບ server.js
// ທີ່ມີຢູ່ແລ້ວໃນໂປຣເຈັກ (ຢ່າສ້າງ Express app ຊ້ຳຊ້ອນຖ້າມີແລ້ວ)
//
// ເປົ້າໝາຍ: LOYVERSE_ACCESS_TOKEN ຕ້ອງຢູ່ໃນ .env ຝັ່ງ server ເທົ່ານັ້ນ (ບໍ່ມີ VITE_ ນຳໜ້າ)
// ດັ່ງນັ້ນ browser ຈະບໍ່ເຫັນ token ນີ້ຈັກເທື່ອ — client ຈະເອີ້ນ /api/loyverse/inventory
// ຜ່ານ server ຂອງເຮົາເອງ, ແລ້ວ server ຈຶ່ງເອີ້ນ Loyverse ຕໍ່ດ້ວຍ token ທີ່ເກັບໄວ້ຢູ່ນີ້.

import express from 'express';

const LOYVERSE_TOKEN = process.env.LOYVERSE_ACCESS_TOKEN;
const LOYVERSE_BASE = 'https://api.loyverse.com/v1.0';

export function registerLoyverseRoutes(app /*: express.Express */) {
  app.get('/api/loyverse/inventory', async (req, res) => {
    if (!LOYVERSE_TOKEN) {
      return res.status(500).json({ error: 'LOYVERSE_ACCESS_TOKEN ຍັງບໍ່ໄດ້ຕັ້ງຄ່າໃນ server .env' });
    }
    try {
      const response = await fetch(`${LOYVERSE_BASE}/inventory`, {
        headers: {
          Authorization: `Bearer ${LOYVERSE_TOKEN}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: `Loyverse API error: ${response.status}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error('Loyverse proxy error:', err);
      res.status(500).json({ error: 'Internal proxy error' });
    }
  });
}

// ຖ້າຍັງບໍ່ມີ server.js ຢູ່ໃນໂປຣເຈັກເທື່ອ, ນີ້ຄືຕົວຢ່າງນຳໃຊ້ແບບເຕັມ:
//
// import express from 'express';
// import { registerLoyverseRoutes } from './server.loyverse-example.js';
//
// const app = express();
// registerLoyverseRoutes(app);
// app.listen(process.env.PORT || 8080);
