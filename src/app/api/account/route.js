import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return Response.json({ message: "Supabase public environment variables are missing." }, { status: 500 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return Response.json({ message: "Please sign in before deleting your account." }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ message: "Account deletion needs SUPABASE_SERVICE_ROLE_KEY on the server." }, { status: 501 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return Response.json({ message: deleteError.message }, { status: 400 });
  }

  return Response.json({ deleted: true });
}
