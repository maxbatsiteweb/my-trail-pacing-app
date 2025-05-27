import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-gray-800">Endurance 142</h1>
        <nav className="flex space-x-4">
          <Link href="https://www.combloux.com/mon-agenda/temps-forts/la-comblorane/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
            La Comblorane
          </Link>
          <Link href="/https://maximebataille-trailrunning.fr/index" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
            Coaching trail
          </Link>
        </nav>
      </div>
    </header>
  );
}
