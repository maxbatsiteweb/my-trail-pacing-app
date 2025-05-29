import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-gray-800"><Link href="https://maximebataille-trailrunning.fr/index" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
            Endurance 142 - Coaching trail
          </Link></h1>

      </div>
    </header>
  );
}
