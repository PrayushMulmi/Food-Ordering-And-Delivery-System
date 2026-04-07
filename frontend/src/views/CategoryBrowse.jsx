import { useParams } from 'react-router-dom';
import { Dashboard } from "./Dashboard";

export function CategoryBrowse() {
  const { category } = useParams();
  
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 capitalize">{category} Restaurants</h1>
        <Dashboard />
      </div>
    </div>
  );
}
