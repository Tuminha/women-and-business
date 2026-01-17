import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-periospot-blue p-6 text-white">
      <div className="border-4 border-white bg-periospot-red p-12 shadow-[12px_12px_0px_0px_#000000] text-center max-w-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 pointer-events-none"></div>
        <h1 className="text-9xl font-display font-black mb-0 leading-none relative z-10">404</h1>
        <h2 className="text-4xl font-bold uppercase mb-8 relative z-10 border-b-4 border-black inline-block pb-2">
          Page Missing
        </h2>
        <p className="text-xl font-medium mb-10 relative z-10 max-w-lg mx-auto">
          The path you are looking for has been terminated or never existed. 
          Return to base immediately.
        </p>
        <div className="relative z-10">
          <Link 
            href="/"
            className="inline-block bg-white text-black px-10 py-4 font-bold uppercase border-4 border-black hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
