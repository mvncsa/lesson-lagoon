import { PrismaClient } from '@prisma/client';
import {
  INITIAL_CATEGORIES,
  INITIAL_GRADES,
  INITIAL_CURRICULA,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_CAMPAIGNS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_RESOURCE_REQUESTS,
} from '../src/lib/data';
import { DEFAULT_DELIVERY_ZONES } from '../src/lib/pricing';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { id: cat.id, name: cat.name, icon: cat.ic },
    });
  }

  // 2. Grades
  for (let i = 0; i < INITIAL_GRADES.length; i++) {
    const g = INITIAL_GRADES[i];
    await prisma.grade.upsert({
      where: { id: g },
      update: {},
      create: { id: g, name: g, sort: i },
    });
  }

  // 3. Curricula
  for (const curr of INITIAL_CURRICULA) {
    await prisma.curriculum.upsert({
      where: { id: curr },
      update: {},
      create: { id: curr, name: curr },
    });
  }

  // 4. Delivery Zones
  for (let i = 0; i < DEFAULT_DELIVERY_ZONES.length; i++) {
    const zone = DEFAULT_DELIVERY_ZONES[i];
    await prisma.deliveryZone.upsert({
      where: { id: zone.id },
      update: {},
      create: {
        id: zone.id,
        name: zone.name,
        fee: BigInt(zone.fee),
        etaText: zone.eta,
        sort: i,
        active: true,
      },
    });
  }

  // 5. Users
  for (const u of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        points: u.points,
        pendingPoints: u.pending,
        heldPoints: u.held,
        referralCode: u.code,
        marketingConsent: u.consent,
        birthDay: u.birthDay,
        birthMonth: u.birthMonth,
      },
    });
  }

  // 6. Products
  for (const p of INITIAL_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        shortDesc: p.short,
        longDesc: p.long || p.short,
        categoryId: p.cat,
        grade: p.grade,
        type: p.type,
        pages: p.pages,
        price: BigInt(p.price),
        minPrice: BigInt(p.min),
        featured: p.featured,
        ratingAvg: p.rating,
        ratingCount: p.rc,
        salesCount: p.sales,
        curriculum: p.curr,
        color: p.color,
        icon: p.ic,
        status: p.status,
        version: p.ver,
        previewPagesCount: p.pv,
      },
    });

    if (p.printOptions?.enabled) {
      await prisma.productPrintOption.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          enabled: true,
          pricingMode: 'auto',
          allowColour: true,
          allowBw: true,
          bindings: JSON.stringify(['stapled']),
          papers: JSON.stringify(['standard']),
          maxQty: 30,
          productionDays: 2,
        },
      });
    }
  }

  // 7. Campaigns
  for (const c of INITIAL_CAMPAIGNS) {
    await prisma.campaign.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        type: c.type,
        discountPct: c.pct,
        scope: c.scope,
        pointsMultiplier: c.mult,
        active: c.active,
        startAt: new Date(c.start),
        endAt: new Date(c.end),
        accentColor: c.accent,
        bannerText: c.banner,
      },
    });
  }

  // 8. Coupons
  for (const cp of INITIAL_COUPONS) {
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: {},
      create: {
        code: cp.code,
        discountPct: cp.pct,
        usageLimit: cp.limit,
        usageCount: cp.used,
        expiresAt: new Date(cp.expires),
        active: cp.active,
      },
    });
  }

  // 9. Reviews
  for (const rev of INITIAL_REVIEWS) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {},
      create: {
        id: rev.id,
        productId: rev.pid,
        name: rev.name,
        rating: rev.rating,
        title: rev.title,
        text: rev.text,
        status: rev.status,
        home: rev.home,
        verifiedType: rev.verifiedType || 'paid',
        helpfulCount: rev.helpfulCount || 0,
        ownerReply: rev.ownerReply,
      },
    });
  }

  // 10. Resource Requests
  for (const req of INITIAL_RESOURCE_REQUESTS) {
    await prisma.resourceRequest.upsert({
      where: { id: req.id },
      update: {},
      create: {
        id: req.id,
        email: req.email,
        text: req.text,
        subjectId: req.subjectId,
        grade: req.grade,
        type: req.type,
        notify: req.notify,
        marketingConsent: req.marketingConsent,
        status: req.status,
        count: req.count,
        createdAt: new Date(req.createdAt),
      },
    });
  }

  console.log('✅ Database successfully seeded with all initial teaching data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

