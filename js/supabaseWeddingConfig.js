window.WEDDING_SUPABASE_CONFIG = {
  url: "https://juelrilyjqwaxapuzmcv.supabase.co",
  anonKey: "sb_publishable_k3iNX3XgGdF7WMCJrboFnA_75xEl7Eh",

  tables: {
    households: "households",
    guests: "guests",
  },

  columns: {
    householdId: "id",
    householdCode: "household_code",
    householdName: "household_name",

    guestId: "id",
    guestHouseholdId: "household_id",
    fullName: "full_name",

    contact: "contact",
    attending: "attending",
    dietaryNotes: "dietary_notes",
    message: "message",
    updatedAt: "updated_at",
  },
};
