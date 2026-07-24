import { Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { ArrowRight } from 'lucide-react';

export default function Collections() {
  const { data: collections = [], isLoading } = useCollections();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-20 bg-gray-50 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-gray-900 mb-6">Bộ Sưu Tập</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">Khám phá những câu chuyện và nguồn cảm hứng đằng sau mỗi thiết kế của MIA Accessories. Mỗi bộ sưu tập là một tuyên ngôn phong cách riêng biệt.</p>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {collections.map((collection: any) => (
            <Link 
              key={collection.id} 
              to={`/collections/${collection.slug}`}
              className="group relative block overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4] lg:aspect-square bg-gray-100"
            >
              <img 
                src={collection.coverImage} 
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                <p className="text-xs uppercase tracking-[0.3em] font-bold mb-3 opacity-80 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Khám Phá Ngay</p>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{collection.name}</h2>
                <div className="overflow-hidden">
                  <p className="text-gray-200 line-clamp-2 max-w-md translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    {collection.description}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-2 font-bold tracking-widest uppercase text-sm border-b-2 border-white/0 group-hover:border-white w-max pb-1 transition-all duration-300">
                  Xem chi tiết <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
