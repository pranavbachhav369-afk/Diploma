import React from 'react';
import {
  FileText,
  Star,
  Download,
  Eye,
  ShoppingCart,
  Zap,
  CheckCircle,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { MaterialItem } from '../types';
import { useCart } from '../context/CartContext';

interface MaterialCardProps {
  material: MaterialItem;
  onViewDetails: (material: MaterialItem) => void;
  onPreviewSample: (materialId: string) => void;
  onDirectBuy: (material: MaterialItem) => void;
  onOpenSecureReader: (materialId: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onViewDetails,
  onPreviewSample,
  onDirectBuy,
  onOpenSecureReader
}) => {
  const { addToCart, items } = useCart();
  const isInCart = items.some(it => it.material_id === material.id);
  const isPurchased = material.is_purchased;

  const originalPrice = material.price;
  const currentPrice = material.discount_price !== undefined ? material.discount_price : material.price;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const isBundle = material.category_id === 'cat_bundle' || material.bundle_materials !== undefined;

  return (
    <div
      className={`group relative bg-slate-900 border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        isBundle
          ? 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-indigo-500/5'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="relative p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
              {material.subject_code}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Sem {material.semester}
            </span>
            {isBundle && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 uppercase tracking-wide flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Value Bundle
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{(material.rating ?? 5.0).toFixed(1)}</span>
            <span className="text-slate-500 font-normal text-[11px]">({material.reviews_count ?? 0})</span>
          </div>
        </div>

        {/* Title */}
        <h4
          onClick={() => onViewDetails(material)}
          className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {material.title}
        </h4>

        {/* Subject subtitle */}
        <p className="text-xs text-slate-400 mt-1 truncate">
          {material.subject_name} • {material.year}
        </p>

        {/* Description snippet */}
        <p className="text-xs text-slate-400/90 mt-2 line-clamp-2 leading-relaxed">
          {material.description}
        </p>

        {/* Specs Pill List */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {material.total_pages} Pages
          </span>
          <span>•</span>
          <span>{material.file_size}</span>
          <span>•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Download className="w-3 h-3" />
            {material.download_count}+ readers
          </span>
        </div>
      </div>

      {/* Card Footer: Pricing & Action Buttons */}
      <div className="mt-auto p-4 sm:p-5 pt-3 bg-slate-950/60 border-t border-slate-800/80 space-y-3">
        {/* Pricing */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">₹{currentPrice}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-500 line-through">₹{originalPrice}</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => onPreviewSample(material.id)}
            className="text-[11px] font-semibold text-slate-300 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Sample
          </button>
        </div>

        {/* Action Buttons */}
        {isPurchased ? (
          <button
            onClick={() => onOpenSecureReader(material.id)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Read Unlocked PDF Now</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(material)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isInCart
                  ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isInCart ? 'In Cart' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={() => onDirectBuy(material)}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/15 flex items-center justify-center gap-1 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Buy Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
