"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { syncUserAction, fetchShopsAction } from "./actions";
import { getPublicImageUrl } from "@/lib/image-utils";

/**
 * LOADING COMPONENT
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-zinc-200 border-t-black dark:border-zinc-800 dark:border-t-white rounded-full animate-spin"></div>
      <p className="text-zinc-500 font-medium">Loading bazaar...</p>
    </div>
  );
}

/**
 * ERROR COMPONENT
 */
function ErrorCard({ title, message, actionText, onAction }) {
  return (
    <div className="m-4 p-6 bg-amber-50 dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-3xl shadow-sm">
      <h2 className="text-amber-800 dark:text-amber-500 font-bold text-xl mb-2">{title}</h2>
      <p className="text-amber-700 dark:text-zinc-400 mb-6 leading-relaxed">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/**
 * SHOP CARD COMPONENT
 */
function ShopCard({ shop }) {
  const imageUrl = getPublicImageUrl(shop.banner_url);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-all cursor-pointer">
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={shop.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400">
            No banner image
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-xl mb-1 text-black dark:text-white">{shop.name}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
          {shop.description || "Browse this shop for amazing products."}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shops, setShops] = useState([]);
  const [customer, setCustomer] = useState(null);

  const initializeApp = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Initialize Telegram WebApp
      if (typeof window === "undefined" || !window.Telegram?.WebApp) {
        setError({
          title: "Environment Error",
          message: "This app must be opened within Telegram.",
        });
        setLoading(false);
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.expand();

      // 2. Security Check: Block if username is missing
      const user = tg.initDataUnsafe?.user;
      if (!user) {
        setError({
          title: "User Data Missing",
          message: "We couldn't retrieve your Telegram profile. Please try again.",
        });
        setLoading(false);
        return;
      }

      if (!user.username) {
        setError({
          title: "Username Required",
          message: "For security reasons, you must set a Telegram username in your settings before using TeBaz.",
          actionText: "Open Settings",
          onAction: () => tg.close(), // Or instructions to set username
        });
        setLoading(false);
        return;
      }

      // 3. Data Synchronization
      const syncedCustomer = await syncUserAction(user);
      setCustomer(syncedCustomer);

      // 4. Shop Discovery
      const allShops = await fetchShopsAction();
      setShops(allShops);

      setLoading(false);
    } catch (err) {
      console.error("Initialization error:", err);
      setError({
        title: "Connection Error",
        message: "We had trouble connecting to the bazaar. Please check your connection and try again.",
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col min-h-[80vh] justify-center max-w-md mx-auto">
        <ErrorCard
          title={error.title}
          message={error.message}
          actionText={error.actionText}
          onAction={error.onAction}
        />
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-4 pb-20 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-black dark:text-white mb-2">
          TeBaz Bazaar
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Welcome back, {customer?.first_name || "customer"}!
        </p>
      </div>

      {/* Shop Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-xs font-black px-1">
          Explore Shops
        </h2>

        {shops.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            No shops available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Cart Button (Mock for now) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </main>
  );
}
