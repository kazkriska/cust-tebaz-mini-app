"use server";

import { getCustomerByTgId, createCustomer, updateCustomer } from "@/models/customers";
import { getAllShops } from "@/models/shops";

/**
 * Synchronize Telegram user data with the database.
 * Based on tg_id: check if exists, then create or update.
 */
export async function syncUserAction(userData) {
  const { id: tg_id, username, first_name, last_name } = userData;

  try {
    const existing = await getCustomerByTgId(tg_id);

    if (!existing) {
      // Create new customer
      return await createCustomer({
        tg_id,
        username,
        first_name,
        last_name,
      });
    }

    // Check if any field differs and needs update
    if (
      existing.username !== username ||
      existing.first_name !== (first_name || null) ||
      existing.last_name !== (last_name || null)
    ) {
      return await updateCustomer(existing.id, {
        username,
        first_name,
        last_name,
      });
    }

    return existing;
  } catch (error) {
    console.error("Error in syncUserAction:", error);
    throw error;
  }
}

/**
 * Fetch all shops from the database.
 */
export async function fetchShopsAction() {
  try {
    return await getAllShops();
  } catch (error) {
    console.error("Error in fetchShopsAction:", error);
    throw error;
  }
}
