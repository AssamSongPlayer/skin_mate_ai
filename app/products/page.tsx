'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import ProductCard from '@/components/products/ProductCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Package, Search, Plus, Filter, Sparkles } from 'lucide-react';
import { ProductCategory } from '@/types';

export default function ProductsPage() {
  const router = useRouter();
  const { products, deleteProduct, upsertProduct, skinChats } = useAppContext();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.keyIngredients?.some((i) => i.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleToggleOwned = (productId: string) => {
    const p = products.find((prod) => prod.productId === productId);
    if (p) {
      upsertProduct({ ...p, isOwned: !p.isOwned });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteProductId) {
      await deleteProduct(deleteProductId);
      setDeleteProductId(null);
    }
  };

  return (
    <PageWrapper title="My Products">
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, brand, or ingredient..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181822] border border-[#2D2D3D] text-[#F5F3FF] text-sm placeholder-[#A1A1AA] focus:border-[#A78BFA] outline-none"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize flex-shrink-0 transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-[#A78BFA] text-white shadow-sm'
                    : 'bg-[#181822] border border-[#2D2D3D] text-[#A1A1AA]'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize flex-shrink-0 transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#A78BFA] text-white shadow-sm'
                      : 'bg-[#181822] border border-[#2D2D3D] text-[#A1A1AA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-12 text-center flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-[#A78BFA] opacity-50 mb-3" />
            <h3 className="text-base font-bold text-[#F5F3FF]">No products in your library</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-4">
              Products will automatically appear here once selected during your AI skin consultations.
            </p>
            <button
              onClick={() => router.push('/assistant')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI for Recommendations</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onRemove={(id) => setDeleteProductId(id)}
                onToggleOwned={handleToggleOwned}
                onViewChat={(chatId) => router.push(`/assistant?chatId=${chatId}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteProductId)}
        title="Remove Product"
        description="Are you sure you want to remove this product? Removing it will recalculate dependent timetable activities."
        confirmLabel="Remove Product"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProductId(null)}
      />
    </PageWrapper>
  );
}
