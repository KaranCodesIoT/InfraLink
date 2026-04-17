import React from 'react';
import { ShoppingBag, Star, Truck, ArrowRight, Package } from 'lucide-react';

export default function MarketplaceGrid({ professionals, isLoading }) {
  // Aggregate all products from all suppliers in the current list
  const allProducts = professionals
    .filter(p => p.role === 'supplier' && p.supplierProfile?.products)
    .flatMap(p => p.supplierProfile.products.map(prod => ({
      ...prod,
      supplierName: p.supplierProfile.businessName,
      supplierId: p._id,
      supplierRating: p.averageRating || 0
    })));

  if (isLoading) return null; // Parent handles loading spinner

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {allProducts.map((product, idx) => (
        <div key={`${product.supplierId}-${idx}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-100 transition-all group">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {product.productImages?.length > 0 ? (
              <img 
                src={product.productImages[0]} 
                alt={product.productName} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag className="w-12 h-12" />
              </div>
            )}
            <div className="absolute top-3 left-3">
               <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-gray-100">
                 {product.availableStock > 0 ? 'In Stock' : 'Out of Stock'}
               </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{product.productName}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{product.supplierName}</p>
              </div>
              <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-[10px] font-black">{product.supplierRating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-lg font-black text-orange-600">₹{product.price?.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">/ {product.unit || 'unit'}</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase gap-2">
                <Truck className="w-3 h-3 text-blue-500" />
                Develery in {product.deliveryTime || '2-3'} Days
              </div>
              <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase gap-2">
                <Package className="w-3 h-3 text-green-500" />
                Min Order: {product.minimumOrderQuantity} {product.unit}
              </div>
            </div>

            <button className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
              View Details
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
