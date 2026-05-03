export const QUERY_KEYS = {
  // Auth
  ME: ["me"],

  // Products
  PRODUCTS: ["products"],
  PRODUCT: (slug: string) => ["product", slug],
  FEATURED_PRODUCTS: ["products", "featured"],
  NEW_ARRIVALS: ["products", "new-arrivals"],
  BEST_SELLERS: ["products", "best-sellers"],

  // Categories
  CATEGORIES: ["categories"],
  CATEGORY: (slug: string) => ["category", slug],

  // Brands
  BRANDS: ["brands"],
  BRAND: (slug: string) => ["brand", slug],

  // Tags
  TAGS: ["tags"],

  // Cart
  CART: ["cart"],

  // Wishlist
  WISHLIST: ["wishlist"],

  // Orders
  ORDERS: ["orders"],
  ORDER: (id: string) => ["order", id],

  // Reviews
  REVIEWS: (productId: string) => ["reviews", productId],

  // Blogs
  BLOGS: ["blogs"],
  BLOG: (slug: string) => ["blog", slug],
  BLOG_CATEGORIES: ["blog-categories"],

  // Banners
  BANNERS: ["banners"],

  // Flash Sale
  FLASH_SALE: ["flash-sale"],

  // Notifications
  NOTIFICATIONS: ["notifications"],

  // Dashboard
  DASHBOARD_STATS: ["dashboard", "stats"],
  SALES_CHART: ["dashboard", "sales-chart"],
  TOP_PRODUCTS: ["dashboard", "top-products"],
  RECENT_ORDERS: ["dashboard", "recent-orders"],
  LOW_STOCK: ["dashboard", "low-stock"],

  // Reports
  SALES_REPORT: ["reports", "sales"],
  ORDER_REPORT: ["reports", "orders"],

  // AI
  AI_RECOMMENDATIONS: (userId: string) => ["ai", "recommendations", userId],
  AI_SIMILAR: (productId: string) => ["ai", "similar", productId],
  AI_SUGGESTIONS: (query: string) => ["ai", "suggestions", query],
  AI_TRENDING: ["ai", "trending"],
};