
import React, { useEffect, useState } from "react";
import { useDropboxFiles, DropboxFileEntry } from "@/hooks/useDropboxFiles";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fileService } from "@/services/file-service";
import { Folder, File as FileIcon, ArrowLeft, Download, Trash2, Plus, Edit, FolderPlus, UploadCloud } from "lucide-react";

/**
 * Ce composant gère la navigation, suppression, renommage, création de dossiers et upload mobile pour Dropbox.
 */
interface Props {
  onClose?: () => void;
  onRefresh?: () => void;
}

const DropboxFileBrowserMobile: React.FC<Props> = ({ onClose, onRefresh }) => {
  const { files, fetchFiles, openFolder, goUp, loading, error, currentPath, downloadFile } = useDropboxFiles();
  const { toast } = useToast();

  const [actionId, setActionId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRename, setShowRename] = useState<{ entry: DropboxFileEntry, name: string } | null>(null);

  // Navigation initiale dans Dropbox à la racine
  useEffect(() => {
    fetchFiles("");
  }, [fetchFiles]);

  // Helpers pour inférer le type
  const isFolder = (entry: DropboxFileEntry) => entry[".tag"] === "folder";
  const isFile = (entry: DropboxFileEntry) => entry[".tag"] === "file";

  // ============ ACTIONS Dropbox ============

  // Télécharger un fichier
  const handleDownload = async (entry: DropboxFileEntry) => {
    setActionId(entry.id);
    try {
      const result = await downloadFile(entry);
      if (!result) throw new Error("Erreur téléchargement Dropbox");
      // Crée un lien de téléchargement
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Téléchargement lancé", description: "Fichier prêt à être téléchargé." });
    } catch (e: any) {
      toast({ title: "Erreur téléchargement", description: e?.message || "Erreur", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  // Supprimer un fichier/dossier via Edge Function
  const handleDelete = async (entry: DropboxFileEntry) => {
    setActionId(entry.id);
    try {
      const { error } = await fetch("/api/dropbox/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: entry.path_display }),
      }).then(res => res.json());
      if (error) throw new Error(error);
      toast({ title: "Supprimé", description: `“${entry.name}” supprimé de Dropbox.` });
      await fetchFiles(currentPath);
    } catch (e: any) {
      toast({ title: "Erreur suppression", description: e?.message || "Erreur", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  // Renommer un fichier/dossier
  const handleRename = async (entry: DropboxFileEntry, newName: string) => {
    setActionId(entry.id);
    try {
      const { error } = await fetch("/api/dropbox/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_path: entry.path_display, to_path: currentPath + "/" + newName }),
      }).then(res => res.json());
      if (error) throw new Error(error);
      toast({ title: "Renommé", description: `“${entry.name}” renommé.` });
      await fetchFiles(currentPath);
      setShowRename(null);
    } catch (e: any) {
      toast({ title: "Erreur renommage", description: e?.message || "Erreur", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  // Créer un dossier
  const handleCreateFolder = async (folderName: string) => {
    setActionId(folderName);
    try {
      const { error } = await fetch("/api/dropbox/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: (currentPath || "") + "/" + folderName }),
      }).then(res => res.json());
      if (error) throw new Error(error);
      toast({ title: "Dossier créé", description: `"${folderName}" créé.` });
      await fetchFiles(currentPath);
      setShowCreateFolder(false);
    } catch (e: any) {
      toast({ title: "Erreur création dossier", description: e?.message || "Erreur", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  // Upload (importer)
  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files || evt.target.files.length === 0) return;
    const file = evt.target.files[0];
    setActionId(file.name);
    try {
      // Lis le fichier, l'encode en base64
      const arrBuffer = await file.arrayBuffer();
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrBuffer)));
      const { error } = await fetch("/api/dropbox/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64Content,
          filename: file.name,
          path: (currentPath || "") + "/" + file.name,
          mimetype: file.type || "application/octet-stream"
        }),
      }).then(res => res.json());
      if (error) throw new Error(error);
      toast({ title: "Importé", description: `${file.name} uploadé sur Dropbox.` });
      await fetchFiles(currentPath);
      setShowUpload(false);
    } catch (e: any) {
      toast({ title: "Erreur upload", description: e?.message || "Erreur", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  // ============ RENDU UI ============

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={goUp}
          className="p-2 mr-2 bg-gray-50 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="font-medium text-lg flex-1 text-center truncate">Dropbox</div>
        <button className="p-2 rounded-full bg-purple-50 ml-2" onClick={onClose}><span className="text-xs">Fermer</span></button>
      </div>

      {/* Actions globales */}
      <div className="flex gap-2 justify-between p-3 bg-gray-50 border-b border-gray-100">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowUpload(true)}>
          <UploadCloud className="w-4 h-4 mr-1" /> Uploader
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCreateFolder(true)}>
          <FolderPlus className="w-4 h-4 mr-1" /> Nouveau dossier
        </Button>
        {onRefresh && <Button variant="outline" size="sm" onClick={onRefresh}><Plus className="w-4 h-4" /> Refresh</Button>}
      </div>

      {/* Chemin courant */}
      <div className="text-xs text-gray-500 px-4 py-2 truncate">{currentPath || "/"}</div>
      <div className="flex-1 overflow-auto px-2 pb-8">
        {loading ? (
          <div className="text-center mt-20 text-gray-400">Chargement…</div>
        ) : error ? (
          <div className="text-center text-red-500 mt-10">{error}</div>
        ) : files.length === 0 ? (
          <div className="text-center mt-20 text-gray-400">Dossier vide.</div>
        ) : (
          <div className="flex flex-col space-y-2">
            {files.map((file) => (
              <div key={file.id || file.path_display} className="flex items-center px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="mr-3">
                  {isFolder(file) ? (
                    <Folder className="w-6 h-6 text-blue-500" />
                  ) : (
                    <FileIcon className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 truncate min-w-0" onClick={() => isFolder(file) ? openFolder(file) : undefined}>
                  <div className={`font-medium ${isFolder(file) ? "text-blue-800" : "text-gray-900"} truncate cursor-pointer`}>
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-400">{isFile(file) && file.size ? `${(file.size / 1024).toFixed(0)} KB` : "Dossier"}</div>
                </div>
                <div className="flex flex-row items-center gap-2 ml-2">
                  {isFile(file) && (
                    <button
                      className="p-1"
                      aria-label="Télécharger"
                      disabled={actionId === file.id}
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <button
                    className="p-1"
                    aria-label="Renommer"
                    disabled={actionId === file.id}
                    onClick={() => setShowRename({ entry: file, name: file.name })}
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    className="p-1"
                    aria-label="Supprimer"
                    disabled={actionId === file.id}
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowUpload(false)}>
          <div className="bg-white p-4 rounded-t-xl w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4 font-bold">Uploader un fichier</div>
            <input type="file" onChange={handleUpload} className="w-full" />
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowUpload(false)}>Annuler</Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog create folder */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowCreateFolder(false)}>
          <div className="bg-white p-4 rounded-t-xl w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="mb-3">Nom du dossier :</div>
            <input
              type="text"
              className="border px-2 py-1 w-full rounded"
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value;
                  if (v) handleCreateFolder(v);
                }
              }}
            />
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" onClick={() => setShowCreateFolder(false)}>Annuler</Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog rename */}
      {showRename && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowRename(null)}>
          <div className="bg-white p-4 rounded-t-xl w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="mb-3">Nouveau nom pour {showRename.entry.name} :</div>
            <input
              type="text"
              className="border px-2 py-1 w-full rounded"
              value={showRename.name}
              onChange={e => setShowRename({ ...showRename, name: e.target.value })}
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter" && showRename.name) handleRename(showRename.entry, showRename.name);
              }}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowRename(null)}>Annuler</Button>
              <Button variant="default" size="sm" onClick={() => showRename.name && handleRename(showRename.entry, showRename.name)}>Renommer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropboxFileBrowserMobile;
