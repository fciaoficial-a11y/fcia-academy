
CREATE POLICY "course-pdfs admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course-pdfs admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course-pdfs admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course-pdfs admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'));
