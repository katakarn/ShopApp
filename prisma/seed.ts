import { hash } from "bcryptjs";
import { type OrderStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CategorySeed = {
  slug: string;
  name: string;
};

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  categorySlug: string;
  isActive?: boolean;
};

type SeedUser = {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  password: string;
};

type OrderPlan = {
  email: string;
  status: OrderStatus;
  daysAgo: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: Array<{ slug: string; quantity: number }>;
};

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

const categories: CategorySeed[] = [
  { slug: "electronics", name: "Electronics" },
  { slug: "home-office", name: "Home Office" },
  { slug: "kitchen", name: "Kitchen" },
  { slug: "outdoor", name: "Outdoor" },
  { slug: "wellness", name: "Wellness" }
];

const products: ProductSeed[] = [
  {
    slug: "wireless-mechanical-keyboard",
    name: "Wireless Mechanical Keyboard",
    description: "Low-profile mechanical keyboard with hot-swappable switches, tri-mode connectivity, and 75% layout.",
    price: 139,
    inventory: 24,
    imageUrl: "https://picsum.photos/seed/wireless-keyboard/1400/1000",
    categorySlug: "electronics"
  },
  {
    slug: "noise-cancelling-headphones-pro",
    name: "Noise Cancelling Headphones Pro",
    description: "Premium over-ear headphones with adaptive ANC, 35-hour battery, and clear voice pickup.",
    price: 229,
    inventory: 18,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "electronics"
  },
  {
    slug: "ultra-wide-4k-monitor",
    name: "Ultra-Wide 4K Monitor 34\"",
    description: "Curved 34-inch display with USB-C charging, 99% sRGB, and smooth 100Hz refresh rate.",
    price: 649,
    inventory: 9,
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "electronics"
  },
  {
    slug: "ergonomic-wireless-mouse",
    name: "Ergonomic Wireless Mouse",
    description: "Comfort-first wireless mouse with silent clicks, precision tracking, and multi-device pairing.",
    price: 59,
    inventory: 42,
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "electronics"
  },
  {
    slug: "smart-fitness-watch",
    name: "Smart Fitness Watch",
    description: "All-day activity and sleep tracking with heart-rate monitoring and waterproof design.",
    price: 189,
    inventory: 26,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "electronics"
  },
  {
    slug: "minimal-desk-lamp",
    name: "Minimal Desk Lamp",
    description: "Aluminum desk lamp with adjustable arm, warm-to-cool temperature control, and touch dimming.",
    price: 84,
    inventory: 33,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "home-office"
  },
  {
    slug: "daily-commuter-backpack",
    name: "Daily Commuter Backpack",
    description: "Water-resistant 22L backpack with laptop sleeve, hidden pocket, and breathable back panel.",
    price: 99,
    inventory: 21,
    imageUrl: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "home-office"
  },
  {
    slug: "anti-fatigue-standing-mat",
    name: "Anti-Fatigue Standing Mat",
    description: "Dense foam standing mat for desk setups, designed to reduce pressure during long work sessions.",
    price: 49,
    inventory: 38,
    imageUrl: "https://picsum.photos/seed/standing-desk-setup/1400/1000",
    categorySlug: "home-office"
  },
  {
    slug: "precision-coffee-grinder",
    name: "Precision Coffee Grinder",
    description: "Burr grinder with 40 grind settings for espresso to cold brew and low static retention.",
    price: 159,
    inventory: 14,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "kitchen"
  },
  {
    slug: "smart-electric-kettle",
    name: "Smart Electric Kettle",
    description: "Gooseneck kettle with exact temperature presets and hold mode for pour-over brewing.",
    price: 119,
    inventory: 17,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "kitchen"
  },
  {
    slug: "chef-cast-iron-skillet",
    name: "Chef Cast Iron Skillet",
    description: "Pre-seasoned 12-inch skillet for high-heat searing, oven roasting, and everyday meals.",
    price: 69,
    inventory: 11,
    imageUrl: "https://picsum.photos/seed/cast-iron-kitchen/1400/1000",
    categorySlug: "kitchen"
  },
  {
    slug: "vacuum-insulated-bottle",
    name: "Vacuum Insulated Bottle",
    description: "Durable stainless bottle that keeps drinks cold for 24h and hot for 12h.",
    price: 39,
    inventory: 57,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "outdoor"
  },
  {
    slug: "trail-running-shoes",
    name: "Trail Running Shoes",
    description: "Lightweight trail runners with aggressive grip, responsive cushioning, and reinforced toe guard.",
    price: 149,
    inventory: 16,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "outdoor"
  },
  {
    slug: "compact-camping-chair",
    name: "Compact Camping Chair",
    description: "Foldable aluminum camping chair with breathable mesh fabric and quick setup design.",
    price: 79,
    inventory: 7,
    imageUrl: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "outdoor"
  },
  {
    slug: "premium-yoga-mat",
    name: "Premium Yoga Mat",
    description: "Non-slip 6mm yoga mat with alignment guides and high-density cushioning.",
    price: 64,
    inventory: 31,
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "wellness"
  },
  {
    slug: "massage-gun-mini",
    name: "Massage Gun Mini",
    description: "Portable percussion massage gun with 4 intensity levels and quiet brushless motor.",
    price: 129,
    inventory: 0,
    imageUrl: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "wellness"
  },
  {
    slug: "adjustable-dumbbell-set",
    name: "Adjustable Dumbbell Set",
    description: "Space-saving dumbbells with quick dial adjustment from 5 to 50 lbs.",
    price: 299,
    inventory: 5,
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "wellness"
  },
  {
    slug: "smart-jump-rope",
    name: "Smart Jump Rope",
    description: "Weighted handle jump rope with Bluetooth rep tracking and interval timer support.",
    price: 45,
    inventory: 27,
    imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1400&q=80",
    categorySlug: "wellness",
    isActive: false
  }
];

