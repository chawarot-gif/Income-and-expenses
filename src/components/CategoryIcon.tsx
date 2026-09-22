import React from 'react';
import {
  Briefcase,
  Store,
  Award,
  TrendingUp,
  Zap,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Film,
  Users,
  CreditCard,
  MoreHorizontal,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Store,
  Award,
  TrendingUp,
  Zap,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Film,
  Users,
  CreditCard,
  MoreHorizontal,
  CircleDollarSign,
};

interface CategoryIconProps {
  iconName?: string;
  color?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName = 'CircleDollarSign',
  color = '#64748b',
  className = 'w-5 h-5',
}) => {
  const IconComponent = iconMap[iconName] || CircleDollarSign;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl p-2.5 transition-colors ${className}`}
      style={{ backgroundColor: `${color}18`, color: color }}
    >
      <IconComponent className="w-5 h-5" />
    </div>
  );
};
