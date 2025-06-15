
import React, { useEffect, useState } from "react";
import { useDropboxFiles, DropboxFileEntry } from "@/hooks/useDropboxFiles";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fileService } from "@/services/file-service";
import { Search, Folder, File as FileIcon, ArrowLeft, Download } from "lucide-react";

interface DropboxFileBrowserProps {
  onImportFile?: (file: DropboxFileEntry) => void;
  onExportFile?: (file: DropboxFileEntry) => void;
}
const DropboxFileBrowser: React.FC<DropboxFileBrowserProps> = ({
  onImportFile,
  onExportFile,
}) => {
  const { files, fetchFiles, openFolder, goUp, loading, error, currentPath, downloadFile } = useDropboxFiles();
  const { toast } = useToast();
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles(""); // Affiche la racine au chargement
  }, [fetchFiles]);

  // Handler pour importer un fichier Dropbox dans LuvviX Cloud
  const handleImport = async (file: DropboxFileEntry) => {
    setImportingId(file.id);
    try {
      toast({
        title: `Import de ${file.name} en cours...`,
        description: "Téléchargement du fichier Dropbox",
      });
      const res = await downloadFile(file);
      if (!res) throw new Error("Échec du téléchargement Dropbox.");

      // Crée un "File" compatible (nom & type correct pour upload, utiliser le nom d'origine et essayer de deviner le type)
      // Essayer de deviner le type du fichier par l'extension (.pdf, .jpg, etc)
      const fname = res.name;
      const ext = fname?.split('.').pop();
      let guessedType = "application/octet-stream";
      if (ext === 'pdf') guessedType = "application/pdf";
      else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) guessedType = `image/${ext.replace('jpg', 'jpeg')}`;
      else if (["mp3", "wav"].includes(ext || "")) guessedType = `audio/${ext}`;
      else if (["mp4", "webm"].includes(ext || "")) guessedType = `video/${ext}`;
      // Créer l'objet File
      const fileToUpload = new File([res.blob], fname, { type: guessedType });

      // Importer sur LuvviX Cloud : placer dans la racine par défaut
      const id = await fileService.uploadFile(fileToUpload, undefined);
      toast({
        title: `Import réussi`,
        description: `"${fname}" ajouté à votre cloud LuvviX.`,
      });

      // Eventuellement, callback pour actualiser la liste côté parent
      if (onImportFile) onImportFile(file);

    } catch (e: any) {
      toast({
        title: "Erreur lors de l'import",
        description: e?.message || "Impossible d'uploader le fichier dans votre cloud",
        variant: "destructive",
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-4 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <ArrowLeft className="w-4 h-4 mr-2 cursor-pointer" onClick={goUp} />
        <span className="font-semibold text-lg flex-1">Dropbox</span>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center mt-8 text-gray-400">Chargement...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : files.length === 0 ? (
          <div className="text-center mt-8 text-gray-400">Dossier vide.</div>
        ) : (
          <table className="w-full">
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.id || file.path_display}
                  className="group hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition-all rounded"
                  onClick={() => openFolder(file)}
                >
                  <td className="py-2 px-2 w-8">
                    {file[".tag"] === "folder" ? (
                      <Folder className="w-5 h-5 text-blue-500" />
                    ) : (
                      <FileIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </td>
                  <td className="py-2 px-2 truncate font-medium max-w-xs">
                    {file.name}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-500 hidden md:table-cell">
                    {file[".tag"] === "file"
                      ? file.size && `${(file.size / 1024).toFixed(0)} KB`
                      : "Dossier"}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-400 hidden md:table-cell">
                    {file[".tag"] === "file" && file.client_modified
                      ? new Date(file.client_modified).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-2 px-2">
                    {file[".tag"] === "file" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mr-2"
                        onClick={e => {
                          e.stopPropagation();
                          handleImport(file);
                        }}
                        disabled={importingId === file.id}
                        title="Importer ce fichier dans mon cloud"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {importingId === file.id ? "Import…" : "Importer"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DropboxFileBrowser;
