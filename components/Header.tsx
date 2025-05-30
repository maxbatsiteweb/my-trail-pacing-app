import Link from "next/link";

export default function Header() {
  return (
<header
  className="bg-white shadow-md p-4"
  style={{
    paddingTop: "8px",
    paddingBottom: "8px",
  }}
>
      <div className="flex items-center space-x-4">
        {/* Logo à gauche */}
        <Link href="https://maximebataille-trailrunning.fr/index" target="_blank" rel="noopener noreferrer">
          <img
            src="images/logo_endurance_142.png"
            alt="Logo Endurance 142"
            className="w-12 h-12 object-contain"
          />
        </Link>
        {/* Titre à droite du logo */}
        <h1 className="text-xl font-bold text-black">
          <Link
            href="https://maximebataille-trailrunning.fr/index"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-black"
          >
            Endurance 142 - Coaching trail
          </Link>
        </h1>
      </div>
    </header>
  );
}
