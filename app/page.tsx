import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 dark:bg-zinc-950">
      <main className="flex w-full max-w-lg flex-col items-center gap-10 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            Your next ride,{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              one tap away.
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Request a ride or accept one. Fast, safe, no hassle.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/ride"
            className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Request a ride
          </Link>
          <Link
            href="/drive"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            Drive with Vaya
          </Link>
        </div>

        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
