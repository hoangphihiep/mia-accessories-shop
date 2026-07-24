import { useQuery } from '@tanstack/react-query';
import { CollectionService } from '../services/collection.service';

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => CollectionService.getAll()
  });
};

export const useCollection = (slug: string) => {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: () => CollectionService.getBySlug(slug),
    enabled: !!slug
  });
};