const users: SeedUser[] = [
  { name: "Admin", email: "admin@example.com", role: "ADMIN", password: "admin1234" },
  { name: "Sophia Miller", email: "sophia.miller@example.com", role: "USER", password: "shop1234" },
  { name: "Daniel Lee", email: "daniel.lee@example.com", role: "USER", password: "shop1234" },
  { name: "Maya Patel", email: "maya.patel@example.com", role: "USER", password: "shop1234" }
];

const orderPlans: OrderPlan[] = [
  {
    email: "sophia.miller@example.com",
    status: "SHIPPED",
    daysAgo: 17,
    shippingName: "Sophia Miller",
    shippingAddress: "1420 Market St, Apt 6B",
    shippingCity: "San Francisco",
    shippingPostalCode: "94103",
    shippingCountry: "United States",
    items: [
      { slug: "wireless-mechanical-keyboard", quantity: 1 },
      { slug: "ergonomic-wireless-mouse", quantity: 1 },
      { slug: "anti-fatigue-standing-mat", quantity: 1 }
    ]
  },
  {
    email: "sophia.miller@example.com",
    status: "PAID",
    daysAgo: 4,
    shippingName: "Sophia Miller",
    shippingAddress: "1420 Market St, Apt 6B",
    shippingCity: "San Francisco",
    shippingPostalCode: "94103",
    shippingCountry: "United States",
    items: [
      { slug: "smart-electric-kettle", quantity: 1 },
      { slug: "precision-coffee-grinder", quantity: 1 }
    ]
  },
  {
    email: "daniel.lee@example.com",
    status: "PENDING",
    daysAgo: 2,
    shippingName: "Daniel Lee",
    shippingAddress: "88 Wacker Dr, Suite 1400",
    shippingCity: "Chicago",
    shippingPostalCode: "60601",
    shippingCountry: "United States",
    items: [
      { slug: "trail-running-shoes", quantity: 1 },
      { slug: "vacuum-insulated-bottle", quantity: 2 }
    ]
  },
  {
    email: "daniel.lee@example.com",
    status: "CANCELLED",
    daysAgo: 29,
    shippingName: "Daniel Lee",
    shippingAddress: "88 Wacker Dr, Suite 1400",
    shippingCity: "Chicago",
    shippingPostalCode: "60601",
    shippingCountry: "United States",
    items: [{ slug: "compact-camping-chair", quantity: 2 }]
  },
  {
    email: "maya.patel@example.com",
    status: "PAID",
    daysAgo: 8,
    shippingName: "Maya Patel",
    shippingAddress: "2340 5th Ave, Unit 18",
    shippingCity: "Seattle",
    shippingPostalCode: "98121",
    shippingCountry: "United States",
    items: [
      { slug: "premium-yoga-mat", quantity: 1 },
      { slug: "massage-gun-mini", quantity: 1 }
    ]
  }
];

