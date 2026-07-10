-- HireWorkers — Phase 7 (custom profile photo upload)
--
-- Creates a public "avatars" Storage bucket and RLS policies so a signed-in
-- user can upload/replace only their own photo (object path must start with
-- their own auth uid, e.g. "<user_id>/avatar.jpg"). Anyone can read (avatars
-- are meant to be public), only the owner can write. Run this in the
-- Supabase SQL editor before deploying code that depends on it.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can replace their own avatar" on storage.objects;
create policy "Users can replace their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
