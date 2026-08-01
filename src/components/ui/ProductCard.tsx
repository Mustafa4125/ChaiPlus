import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
  compact?: boolean;
}

export function ProductCard({ product, index = 0, compact }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover onClick={() => navigate(`/products/${product.id}`)} className={compact ? 'p-3' : ''}>
        <div className="relative mb-3 overflow-hidden rounded-2xl">
          <img src={product.image} alt={product.name} className={cn('w-full object-cover', compact ? 'h-28' : 'h-36')} />
          {product.isPopular && (
            <Badge variant="gold" className="absolute top-2 left-2">
              Popüler
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{product.rating}</span>
            </div>
          </div>
          {!compact && <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>}
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            <span className="text-xs text-gray-400">{product.prepTime}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}