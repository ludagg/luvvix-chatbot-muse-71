
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DropboxFileEntry {
  id: string;
  name: string;
  path_display: string;
  ".tag": "file" | "folder";
  client_modified?: string;
  server_modified?: string;
  size?: number;
  // Ajoute d'autres champs Dropbox si besoin plus tard
}

export function useDropboxFiles() {
  const [files, setFiles] = useState<DropboxFileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Récupère la liste des fichiers d'un dossier Dropbox donné
  const fetchFiles = useCallback(async (path = "") => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('dropbox-list-files', {
        body: { path },
      });
      if (error) throw error;
      if (data?.files) setFiles(data.files);
      setCurrentPath(path);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement Dropbox");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Télécharger un fichier Dropbox en tant que Blob
  const downloadFile = useCallback(async (file: DropboxFileEntry) => {
    if (file[".tag"] !== "file" || !file.path_display) return null;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('dropbox-download-file', {
        body: { path: file.path_display },
        responseType: "arraybuffer"
      });
      if (error) throw error;

      // Tentative d'extraction du nom du header, sinon fallback
      let fileName = file.name;
      let contentType = "application/octet-stream";
      let blob: Blob;
      if (data) {
        if (data instanceof ArrayBuffer) {
          blob = new Blob([data], { type: contentType });
        } else if (data instanceof Blob) {
          blob = data;
        } else {
          // fallback : string/objet, ce n'est pas attendu ici
          blob = new Blob([]);
        }

        return { name: fileName, blob };
      } else {
        throw new Error("Aucune donnée reçue de Dropbox");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement Dropbox");
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Navigation dans les dossiers Dropbox
  const openFolder = async (entry: DropboxFileEntry) => {
    if (entry[".tag"] === "folder") {
      await fetchFiles(entry.path_display);
    }
  };

  // Pour revenir en arrière dans le chemin Dropbox
  const goUp = async () => {
    if (!currentPath || currentPath === "" || currentPath === "/") {
      await fetchFiles(""); // racine
    } else {
      const parent = currentPath.substring(0, currentPath.lastIndexOf("/"));
      await fetchFiles(parent || "");
    }
  };

  return {
    files, loading, error, currentPath,
    fetchFiles, openFolder, goUp, downloadFile
  };
}
