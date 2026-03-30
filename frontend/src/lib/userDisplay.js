/** Display name for header / sidebar from profile + Supabase user. */
export function getUserDisplayName(user, profile) {
  const fromProfile = profile?.name?.trim();
  if (fromProfile) return fromProfile;
  const meta = user?.user_metadata?.full_name?.trim();
  if (meta) return meta;
  const email = user?.email?.trim();
  if (email) return email.split('@')[0] || email;
  return 'there';
}

export function getUserInitial(user, profile) {
  const name = getUserDisplayName(user, profile);
  return name.charAt(0).toUpperCase() || '?';
}
