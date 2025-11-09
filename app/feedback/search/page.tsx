import { getFeedback } from '@/app/actions/feedback';
import { SearchResults } from './SearchResults';

export const metadata = {
  title: 'Search Feedback | DistrictTracker',
  description: 'Search feature requests and bug reports',
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.term === 'string' ? params.term : '';

  // Fetch all feedback for searching
  const { data: allFeedback } = await getFeedback({ sort: 'recent' });

  // Filter results based on search query
  const filteredResults = query
    ? allFeedback.filter((item) => {
        const searchLower = query.toLowerCase();
        return (
          item.title?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.category?.name?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  return <SearchResults query={query} results={filteredResults} />;
}
