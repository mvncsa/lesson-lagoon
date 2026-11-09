import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product } from '@/lib/types';

// Map database Product to client Product interface
function mapPrismaProductToClient(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    short: p.shortDesc || p.title,
    long: p.longDesc || undefined,
    cat: p.categoryId,
    grade: p.grade,
    type: p.type as any,
    pages: p.pages,
    price: Number(p.price),
    min: Number(p.minPrice),
    featured: Boolean(p.featured),
    rating: p.ratingAvg,
    rc: p.ratingCount,
    sales: p.salesCount,
    curr: p.curriculum,
    color: p.color,
    ic: p.icon,
    status: p.status as any,
    ver: p.version,
    pv: p.previewPagesCount,
    created: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : undefined,
    printOptions: p.printOptions
      ? {
          enabled: p.printOptions.enabled,
          pricingMode: p.printOptions.pricingMode as any,
          fixedPrice: p.printOptions.fixedPrice ? Number(p.printOptions.fixedPrice) : undefined,
          allowColour: p.printOptions.allowColour,
          allowBw: p.printOptions.allowBw,
          bindings: (() => {
            try {
              return JSON.parse(p.printOptions.bindings);
            } catch {
              return ['stapled'];
            }
          })(),
          papers: (() => {
            try {
              return JSON.parse(p.printOptions.papers);
            } catch {
              return ['standard'];
            }
          })(),
          maxQty: p.printOptions.maxQty,
          productionDays: p.printOptions.productionDays,
        }
      : undefined,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const grade = searchParams.get('grade');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'Published';

    const where: any = {};
    if (status !== 'all') where.status = status;
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId;
    if (grade && grade !== 'all') where.grade = grade;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDesc: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        printOptions: true,
      },
      orderBy: { salesCount: 'desc' },
    });

    const serialized = products.map(mapPrismaProductToClient);
    return NextResponse.json({ success: true, products: serialized });
  } catch (error: any) {
    console.error('Error fetching products from SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: Partial<Product>[] = Array.isArray(body) ? body : [body];

    const results = [];

    for (const item of items) {
      if (!item.title) continue;

      const slug =
        item.slug ||
        item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) ||
        'resource-' + Math.random().toString(36).slice(2, 7);

      const categoryId = (item.cat || 'maths').toLowerCase();

      // Ensure category exists so foreign key doesn't fail
      await prisma.category.upsert({
        where: { id: categoryId },
        update: {},
        create: {
          id: categoryId,
          name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
          icon: '📚',
        },
      });

      const upserted = await prisma.product.upsert({
        where: { slug },
        update: {
          title: item.title,
          shortDesc: item.short || item.title,
          longDesc: item.long || item.short || item.title,
          categoryId,
          grade: item.grade || 'Grade 1',
          type: item.type || 'PDF',
          pages: item.pages || 1,
          price: BigInt(item.price ?? 0),
          minPrice: BigInt(item.min ?? 0),
          featured: Boolean(item.featured),
          status: item.status || 'Published',
          curriculum: item.curr || 'National Curriculum',
          color: item.color || '#0E8C7F',
          icon: item.ic || '📄',
        },
        create: {
          id: item.id || 'p_' + Math.random().toString(36).slice(2, 8),
          slug,
          title: item.title,
          shortDesc: item.short || item.title,
          longDesc: item.long || item.short || item.title,
          categoryId,
          grade: item.grade || 'Grade 1',
          type: item.type || 'PDF',
          pages: item.pages || 1,
          price: BigInt(item.price ?? 0),
          minPrice: BigInt(item.min ?? 0),
          featured: Boolean(item.featured),
          status: item.status || 'Published',
          curriculum: item.curr || 'National Curriculum',
          color: item.color || '#0E8C7F',
          icon: item.ic || '📄',
        },
        include: {
          printOptions: true,
        },
      });

      results.push(mapPrismaProductToClient(upserted));
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      products: results,
      product: results[0] || null,
    });
  } catch (error: any) {
    console.error('Error saving product to SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, slug, ...updates } = body;

    const where = id ? { id } : slug ? { slug } : null;
    if (!where) {
      return NextResponse.json({ error: 'Product ID or slug is required for updates' }, { status: 400 });
    }

    const data: any = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.short !== undefined) data.shortDesc = updates.short;
    if (updates.long !== undefined) data.longDesc = updates.long;
    if (updates.cat !== undefined) {
      data.categoryId = updates.cat.toLowerCase();
      // Ensure category exists
      await prisma.category.upsert({
        where: { id: data.categoryId },
        update: {},
        create: {
          id: data.categoryId,
          name: data.categoryId.charAt(0).toUpperCase() + data.categoryId.slice(1),
          icon: '📚',
        },
      });
    }
    if (updates.grade !== undefined) data.grade = updates.grade;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.pages !== undefined) data.pages = updates.pages;
    if (updates.price !== undefined) data.price = BigInt(updates.price);
    if (updates.min !== undefined) data.minPrice = BigInt(updates.min);
    if (updates.featured !== undefined) data.featured = Boolean(updates.featured);
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.curr !== undefined) data.curriculum = updates.curr;
    if (updates.color !== undefined) data.color = updates.color;
    if (updates.ic !== undefined) data.icon = updates.ic;

    const updated = await prisma.product.update({
      where,
      data,
      include: {
        printOptions: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: mapPrismaProductToClient(updated),
    });
  } catch (error: any) {
    console.error('Error updating product in SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action') || 'archive'; // 'archive' or 'permanent'

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (action === 'permanent') {
      await prisma.product.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Product permanently deleted' });
    } else {
      const archived = await prisma.product.update({
        where: { id },
        data: { status: 'Archived' },
      });
      return NextResponse.json({ success: true, product: mapPrismaProductToClient(archived) });
    }
  } catch (error: any) {
    console.error('Error deleting/archiving product in SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
