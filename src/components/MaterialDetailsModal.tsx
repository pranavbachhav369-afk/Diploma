import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  FileText,
  Download,
  Eye,
  ShoppingCart,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  Lock
} from 'lucide-react';
import { MaterialItem, ReviewItem } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface MaterialDetailsModalProps {
  materialId: string;
  onClose: () => void;
  onPreviewSample: (materialId: string) => void;
  onDirectBuy: (material: MaterialItem) => void;
  onOpenSecureReader: (materialId: string) => void;
  onSelectRelated: (materialId: string) => void;
}

export const MaterialDetailsModal: React.FC<MaterialDetailsModalProps> = ({
  materialId,
  onClose,
  onPreviewSample,
  onDirectBuy,
  onOpenSecureReader,
  onSelectRelated
}) => {
  const { addToCart, items } = useCart();
  const { student } = useAuth();

  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getMaterialById(materialId),
      api.getReviews(materialId)
    ])
      .then(([matData, revData]) => {
        if (isMounted) {
          setMaterial(matData);
          setReviews(revData || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load material:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [materialId]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !student) return;

    setIsSubmittingReview(true);
    try {
      const added = await api.addReview({ course_id: materialId, rating: newRating, comment: newComment.trim() });
      setReviews(prev => [added, ...prev]);
      setNewComment('');
    } catch (err: any) {
      alert(err?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading || !material) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-300">Loading MSBTE study material details...</p>
        </div>
      </div>
    );
  }

  const isInCart = items.some(it => it.material_id === material.id);
  const isPurchased = material.is_purchased;
  const currentPrice = material.discount_price !== undefined ? material.discount_price : material.price;
  const originalPrice = material.price;
  const hasDiscount = originalPrice > currentPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
              {material.subject_code}
            </span>
            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              Sem {material.semester} • {material.year}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Title & Stats */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
              {material.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="text-white font-medium">{material.subject_name}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{material.rating.toFixed(1)} / 5</span>
                <span className="text-slate-500 font-normal">({reviews.length} reviews)</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {material.total_pages} Pages
              </span>
              <span>•</span>
              <span>{material.file_size}</span>
            </div>
          </div>

          {/* Pricing & Key CTA Box */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">₹{currentPrice}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-slate-500 line-through">₹{originalPrice}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Save ₹{originalPrice - currentPrice}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Instant PDF access with verified student watermark
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isPurchased ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSecureReader(material.id);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open &amp; Read Unlocked PDF</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onPreviewSample(material.id)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Sample Preview</span>
                  </button>
                  <button
                    onClick={() => addToCart(material)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isInCart ? 'In Cart' : 'Add to Cart'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onDirectBuy(material);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Buy Now</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About This Study Material</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              {material.description}
            </p>
          </div>

          {/* Sample Preview Pages Carousel */}
          {material.pages && material.pages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preview Pages ({material.pages.filter((p: any) => p.is_preview).length} Sample Pages Available)</span>
                </h4>
                <button
                  onClick={() => onPreviewSample(material.id)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Open in Full Reader →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {material.pages.filter((p: any) => p.is_preview).slice(0, 2).map((page: any) => (
                  <div
                    key={page.page_number}
                    onClick={() => onPreviewSample(material.id)}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-white group-hover:text-amber-300">Page {page.page_number}</span>
                      <span className="bg-amber-400/10 text-amber-300 px-1.5 py-0.2 rounded text-[10px]">Sample</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 truncate">{page.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {page.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Ratings */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Student Reviews ({reviews.length})</span>
              </h4>
            </div>

            {/* Add Review Form */}
            {student && (
              <form onSubmit={handleAddReview} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Leave your rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setNewRating(st)}
                        className={`p-0.5 ${newRating >= st ? 'text-amber-400' : 'text-slate-600'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Share how these notes helped your MSBTE exam prep..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {reviews.map(rev => (
                <div key={rev.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{rev.user_name}</span>
                      <span className="text-[10px] text-slate-500">({rev.user_branch})</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
