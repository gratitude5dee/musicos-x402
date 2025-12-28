-- Step 1: Delete orphan profiles that don't have matching users
DELETE FROM public.profiles
WHERE id NOT IN (SELECT id FROM public.users);

-- Step 2: Drop the incorrect FK that references auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Add a correct FK referencing public.users
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;