export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_guide',

  guestJwtSecret: process.env.GUEST_JWT_SECRET || 'dev_guest_secret',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'dev_admin_secret',
  guestJwtExpiresIn: process.env.GUEST_JWT_EXPIRES_IN || '365d',
  adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',

  seedSuperAdmin: {
    login: process.env.SEED_SUPERADMIN_LOGIN || 'admin',
    password: process.env.SEED_SUPERADMIN_PASSWORD || 'admin123',
    name: process.env.SEED_SUPERADMIN_NAME || 'Super Admin',
  },

  // Free OSM-based mapping stack (see PLAN.md "Картографический стек — подробнее").
  // Public demo servers are dev/test only — point these at a self-hosted instance for production.
  osrm: {
    baseUrl: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
    profileWalking: process.env.OSRM_PROFILE_WALKING || 'foot',
    profileDriving: process.env.OSRM_PROFILE_DRIVING || 'driving',
  },
  nominatim: {
    baseUrl: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
    // Nominatim's usage policy requires identifying the application — set a real contact.
    userAgent: process.env.NOMINATIM_USER_AGENT || 'samarkand-hotel-guide/1.0 (set NOMINATIM_USER_AGENT)',
  },

  reviewLinks: {
    google: process.env.REVIEW_LINK_GOOGLE || '',
    yandex: process.env.REVIEW_LINK_YANDEX || '',
    twoGis: process.env.REVIEW_LINK_2GIS || '',
  },

  storageDriver: process.env.STORAGE_DRIVER || 'local',
});
