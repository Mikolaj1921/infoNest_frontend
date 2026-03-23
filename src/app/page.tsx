// eslint-disable-next-line
import api from '@/lib/axios';

export default function Home() {
  // test axios
  console.log('API URL Check:', process.env.NEXT_PUBLIC_API_URL);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold tracking-tight text-blue-600">
        InfoNest Frontend
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Axios & Env config:{' '}
        <span className="font-mono bg-zinc-100 px-2 py-1 rounded">
          {process.env.NEXT_PUBLIC_API_URL || 'Not Found'}
        </span>
      </p>
    </main>
  );
}
