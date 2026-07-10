import { ArrowRight } from 'lucide-react';
import { type Category } from '../supabase';

type Props = {
  category: Category;
  onNavigate: (path: string) => void;
};

export default function CategoryCard({ category, onNavigate }: Props) {
  return (
    <button
      onClick={() => onNavigate(`#/collections/${category.slug}`)}
      className="group relative aspect-[4/5] overflow-hidden bg-gray-100 block w-full"
    >
      <img
        src={category.image_url ?? ''}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
        <h3 className="text-white text-xl lg:text-2xl font-bold uppercase tracking-tight mb-1">
          {category.name}
        </h3>
        <div className="flex items-center gap-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Shop Now <ArrowRight size={16} />
        </div>
      </div>
    </button>
  );
}
