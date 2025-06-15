
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fileService } from "@/services/file-service";
import { DropboxFileEntry, useDropboxFiles } from "./useDropboxFiles";
import { useToast } from "@/hooks/use-toast";

// Compare deux listes de fichiers par leur chemin (path_display)
function makeFileMap(files: Array<{ path_display: string }>) {
  const map = new Map<string, any>();
  files.forEach((f) => map.set(f.path_display, f));
  return map;
}

export function useDropboxSync() {
  const { toast } = useToast();

  // Synchronise les fichiers Dropbox <-> Cloud LuvviX
  const syncDropboxAndCloud = useCallback(async () => {
    toast({ title: "Synchronisation Dropbox…", description: "Analyse des fichiers…" });

    // 1. Lister tous les fichiers Dropbox (récursivement)
    let dropboxFiles: DropboxFileEntry[] = [];
    try {
      const { data, error } = await supabase.functions.invoke('dropbox-list-files', {
        body: { path: "", recursive: true }, // on force le listing complet
      });
      if (error || !data?.files) throw error || new Error("Dropbox API error");
      dropboxFiles = data.files.filter((f: DropboxFileEntry) => f[".tag"] === "file");
    } catch (e: any) {
      toast({ title: "Erreur Dropbox", description: e?.message || "Impossible de lister les fichiers Dropbox", variant: "destructive" });
      return;
    }
    const dropboxMap = makeFileMap(dropboxFiles);

    // 2. Lister tous les fichiers cloud (non folders)
    let cloudFiles = await fileService.listFiles();
    cloudFiles = cloudFiles.filter(f => f.type !== "folder");
    const cloudMap = makeFileMap(cloudFiles.map(f => ({ ...f, path_display: "/" + f.name })));

    // 3. Fichiers à importer (présents dans Dropbox, absents dans Cloud)
    const missingInCloud = dropboxFiles.filter(f => !cloudMap.has(f.path_display));
    // 4. Fichiers à exporter (présents dans Cloud, absents dans Dropbox)
    const missingInDropbox = cloudFiles.filter(f => !dropboxMap.has("/" + f.name));

    // 5. Importer tous les nouveaux fichiers de Dropbox
    for (const dropFile of missingInCloud) {
      try {
        toast({ title: `Import de ${dropFile.name} depuis Dropbox…` });
        // télécharger, puis ajouter dans cloud (fileService)
        const { data, error } = await supabase.functions.invoke('dropbox-download-file', {
          body: { path: dropFile.path_display },
        });
        if (error || !data) throw error || new Error("Erreur téléchargement Dropbox");
        // Recrée un fichier compatible
        let blob: Blob;
        if (data instanceof ArrayBuffer) blob = new Blob([data], { type: dropFile?.mime_type || 'application/octet-stream' });
        else if (data instanceof Blob) blob = data;
        else blob = new Blob([]);
        
        const ftype = dropFile.name?.split('.').pop()?.toLowerCase();
        let guessedType = "application/octet-stream";
        if (ftype === 'pdf') guessedType = "application/pdf";
        else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ftype || "")) guessedType = `image/${ftype === "jpg" ? "jpeg" : ftype}`;
        else if (["mp3", "wav"].includes(ftype || "")) guessedType = `audio/${ftype}`;
        else if (["mp4", "webm"].includes(ftype || "")) guessedType = `video/${ftype}`;
        const fileToUpload = new File([blob], dropFile.name, { type: guessedType });

        await fileService.uploadFile(fileToUpload, undefined);
        toast({ title: `${dropFile.name} importé`, description: "Ajouté à LuvviX Cloud." });
      } catch (e: any) {
        toast({ title: "Erreur import Dropbox", description: e?.message || "Erreur", variant: "destructive" });
      }
    }

    // 6. Exporter tous les nouveaux fichiers du cloud vers Dropbox
    for (const localFile of missingInDropbox) {
      try {
        toast({ title: `Export de ${localFile.name} vers Dropbox…` });
        // récupérer le contenu du fichier
        const { metadata, content } = await fileService.getFile(localFile.id) ?? {};
        if (!content) throw new Error("Contenu local introuvable");

        // Appeler la fonction upload Dropbox
        const fileArrayBuffer = await content.arrayBuffer();
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileArrayBuffer)));
        const { error } = await supabase.functions.invoke("dropbox-upload-file", {
          body: {
            file: base64Content,
            filename: localFile.name,
            path: "/" + localFile.name,
            mimetype: localFile.type || "application/octet-stream"
          }
        });
        if (error) throw error;
        toast({ title: `${localFile.name} exporté sur Dropbox` });
      } catch (e: any) {
        toast({ title: "Erreur export Dropbox", description: e?.message || "Erreur", variant: "destructive" });
      }
    }

    toast({ title: "Synchronisation Dropbox terminée" });
  }, [toast]);

  return { syncDropboxAndCloud };
}
