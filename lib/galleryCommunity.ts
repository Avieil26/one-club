import { getSupabase } from '@/lib/supabase';
import type { GallerySubmission } from '@/lib/galleryTypes';
export async function loadGallerySubmissions(setId?: number, pendingOnly = false): Promise<GallerySubmission[]> {
 let query = getSupabase().from('gallery_solutions').select('*').order('created_at', { ascending: false }).limit(60);
 if (setId !== undefined) query = query.eq('set_id', setId);
 if (pendingOnly) query = query.eq('status', 'pending');
 const { data, error } = await query;
 if (error) throw error;
 return (data ?? []) as GallerySubmission[];
}
export async function submitGallerySolution(input: Omit<GallerySubmission, 'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'created_at' | 'proof_paths'>, uris: string[]) {
 const db = getSupabase();
 const paths: string[] = [];
 try {
  for (const uri of uris.slice(0, 3)) {
   const response = await fetch(uri); const bytes = await response.arrayBuffer();
   if (!bytes.byteLength || bytes.byteLength > 10 * 1024 * 1024) throw Error('Invalid proof image');
   const path = `${input.user_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
   const { error } = await db.storage.from('gallery-proofs').upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
   if (error) throw error;
   paths.push(path);
  }
  const { error } = await db.from('gallery_solutions').insert({ ...input, proof_paths: paths });
  if (error) throw error;
 } catch (error) { if (paths.length) await db.storage.from('gallery-proofs').remove(paths); throw error; }
}
export async function moderateGallerySolution(id: string, status: 'approved' | 'rejected') {
 const { error } = await getSupabase().rpc('moderate_gallery_solution', { p_id: id, p_status: status });
 if (error) throw error;
}
export async function galleryProofUrls(paths: string[]) {
 const { data, error } = await getSupabase().storage.from('gallery-proofs').createSignedUrls(paths, 600);
 if (error) throw error;
 return (data ?? []).map(p => p.signedUrl).filter((url): url is string => typeof url === 'string' && !!url);
}
