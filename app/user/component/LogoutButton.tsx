
// import { createClient } from "@/lib/supabase/server";

// export default async function Logout() {
//   const supabase = await createClient();

//   const handleLogout = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       console.error("Logout failed:", error.message);
//     } else {
//       console.log("Successfully logged out");
//       // Optionally redirect or refresh
//       window.location.href = "/login";
//     }
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="px-4 py-2 bg-red-500 text-white rounded"
//     >
//       Logout
//     </button>
//   );
// }