async function main() {
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category
    });
    categoryMap.set(category.slug, saved.id);
  }

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        imageUrl: product.imageUrl,
        categoryId,
        isActive: product.isActive ?? true
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        imageUrl: product.imageUrl,
        categoryId,
        isActive: product.isActive ?? true
      }
    });
  }

  // Keep old records for history, but hide legacy products from storefront.
  await prisma.product.updateMany({
    where: {
      slug: { notIn: products.map((product) => product.slug) }
    },
    data: { isActive: false }
  });

  const userMap = new Map<string, { id: string; name: string }>();
  for (const user of users) {
    const passwordHash = await hash(user.password, 10);
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash
      }
    });
    userMap.set(user.email, { id: saved.id, name: saved.name ?? user.name });
  }

  const productMap = new Map(
    (
      await prisma.product.findMany({
        select: { id: true, slug: true, name: true, price: true }
      })
    ).map((product) => [product.slug, product])
  );

  for (const email of ["sophia.miller@example.com", "daniel.lee@example.com", "maya.patel@example.com"]) {
    const user = userMap.get(email);
    if (!user) {
      continue;
    }

    const existingOrderCount = await prisma.order.count({ where: { userId: user.id } });
    if (existingOrderCount > 0) {
      continue;
    }

    const plans = orderPlans.filter((plan) => plan.email === email);
    for (const plan of plans) {
      const items = plan.items.map((item) => {
        const product = productMap.get(item.slug);
        if (!product) {
          throw new Error(`Missing product for order seed: ${item.slug}`);
        }

        return {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity
        };
      });

      const total = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
      const createdAt = daysAgo(plan.daysAgo);

      await prisma.order.create({
        data: {
          userId: user.id,
          status: plan.status,
          total,
          email: plan.email,
          shippingName: plan.shippingName,
          shippingAddress: plan.shippingAddress,
          shippingCity: plan.shippingCity,
          shippingPostalCode: plan.shippingPostalCode,
          shippingCountry: plan.shippingCountry,
          createdAt,
          updatedAt: createdAt,
          items: {
            create: items
          }
        }
      });
    }
  }

  const maya = userMap.get("maya.patel@example.com");
  if (maya) {
    const mayaCart = await prisma.cart.upsert({
      where: { userId: maya.id },
      update: {},
      create: {
        userId: maya.id
      }
    });

    await prisma.cartItem.deleteMany({ where: { cartId: mayaCart.id } });

    const cartSeedItems = [
      { slug: "ultra-wide-4k-monitor", quantity: 1 },
      { slug: "daily-commuter-backpack", quantity: 1 },
      { slug: "vacuum-insulated-bottle", quantity: 2 }
    ];

    for (const item of cartSeedItems) {
      const product = productMap.get(item.slug);
      if (!product) {
        continue;
      }

      await prisma.cartItem.create({
        data: {
          cartId: mayaCart.id,
          productId: product.id,
          quantity: item.quantity
        }
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin user: admin@example.com / admin1234");
  console.log("Sample users: sophia.miller@example.com, daniel.lee@example.com, maya.patel@example.com / shop1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
