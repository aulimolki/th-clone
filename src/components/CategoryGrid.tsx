import { useEffect, useState } from 'react';
import { supabase, type Category } from '../supabase';
import CategoryCard from './CategoryCard';

type Props = { onNavigate: (path: string) => void };

export default function CategoryGrid({ onNavigate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(8);
      if (data) setCategories(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
