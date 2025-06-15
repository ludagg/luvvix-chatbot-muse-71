
import React, { useEffect } from "react";
import { useDropboxFiles, DropboxFileEntry } from "@/hooks/useDropboxFiles";
import { Button } from "@/components/ui/button";
import { Search, Folder, File as FileIcon, ArrowLeft, Download, Upload as UploadIcon } from "lucide-react";

interface DropboxFileBrowserProps {
  onImportFile?: (file: DropboxFileEntry) => void;
  onExportFile?: (file: DropboxFileEntry) => void;
}

const DropboxFileBrowser: React.FC<DropboxFileBrowserProps> = ({
  onImportFile,
  onExportFile,
}) => {
  const { files, fetchFiles, openFolder, goUp, loading, error, currentPath } = useDropboxFiles();

  useEffect(() => {
    fetchFiles(""); // Affiche la racine au chargement
  }, [fetchFiles]);

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
                        disabled
                        title="Importer ce fichier dans mon cloud (à venir)"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Importer
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
